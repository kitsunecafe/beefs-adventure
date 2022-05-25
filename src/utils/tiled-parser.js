import { filter, flat, hasProp, map, pipe, prop, tap } from './helpers.js'
import { match } from './match.js'
import { max, min, mul } from './math.js'
import { Rectangle } from './rectangle.js'

const FlipFlags = Object.values({
	Horizontal: 0x80000000,
	Vertical: 0x40000000,
	Diagonal: 0x20000000,
	Rotated: 0x10000000
})

const LayerName = Object.freeze({
	TileLayer: 'tilelayer',
	ObjectGroup: 'objectgroup',
	ImageLayer: 'imagelayer'
})

const json = url => fetch(url).then(res => res.json())
const eq = b => a => a === b
const eqType = b => a => eq(b)(a.type)
const id = x => x
const href = window.location.href.replace('index.html', '')
const base = new URL(`${href}/static/tiles/maps/`)

export const parseMap = src => {
	const url = new URL(src, base)
	return json(url)
		.then(async res => {
			const {
				tilewidth: tileWidth,
				tileheight: tileHeight,
				backgroundcolor: backgroundColor,
				layers,
				properties
			} = res

			const tileSets = await Promise.all(res.tilesets.map(loadTileSet))

			return {
				tileWidth,
				tileHeight,
				backgroundColor,
				layers,
				tileSets,
				...parseCustomProperties(properties),
				...res
			}
		})
}

export const getDimensions = (level, usePixels) => {
	const usingPixel = usePixels || false

	const sx = usingPixel ? level.tileWidth : 1
	const sy = usingPixel ? level.tileHeight : 1

	if (!level.infinite) return new Rectangle(0, 0, level.width * sx, level.height * sy)

	const layers = level.layers.filter(eqType(LayerName.TileLayer))

	const x = pipe(
		map(prop('startx')),
		map(mul(sx)),
		min,
	)(layers)

	const y = pipe(
		map(prop('starty')),
		map(mul(sy)),
		min
	)(layers)

	const w = pipe(
		map(prop('width')),
		map(mul(sx)),
		max
	)(layers)

	const h = pipe(
		map(prop('height')),
		map(mul(sy)),
		max
	)(layers)
	
	return new Rectangle(x, y, w, h)
}

const parseCustomProperties = pipe(
	map(prop => ([prop.name, prop.value])),
	Object.fromEntries
)

export const getTileSetImageSources = map => (
	Object.fromEntries(map.tileSets.map(ts => ([ts.name, new URL(ts.source, base)])))
)

export const getImageLayerSources = map => (
	Object.fromEntries(
		map.layers
			.filter(eqType(LayerName.ImageLayer))
			.map(l => ([l.name, new URL(l.image, base)]))
	)
)

export const loadTileSet = ({ firstgid, source }) => {
	const url = new URL(source, base)
	return json(url)
		.then(createTileSet)
		.then(tileSet => ({
			firstgid,
			lastgid: getLastGid(firstgid, tileSet),
			...tileSet
		}))
}

const getLastGid = (firstgid, tileSet) => (
	tileSet.tileAmountWidth * Math.floor(
		tileSet.imageHeight / tileSet.tileHeight
	) + firstgid - 1
)

export const createTileSet = json => {
	const {
		image,
		imagewidth: imageWidth,
		imageheight: imageHeight,
		tilewidth: tileWidth,
		tileheight: tileHeight,
		...tileset
	} = json

	const tileAmountWidth = Math.floor(imageWidth / tileWidth)

	return {
		...tileset,
		tileWidth,
		tileHeight,
		source: new URL(image, base),
		imageWidth,
		imageHeight,
		tileAmountWidth,
	}
}


export const parseAnimations = pipe(
	prop('tileSets'),
	filter(hasProp('tiles')),
	map(set => {
		const firstgid = set.firstgid
		const tiles = map(tile => ({ ...tile, gid: tile.id + firstgid, tileSet: set }))(set.tiles)
		return { ...set, tiles }
	}),
	map(prop('tiles')),
	flat(1),
	filter(hasProp('animation')),
	map(tile => ({
		tileSet: tile.tileSet,
		gid: tile.gid,
		type: tile.type,
		firstFrame: tile.id,
		duration: tile.animation[0].duration,
		length: tile.animation.length
	}))
)

export const clearFlags = gid => gid & ~(FlipFlags.reduce((val, flag) => val | flag))

export const loadMap = (map, tileCallback, objectCallback, imageCallback) => {
	map.layers.forEach(loadLayer(map, tileCallback, objectCallback, imageCallback))
}

const loadLayer = (map, tcb, ocb, icb) => layer => {
	match(layer)
		.on(l =>
			map.infinite && eqType(LayerName.TileLayer)(l),
			loadInfiniteTileLayer(tcb)
		)
		.on(eqType(LayerName.TileLayer), loadFixedTileLayer(tcb))
		.on(eqType(LayerName.ObjectGroup), loadObjectLayer(ocb))
		.on(eqType(LayerName.ImageLayer), loadImageLayer(icb))
		.otherwise(id(false))
}

const indexToCoord = w => i => ({ x: i % w, y: Math.floor(i / w) })
const offsetCoord = (dx, dy) => ({ x, y }) => ({ x: x + dx, y: y + dy })

const loadInfiniteTileLayer = cb => layer => {
	layer.chunks.forEach(chunk => {
		loadFixedTileLayer(cb)({
			...chunk,
			x: layer.x + chunk.x,
			y: layer.y + chunk.y
		})
	})
}

const loadFixedTileLayer = cb => layer => {
	const toCoord = indexToCoord(layer.width)
	const offset = offsetCoord(layer.x, layer.y)
	const xy = i => offset(toCoord(i))

	layer.data.forEach((tile, index) => cb(
		tile,
		xy(index)
	))
}

const loadObjectLayer = cb => layer => {
	const offset = offsetCoord(layer.x, layer.y)

	layer.objects.forEach(({ x, y, properties, ...obj }) => cb({
		...offset({ x, y }),
		properties: parseCustomProperties(properties),
		...obj
	}))
}

const loadImageLayer = cb => layer => {
	cb(layer)
}
