import { defineQuery, hasComponent, removeEntity } from 'https://esm.run/bitecs'
import { Contact, Checkpoint, LastCheckpoint } from '../components/index.js'
import { ContactProxy } from '../proxies/contact.js'

export default () => {
	const query = defineQuery([Contact])
	const contact = new ContactProxy(0)

	return world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			contact.eid = entities[index]

			let checkpoint
			let lastCheckpoint

			if (hasComponent(world, Checkpoint, contact.a) && hasComponent(world, LastCheckpoint, contact.b)) {
				checkpoint = contact.a
				lastCheckpoint = contact.b
			} else if (hasComponent(world, Checkpoint, contact.b) && hasComponent(world, LastCheckpoint, contact.a)) {
				checkpoint = contact.b
				lastCheckpoint = contact.a
			} else {
				continue
			}

			LastCheckpoint.id[lastCheckpoint] = checkpoint
			removeEntity(world, contact.eid)
		}

		return world
	}
}
