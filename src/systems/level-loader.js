import { defineQuery, removeEntity } from 'https://esm.run/bitecs'
import { getMapAssets, loadMap, parseMap } from '../utils/tiled-parser.js'
import { createCamera, createCheckpoint, createCoin, createCollider, createDamageZone, createPlayer, createSprite, createSpriteSheet } from '../utils/constructors.js'
import { load, range, zip } from '../utils/helpers.js'
import { Rectangle } from '../utils/rectangle.js'
import { LoadLevel, Position } from '../components/index.js'

const loadImages = map => {
	const keys = Object.keys(map)

	return Promise.all(Object.values(map).map(load)).then(zip.bind(null, keys))
}

const loadLevel = canvas => async (world, level) => {
	const gl = canvas.g
	const map = await parseMap(level)
	const pixelWidth = map.width * 16
	const pixelHeight = map.height * 16
	world.bounds = new Rectangle(-(pixelWidth / 4), -(pixelHeight / 4), pixelWidth, pixelHeight)
	const imageSources = getMapAssets(map)

	const images = await loadImages(imageSources)
	const keys = Object.keys(images)
	world.textures = Object.values(images).map(img => TCTex(gl, img, img.width, img.height))
	world.textureIDs = zip(keys, range(world.textures.length))

	map.tileSets.forEach(ts => {
		ts.eid = createSpriteSheet(world, world.textureIDs[ts.name], {
			frameWidth: ts.tileWidth,
			frameHeight: ts.tileHeight
		})
	})

	const getSpriteSheet = id => {
		return map.tileSets.find(ts => id >= ts.firstgid && id <= ts.lastgid)
	}

	let coinFactory

	loadMap(
		map,
		(tile, position) => {
			if (!tile) return
			const spriteSheet = getSpriteSheet(tile)
			if (!spriteSheet) return
			createSprite(
				world,
				spriteSheet.eid,
				tile - spriteSheet.firstgid,
				(position.x * spriteSheet.tileWidth) + (spriteSheet.tileWidth / 2),
				(position.y * spriteSheet.tileHeight) + (spriteSheet.tileHeight / 2),
				0, // rotation
				0, // scaleX
				0 // scaleY
			)
		},
		(obj) => {
			const spriteSheet = getSpriteSheet(obj.gid)
			if (obj.type === 'playerSpawn') {
				const eid = createPlayer(world, spriteSheet.eid)(
					obj.x,
					obj.y
				)


				createCamera(world, canvas.c, eid)
			} else if (obj.type === 'coin') {
				if (!coinFactory) {
					coinFactory = createCoin(world, spriteSheet.eid)
				}

				coinFactory(obj.x, obj.y)
			} else if (obj.type === 'collider') {
				createCollider(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'checkpoint') {
				createCheckpoint(world, obj.x, obj.y, obj.width, obj.height)
			} else if (obj.type === 'damageZone') {
				createDamageZone(world, obj.x, obj.y, obj.width, obj.height)
			}
		}
	)

	console.log('loaded', level)
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
