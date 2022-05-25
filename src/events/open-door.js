import { defineQuery, removeEntity } from '../../static/js/bitecs.js'
import { ID, Event } from '../components/index.js'

export const name = 'open-door'

const query = defineQuery([ID])
export async function execute(world, eventId, eid1, eid2) {
	const references = world.events.references.get(Event.references[eventId])
	const entities = query(world)

	for (let index = 0; index < entities.length; index++) {
		const eid = entities[index]
		if (references.includes(ID.value[eid])) {
			removeEntity(world, eid)
		}
	}
}
