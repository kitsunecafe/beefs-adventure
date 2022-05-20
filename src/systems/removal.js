import { defineQuery, removeEntity } from '../../static/js/bitecs.js'
import { Remove } from '../components/index.js'

export default () => {
	const query = defineQuery([Remove])

	return world => {
		const entities = query(world)
		const elapsed = world.time.elapsed

		for (let i = 0; i < entities.length; i++) {
			const id = entities[i]

			if (Remove.time[id] < elapsed) {
				removeEntity(world, id)
			}
		}

		return world
	}
}

