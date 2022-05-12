import { defineQuery, removeEntity } from 'https://esm.run/bitecs'
import { Contact } from '../components/index.js'

export default () => {
	const query = defineQuery([Contact])

	return world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			removeEntity(world, entities[index])
		}

		return world
	}
}

