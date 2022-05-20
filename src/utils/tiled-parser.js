import { filter, flat, hasProp, map, pipe, prop, tap } from './helpers.js'
import { match } from './match.js'

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
				width,
				height,
				tilewidth: tileWidth,
				tileheight: tileHeight,
				backgroundcolor: backgroundColor,
				layers,
				properties
			} = res

			const tileSets = await Promise.all(res.tilesets.map(loadTileSet))

			return {
				width,
				height,
				tileWidth,
				tileHeight,
				backgroundColor,
				layers,
				tileSets,
				...parseCustomProperties(properties)
			}
		})
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
		const tiles = map(tile => ({ ...tile, gid: tile.id + firstgid }))(set.tiles)
		return { ...set, tiles }
	}),
	map(prop('tiles')),
	flat(1),
	filter(hasProp('animation')),
	map(tile => ({
		gid: tile.gid,
		type: tile.type,
		firstFrame: tile.id,
		duration: tile.animation[0].duration,
		length: tile.animation.length
	}))
)

export const clearFlags = gid => gid & ~(FlipFlags.reduce((val, flag) => val | flag))

export const loadMap = (map, tileCallback, objectCallback, imageCallback) => {
	map.layers.forEach(loadLayer(tileCallback, objectCallback, imageCallback))
}

const loadLayer = (tcb, ocb, icb) => layer => {
	match(layer)
		.on(eqType(LayerName.TileLayer), loadTileLayer(tcb))
		.on(eqType(LayerName.ObjectGroup), loadObjectLayer(ocb))
		.on(eqType(LayerName.ImageLayer), loadImageLayer(icb))
		.otherwise(id(false))
}

const indexToCoord = w => i => ({ x: i % w, y: Math.floor(i / w) })
const offsetCoord = (dx, dy) => ({ x, y }) => ({ x: x + dx, y: y + dy })

const loadTileLayer = cb => layer => {
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

	layer.objects.forEach(({ x, y, ...obj }) => cb({
		...offset({ x, y }),
		...obj
	}))
}

const loadImageLayer = cb => layer => {
	cb(layer)
}
