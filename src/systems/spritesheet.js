import { defineQuery, enterQuery } from 'https://esm.run/bitecs'
import { SpriteSheet, Texture } from '../components/index.js'

export default () => {
	const query = enterQuery(defineQuery([SpriteSheet]))

	return world => {
		query(world).forEach(id => {
			const tid = SpriteSheet.texture[id]
			const tex = world.textures[tid]
			SpriteSheet.columns[id] = Math.floor(tex.width / SpriteSheet.frameWidth[id])
			SpriteSheet.rows[id] = Math.floor(tex.height / SpriteSheet.frameHeight[id])
		})

		return world
	}
}
