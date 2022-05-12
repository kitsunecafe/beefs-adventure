import { defineQuery, hasComponent } from 'https://esm.run/bitecs'
import { Body, Contact, Dynamic } from '../components/index.js'
import { BodyProxy } from '../proxies/body.js'
import { ContactProxy } from '../proxies/contact.js'

export default (normalLimit = -0.9) => {
	const bodyQuery = defineQuery([Body])
	const query = defineQuery([Contact])
	const contact = new ContactProxy(0)
	const body = new BodyProxy(0)

	return world => {
		const bodies = bodyQuery(world)

		for (let index = 0; index < bodies.length; index++) {
			body.eid = bodies[index]
			body.grounded = 0
		}

		const contacts = query(world)
		for (let index = 0; index < contacts.length; index++) {
			contact.eid = contacts[index]

			if (contact.normalY > normalLimit) {
				continue
			}

			if (hasComponent(world, Body, contact.a) && hasComponent(world, Dynamic, contact.a)) {
				Body.grounded[contact.a] = 1
			}

			if (hasComponent(world, Body, contact.b) && hasComponent(world, Dynamic, contact.b)) {
				Body.grounded[contact.b] = 1
			}
		}
	}
}

