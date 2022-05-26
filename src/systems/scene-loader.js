import { addComponent, defineQuery, Not, removeEntity } from '../../static/js/bitecs.js'
import { getTileSetImageSources, getImageLayerSources, loadMap, parseMap, parseAnimations, clearFlags, getDimensions } from '../utils/tiled-parser.js'
import { createAnimation, createAudio, createCamera, createCheckpoint, createCoin, createCollider, createDamageZone, createEvent, createPlayer, createSprite, createSpriteSheet, createWarp } from '../utils/constructors.js'
import { hasProp, prop, createImage, map, mapObj, pipe, range, zip, isNull, tap, groupBy } from '../utils/helpers.js'
import { Rectangle } from '../utils/rectangle.js'
import * as Component from '../components/index.js'
import { hexToRGB } from '../utils/color.js'
import Store from '../utils/store.js'
import { addArchetype, setValues } from '../utils/archetype.js'
import { Sprite } from '../archetypes/sprite.js'
import { toCartesian } from '../utils/math.js'

const loadImages = map => {
	const keys = Object.keys(map)

	return Promise.all(Object.values(map).map(createImage)).then(zip.bind(null, keys))
}

const allEntitiesQuery = defineQuery([Not(Component.Persistent)])
const removeAllEntities = world => {
	const entities = allEntitiesQuery(world)
	for (let i = 0; i < entities.length; i++) {
		const id = entities[i]
		removeEntity(world, id)
	}
}

const loadLevel = canvas => async (world, level) => {
	removeAllEntities(world)

	const gl = canvas.g
	const reqMap = await parseMap(level)
	const dim = getDimensions(reqMap, true)
	const boundsWidth = Math.max(canvas.c.width, dim.width)
	const boundsHeight = Math.max(canvas.c.height, dim.height)
	world.bounds = new Rectangle(dim.x + 16, dim.y, boundsWidth, boundsHeight)

	if (reqMap.backgroundColor) {
		const color = hexToRGB(reqMap.backgroundColor)
		canvas.bkg(...color)
	}

	const tileSetImageSources = getTileSetImageSources(reqMap)
	const imageLayerSources = getImageLayerSources(reqMap)

	const tileSetImages = await loadImages(tileSetImageSources)
	const layerImages = await loadImages(imageLayerSources)

	const images = Object.assign({}, tileSetImages, layerImages)
	const keys = Object.keys(images)

	world.textures = Object.values(images).map(img => TCTex(gl, img, img.width, img.height))
	world.textureIDs = zip(keys, range(world.textures.length))

	const tileSetSpriteSheets = pipe(
		map(ts => ([
			ts.name,
			createSpriteSheet(world, world.textureIDs[ts.name], {
				frameWidth: ts.tileWidth,
				frameHeight: ts.tileHeight
			})
		])),
		Object.fromEntries
	)(reqMap.tileSets)

	reqMap.tileSets.forEach(ts => {
		ts.eid = tileSetSpriteSheets[ts.name]
	})

	const imageSpriteSheets = mapObj(
		([name, image]) => ([
			name,
			createSpriteSheet(world, world.textureIDs[name], {
				frameWidth: image.width,
				frameHeight: image.height
			})
		])
	)(layerImages)

	const spriteSheets = Object.assign({}, tileSetSpriteSheets, imageSpriteSheets)
	const animations = pipe(
		parseAnimations,
		map(anim => ({
			...anim,
			eid: createAnimation(world, anim.length, anim.duration, anim.firstFrame)
		})),
		groupBy(anim => anim.tileSet.name),
		mapObj(([key, val]) => ([
			key,
			pipe(
				groupBy(anim => anim.type || anim.gid),
				mapObj(([key, val]) => ([key, val[0]]))
			)(val)
		])),
	)(reqMap)

	if (reqMap.bgm) {
		const id = world.audioIDs[reqMap.bgm]
		if (id) {
			createAudio(world, id, { loop: true })
		}
	}

	const getSpriteSheet = id => {
		return reqMap.tileSets.find(ts => id >= ts.firstgid && id <= ts.lastgid)
	}

	world.events.references = new Store(128)

	loadMap(
		reqMap,
		(tile, position) => {
			if (!tile) return

			const spriteSheet = getSpriteSheet(tile)
			if (!spriteSheet) return

			const sseid = spriteSheets[spriteSheet.name]
			const anims = animations[spriteSheet.name]

			const cGid = clearFlags(tile)
			const gid = cGid - spriteSheet.firstgid

			const x = (position.x * spriteSheet.tileWidth) + (spriteSheet.tileWidth / 2)
			const y = (position.y * spriteSheet.tileHeight) + (spriteSheet.tileHeight / 2)

			const eid = createSprite(world, sseid, gid, x, y)

			if (hasProp(cGid)(anims)) {
				addComponent(world, Component.CurrentAnimation, eid)
				const anim = prop(cGid)(anims)
				Component.CurrentAnimation.id[eid] = anim.eid
			}
		},
		(obj) => {
			const spriteSheet = getSpriteSheet(obj.gid)
			if (obj.type === 'playerSpawn') {
				const sseid = spriteSheets[spriteSheet.name]

				if (isNull(world.player)) {
					const anims = animations[spriteSheet.name]

					world.player = createPlayer(
						world,
						sseid,
						anims,
						obj.id,
						obj.x,
						obj.y,
						spriteSheet.tileWidth,
						spriteSheet.tileHeight
					)

				} else {
					Component.Sprite.spritesheet[world.player] = sseid

					addComponent(world, Component.Translate, world.player)
					Component.Translate.x[world.player] = obj.x
					Component.Translate.y[world.player] = obj.y
				}
				
				createCamera(world, canvas.c, world.player)
			} else if (obj.type === 'coin') {
				const sseid = spriteSheets[spriteSheet.name]
				const anims = animations[spriteSheet.name]

				const width = spriteSheet.tileWidth
				const height = spriteSheet.tileHeight

				const dx = reqMap.tileWidth - width
				const dy = reqMap.tileHeight - height

				createCoin(
					world,
					sseid,
					anims,
					obj.x + dx + (width / 2),
					obj.y + dy - (height / 2),
					width,
					height,
					dx,
					dy
				)
			} else if (obj.type === 'collider') {
				const oneWay = hasProp('oneWay')(obj.properties) && obj.properties.oneWay
				const eid = createCollider(world, obj.x, obj.y, obj.width, obj.height, oneWay)
				Component.ID.value[eid] = obj.id
			} else if (obj.type === 'checkpoint') {
				createCheckpoint(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'damageZone') {
				createDamageZone(world, obj.x, obj.y, obj.width, obj.height)

			} else if (obj.type === 'event' && obj.name === 'warp') {
				if (hasProp('level')(obj.properties)) {
					createWarp(world, obj.x, obj.y, obj.width, obj.height, obj.properties.level)
				}
			} else if (obj.type === 'event') {
				const references = hasProp('references')(obj.properties) && obj.properties.references.split(',').map(n => parseInt(n, 10))
				const id = world.events.references.add(references)
				const [x, y] = toCartesian(obj.width, obj.height)(obj.x, obj.y)
				const eid = createEvent(world, x, y, obj.width, obj.height, obj.name, id)

				if (eid > -1 && spriteSheet) {
					const sseid = spriteSheets[spriteSheet.name]
					const cGid = clearFlags(obj.gid)
					const gid = cGid - spriteSheet.firstgid

					pipe(
						addArchetype(world, Sprite),
						setValues(Component.ID, { value: obj.id }),
						setValues(Component.Sprite, {
							spritesheet: sseid,
							frame: gid,
							index: 1
						})
					)(eid)
				}
			} else {
				if (spriteSheet) {
					const sseid = spriteSheets[spriteSheet.name]
					const [x, y] = toCartesian(obj.width, obj.height)(obj.x, obj.y)
					const cGid = clearFlags(obj.gid)
					const gid = cGid - spriteSheet.firstgid

					createSprite(
						world,
						sseid,
						gid,
						x,
						y,
						{ id: obj.id }
					)
				}
			}
		},
		img => {
			const spriteSheet = spriteSheets[img.name]

			const width = Component.SpriteSheet.frameWidth[spriteSheet]
			const height = Component.SpriteSheet.frameHeight[spriteSheet]

			const countx = img.repeatx ? world.bounds.xMax / width : 1
			const county = img.repeaty ? world.bounds.yMax / height : 1

			const ox = img.offsetx || 0
			const oy = img.offsety || 0

			const sx = ox + img.x - reqMap.tileWidth
			const sy = oy + img.y - reqMap.tileHeight

			const px = img.parallaxx || 1
			const py = img.parallaxy || 1

			const startx = px !== 1 && img.repeatx ? -1 : 0
			const starty = py !== 1 && img.repeaty ? -1 : 0

			for (let y = starty; y < county; y++) {
				for (let x = startx; x < countx; x++) {
					createSprite(
						world,
						spriteSheets[img.name],
						0,
						sx + (width * x),
						sy + (height * y),
						{ px, py }
					)
				}
			}
		}
	)
}

export default (canvas) => {
	const query = defineQuery([Component.LoadLevel])
	const load = loadLevel(canvas)

	return async world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			const id = entities[index]
			const level = world.scenes[Component.LoadLevel.id[id]]

			removeEntity(world, id)
			await load(world, level)
		}

		return world
	}
}
