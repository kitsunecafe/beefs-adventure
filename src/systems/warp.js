import { addComponent, addEntity, defineQuery, hasComponent, removeEntity } from '../../static/js/bitecs.js'
import { Contact, LoadLevel, Player, Warp } from '../components/index.js'
import { ContactProxy } from '../proxies/contact.js'

export default () => {
	const query = defineQuery([Contact])
	const contact = new ContactProxy(0)

	return world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			contact.eid = entities[index]

			let warp

			if (hasComponent(world, Warp, contact.a) && hasComponent(world, Player, contact.b)) {
				warp = contact.a
			} else if (hasComponent(world, Player, contact.a) && hasComponent(world, Warp, contact.b)) {
				warp = contact.b
			} else {
				continue
			}

			const eid = addEntity(world)
			addComponent(world, LoadLevel, eid)
			LoadLevel.id[eid] = Warp.id[warp]

			removeEntity(world, contact.eid)
		}

		return world
	}
}
