import { addComponent, defineQuery, Not, removeEntity } from '../../static/js/bitecs.js'
import { getTileSetImageSources, getImageLayerSources, loadMap, parseMap, parseAnimations, clearFlags, getDimensions } from '../utils/tiled-parser.js'
import { createAnimation, createAudio, createCamera, createCheckpoint, createCoin, createCollider, createDamageZone, createEvent, createPlayer, createSprite, createSpriteSheet, createText, createWarp } from '../utils/constructors.js'
import { hasProp, prop, createImage, map, mapObj, pipe, range, zip, isNull } from '../utils/helpers.js'
import { Rectangle } from '../utils/rectangle.js'
import { CurrentAnimation, LoadLevel, Persistent, Translate, Sprite, SpriteSheet } from '../components/index.js'
import { hexToRGB } from '../utils/color.js'

const loadImages = map => {
	const keys = Object.keys(map)

	return Promise.all(Object.values(map).map(createImage)).then(zip.bind(null, keys))
}

const allEntitiesQuery = defineQuery([Not(Persistent)])
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
	world.bounds = new Rectangle(dim.x + 16, -canvas.c.height / 2, boundsWidth + 16, boundsHeight)
	console.log(world.bounds)

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
		map(anim => [anim.gid, anim]),
		Object.fromEntries
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

	let coinFactory

	loadMap(
		reqMap,
		(tile, position) => {
			if (!tile) return

			const spriteSheet = getSpriteSheet(tile)
			if (!spriteSheet) return

			const sseid = spriteSheets[spriteSheet.name]
			const cGid = clearFlags(tile)
			const gid = cGid - spriteSheet.firstgid

			const eid = createSprite(
				world,
				sseid,
				gid,
				(position.x * spriteSheet.tileWidth) + (spriteSheet.tileWidth / 2),
				(position.y * spriteSheet.tileHeight) + (spriteSheet.tileHeight / 2),
			)

			if (hasProp(cGid)(animations)) {
				addComponent(world, CurrentAnimation, eid)
				const anim = prop(cGid)(animations)
				CurrentAnimation.id[eid] = anim.eid
			}
		},
		(obj) => {
			const spriteSheet = getSpriteSheet(obj.gid)

			if (obj.type === 'playerSpawn') {
					const sseid = spriteSheets[spriteSheet.name]
				if (isNull(world.player)) {
					const eid = createPlayer(world, sseid, animations, obj.x, obj.y)
					world.player = eid

					createCamera(world, canvas.c, eid)
				} else {
					Sprite.spritesheet[world.player] = sseid
					addComponent(world, Translate, world.player)
					Translate.x[world.player] = obj.x
					Translate.y[world.player] = obj.y
				}
			} else if (obj.type === 'coin') {
				const sseid = spriteSheets[spriteSheet.name]
				if (!coinFactory) {
					coinFactory = createCoin(world, sseid, animations)
				}

				coinFactory(obj.x + 4, obj.y)
			} else if (obj.type === 'collider') {
				createCollider(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'checkpoint') {
				createCheckpoint(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'damageZone') {
				createDamageZone(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'warp') {
				const level = obj.properties.find(prop => prop.name === 'level').value
				createWarp(world, obj.x, obj.y, obj.width, obj.height, level)
			} else if (obj.type === 'event') {
				createEvent(world, obj.x, obj.y, obj.width, obj.height, obj.name)
			}
		},
		img => {
			const spriteSheet = spriteSheets[img.name]

			const width = SpriteSheet.frameWidth[spriteSheet]
			const height = SpriteSheet.frameHeight[spriteSheet]

			const countx = img.repeatx ? world.bounds.xMax / width : 1
			const county = img.repeaty ? world.bounds.yMax / height : 1

			const sx = img.offsetx + img.x - reqMap.tileWidth
			const sy = img.offsety + img.y - reqMap.tileHeight

			const px = img.parallaxx || 1
			const py = img.parallaxy || 1

			const startx = px === 1 ? 0 : -1
			const starty = py === 1 ? 0 : -1

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
	const query = defineQuery([LoadLevel])
	const load = loadLevel(canvas)

	return async world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			const id = entities[index]
			const level = world.levels[LoadLevel.id[id]]

			removeEntity(world, id)
			await load(world, level)
		}

		return world
	}
}
