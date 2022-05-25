import { defineQuery } from '../../static/js/bitecs.js'
import Matter from '../../static/js/matter.min.js'
import { Body, Dynamic, Position } from '../components/index.js'
import { BodyProxy } from '../proxies/body.js'
import { PositionProxy } from '../proxies/vector2.js'
import { identity } from '../utils/helpers.js'

const Query = Matter.Query
const Vector = Matter.Vector

export default (rayLength = 8) => {
	const bodyQuery = defineQuery([Position, Body, Dynamic])
	const position = new PositionProxy(0)
	const body = new BodyProxy(0)

	let origin
	let target

	return world => {
		const entities = bodyQuery(world)
		const bodies = world.physics.bodies.items.filter(identity)

		for (let index = 0; index < entities.length; index++) {
			body.eid = position.eid = entities[index]
			const composite = world.physics.bodies.get(body.index)
			origin = Vector.create(position.x, position.y)
			target = { x: origin.x, y: origin.y + rayLength }
			const collisions = Query.ray(bodies, origin, target)
				.filter(col => col.body.id !== composite.id && !col.body.isSensor)

			body.grounded = collisions.length > 0 ? 1 : 0
		}

		return world
	}
}

