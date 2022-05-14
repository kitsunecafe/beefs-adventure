import { defineQuery, removeEntity } from 'https://esm.run/bitecs'
import { Audio } from '../components/index.js'

export default () => {
	const query = defineQuery([Audio])

	return world => {
		const entities = query(world)

		for (let i = 0; i < entities.length; i++) {
			const id = entities[i]
			const aid = Audio.id[id]

			const source = world.audioContext.createBufferSource()
			source.buffer = world.audio[aid]
			source.connect(world.audioContext.destination)
			source.start(0)
			removeEntity(world, id)
		}
		return world
	}
}

