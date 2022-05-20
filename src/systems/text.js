import { addComponent, defineQuery, enterQuery, exitQuery, removeEntity } from '../../static/js/bitecs.js'
import { Collider, Sprite, SpriteSheet, Text } from '../components/index.js'
import { createSpriteSheet } from '../utils/constructors.js'
import { createImage } from '../utils/helpers.js'

// https://pqina.nl/blog/wrap-text-with-html-canvas/
const createSvg = (width, height, text, options) => `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
		<foreignObject x="0" y="0" width="${width}" height="${height}">
				<style>
				div {
						margin:0;
						font-weight: normal;
						font-family: ${options.family};
						font-size: ${options.size}px;
						line-height: ${options.lineHeight}px;
				}
				</style>
				<div xmlns="http://www.w3.org/1999/xhtml">
						${text}
				</div>
		</foreignObject>
</svg>
`

const defaultOptions = {
	color: '#000000',
	align: 'left',
	baseline: 'middle',
	size: 12,
	lineHeight: 16,
	family: 'verdana'
}

const createTexture = (width, height, text, options) => {
	const opts = Object.assign({}, defaultOptions, options)
	const svg = createSvg(width, height, text, opts)
	const encoded = svg.replace(/\n/g, '').replace(/"/g, "'")
	return `data:image/svg+xml,${encoded}`
}

export default () => {
	const query = defineQuery([Collider, Text])
	const createdQuery = enterQuery(query)
	const removedQuery = exitQuery(query)

	return world => {
		const removed = removedQuery(world)
		for (let i = 0; i < removed.length; i++) {
			const eid = removed[i]
			const spriteSheet = Sprite.spritesheet[eid]
			const index = SpriteSheet.texture[spriteSheet]
			world.textures[index] = null
			removeEntity(world, spriteSheet)
			removeEntity(world, eid)
		}

		const created = createdQuery(world)
		for (let i = 0; i < created.length; i++) {
			const eid = created[i]
			const dataUrl = createTexture(
				Collider.width[eid],
				Collider.height[eid],
				world.text.get(
					Text.id[eid]
				)
			)

			createImage(dataUrl).then(img => {
				const texture = TCTex(world.canvas.g, img, img.width, img.height)
				const index = world.textures.push(texture) - 1

				const spriteSheet = createSpriteSheet(world, index, {
					frameWidth: img.width,
					frameHeight: img.height
				})

				addComponent(world, Sprite, eid)
				Sprite.spritesheet[eid] = spriteSheet
				Sprite.scaleX[eid] = 1
				Sprite.scaleY[eid] = 1
			})
		}

		// const entities = query(world)
		// for (let i = 0; i < entities.length; i++) {
		// 	const eid = entities[i]
		// 	const text = world.text.get(Text.id[eid])
		// }

		return world
	}
}

