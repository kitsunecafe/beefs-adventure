import { match } from './match.js'
const json = url => fetch(url).then(res => res.json())

const base = new URL(`${window.location.origin}/static/tiles/maps/`)

export const parseMap = src => {
	const url = new URL(src, base)
	return json(url)
		.then(async res => {
			const {
				width,
				height,
				tilewidth: tileWidth,
				tileheight: tileHeight,
				layers
			} = res

			const tileSets = await Promise.all(res.tilesets.map(parseTileSet))

			return {
				width,
				height,
				tileWidth,
				tileHeight,
				layers,
				tileSets
			}
		})
}

export const getMapAssets = map => (
	Object.fromEntries(map.tileSets.map(ts => ([ts.name, ts.source])))
)

export const parseTileSet = ({ firstgid, source }) => {
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
		name,
		image,
		imagewidth: imageWidth,
		imageheight: imageHeight,
		tilewidth: tileWidth,
		tileheight: tileHeight
	} = json

	const tileAmountWidth = Math.floor(imageWidth / tileWidth)

	return {
		name,
		tileWidth,
		tileHeight,
		source: new URL(image, base),
		imageWidth,
		imageHeight,
		tileAmountWidth,
	}
}

export const loadMap = (map, tileCallback, objectCallback) => {
	map.layers.forEach(loadLayer(tileCallback, objectCallback))
}

const eqType = b => a => a.type === b
const id = x => x

const loadLayer = (tcb, ocb) => layer => {
	match(layer)
		.on(eqType('tilelayer'), loadTileLayer(tcb))
		.on(eqType('objectgroup'), loadObjectLayer(ocb))
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