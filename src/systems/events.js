import { defineQuery, enterQuery, hasComponent, removeComponent, removeEntity } from '../../static/js/bitecs.js'
import { Contact, Event, Player } from '../components/index.js'
import { ContactProxy } from '../proxies/contact.js'

export default () => {
	const query = defineQuery([Contact])
	const createdQuery = enterQuery(defineQuery([Event]))
	const contact = new ContactProxy(0)

	return world => {
		const events = Object.values(world.events)
		const created = createdQuery(world)
		for (let index = 0; index < created.length; index++) {
			const eid = created[index]
			const event = events[Event.id[eid]]

			if (event.init) {
				event.init(world, eid)
			}
		}

		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			contact.eid = entities[index]
			let eid

			if (hasComponent(world, Event, contact.a) && hasComponent(world, Player, contact.b)) {
				eid = contact.a
			} else if (hasComponent(world, Event, contact.b) && hasComponent(world, Player, contact.a)) {
				eid = contact.b
			} else {
				continue
			}

			events[Event.id[eid]]?.execute(world, eid, contact.a, contact.b)
			removeComponent(world, Event, eid)
			removeEntity(world, contact.eid)
		}

		return world
	}
}

