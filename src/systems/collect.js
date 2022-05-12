import { defineQuery, hasComponent, removeEntity } from 'https://esm.run/bitecs'
import { Coin, Contact, Purse } from '../components/index.js'
import { ContactProxy } from '../proxies/contact.js'

export default () => {
	const query = defineQuery([Contact])
	const contact = new ContactProxy(0)

	return world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			contact.eid = entities[index]
			let purse
			let coin

			if (hasComponent(world, Coin, contact.a) && hasComponent(world, Purse, contact.b)) {
				coin = contact.a
				purse = contact.b
			} else if (hasComponent(world, Coin, contact.b) && hasComponent(world, Purse, contact.a)) {
				coin = contact.b
				purse = contact.a
			} else {
				continue
			}

			Purse.value[purse] += 1
			removeEntity(world, coin)
		}

		return world
	}
}
