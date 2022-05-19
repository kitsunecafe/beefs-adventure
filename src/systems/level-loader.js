import { addComponent, defineQuery, getAllEntities, removeEntity } from '/static/js/bitecs.mjs'
import { getTileSetImageSources, getImageLayerSources, loadMap, parseMap, parseAnimations, clearFlags } from '../utils/tiled-parser.js'
import { createAnimation, createCamera, createCheckpoint, createCoin, createCollider, createDamageZone, createPlayer, createSprite, createSpriteSheet, createWarp } from '../utils/constructors.js'
import { hasProp, prop, load, map, mapObj, pipe, range, zip } from '../utils/helpers.js'
import { Rectangle } from '../utils/rectangle.js'
import { CurrentAnimation, LoadLevel, SpriteSheet } from '../components/index.js'
import { hexToRGB } from '../utils/color.js'

const loadImages = map => {
	const keys = Object.keys(map)

	return Promise.all(Object.values(map).map(load)).then(zip.bind(null, keys))
}

const removeAllEntities = world => {
	const entities = getAllEntities(world)
	for (let i = 0; i < entities.length; i++) {
		const id = entities[i]
		removeEntity(world, id)
	}
}

const loadLevel = canvas => async (world, level) => {
	removeAllEntities(world)

	const gl = canvas.g
	const reqMap = await parseMap(level)
	const pixelWidth = reqMap.width * reqMap.tileWidth
	const pixelHeight = reqMap.height * reqMap.tileHeight
	world.bounds = new Rectangle(0, 0, pixelWidth, pixelHeight)

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
		map(anim => [anim.firstFrame, anim]),
		Object.fromEntries
	)(reqMap)

	console.log(animations)

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
			const gid = clearFlags(tile) - spriteSheet.firstgid
			const eid = createSprite(
				world,
				sseid,
				gid,
				(position.x * spriteSheet.tileWidth) + (spriteSheet.tileWidth / 2),
				(position.y * spriteSheet.tileHeight) + (spriteSheet.tileHeight / 2),
			)

			if (hasProp(gid)(animations)) {
				addComponent(world, CurrentAnimation, eid)
				const anim = prop(gid)(animations)
				CurrentAnimation.id[eid] = anim.eid
				console.log(eid, 'has animation', anim)
			}
		},
		(obj) => {
			const spriteSheet = getSpriteSheet(obj.gid)

			if (obj.type === 'playerSpawn') {
				const sseid = spriteSheets[spriteSheet.name]
				const eid = createPlayer(world, sseid)(
					obj.x,
					obj.y
				)

				createCamera(world, canvas.c, eid)
			} else if (obj.type === 'coin') {
				const sseid = spriteSheets[spriteSheet.name]
				if (!coinFactory) {
					coinFactory = createCoin(world, sseid)
				}

				coinFactory(obj.x, obj.y)
			} else if (obj.type === 'collider') {
				createCollider(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'checkpoint') {
				createCheckpoint(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'damageZone') {
				createDamageZone(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'warp') {
				const level = obj.properties.find(prop => prop.name === 'level').value
				createWarp(world, obj.x, obj.y, obj.width, obj.height, level)
			}
		},
		img => {
			const spriteSheet = spriteSheets[img.name]

			const width = SpriteSheet.frameWidth[spriteSheet]
			const height = SpriteSheet.frameHeight[spriteSheet]

			const countx = img.repeatx ? reqMap.width * reqMap.tileWidth / width : 1
			const county = img.repeaty ? reqMap.height * reqMap.tileHeight / height : 1

			const sx = img.offsetx + img.x - reqMap.tileWidth
			const sy = img.offsety + img.y - reqMap.tileHeight

			for (let y = 0; y < county; y++) {
				for (let x = 0; x < countx; x++) {
					createSprite(
						world,
						spriteSheets[img.name],
						0,
						sx + (width * x),
						sy + (height * y)
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
