import { defineQuery, enterQuery, exitQuery, removeEntity } from '../../static/js/bitecs.js'
import { Audio } from '../components/index.js'

export default () => {
	const query = defineQuery([Audio])
	const createdQuery = enterQuery(query)
	const removedQuery = exitQuery(query)

	const active = new Map()

	return world => {

		const created = createdQuery(world)
		for (let i = 0; i < created.length; i++) {
			const eid = created[i]
			const aid = Audio.id[eid]

			const source = world.audioContext.createBufferSource()
			source.buffer = world.audio[aid]
			source.connect(world.audioContext.destination)
			source.start(0)
			source.loop = Audio.loop[eid] === 1
			source.ended = false
			source.onended = () => source.ended = true
			active.set(eid, source)
			// removeEntity(world, id)
		}

		const removed = removedQuery(world)
		for (let i = 0; i < removed.length; i++) {
			const eid = removed[i]
			const source = active.get(eid)
			source.stop()
			active.delete(eid)
		}

		const entities = query(world)
		for (let i = 0; i < entities.length; i++) {
			const eid = entities[i]
			const source = active.get(eid)

			if (source.ended) {
				removeEntity(world, eid)
			}
		}

		return world
	}
}

