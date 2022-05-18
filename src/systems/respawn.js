import { addComponent, defineQuery, hasComponent, removeEntity } from '/static/js/bitecs.mjs'
import { Contact, DamageZone, LastCheckpoint, Position, Translate } from '../components/index.js'
import { ContactProxy } from '../proxies/contact.js'

export default () => {
	const query = defineQuery([Contact])
	const contact = new ContactProxy(0)

	return world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			contact.eid = entities[index]

			let entity

			if (hasComponent(world, DamageZone, contact.a) && hasComponent(world, LastCheckpoint, contact.b)) {
				entity = contact.b
			} else if (hasComponent(world, DamageZone, contact.b) && hasComponent(world, LastCheckpoint, contact.a)) {
				entity = contact.a
			} else {
				continue
			}

			const checkpoint = LastCheckpoint.id[entity]

			if (hasComponent(world, Position, entity)) {
				addComponent(world, Translate, entity)
				Translate.x[entity] = Position.x[checkpoint]
				Translate.y[entity] = Position.y[checkpoint]
			}
			removeEntity(world, contact.eid)
		}

		return world
	}
}
