import { defineQuery } from '/static/js/bitecs.mjs'
import { Collider } from '../components/index.js'
import { ColliderProxy } from '../proxies/collider.js'
import { PositionProxy } from '../proxies/vector2.js'

export default () => {
	const query = defineQuery([Collider])
	const collider = new ColliderProxy(0)
	const position = new PositionProxy(0)

	return world => {
		const entities = query(world)

		entities.forEach(id => {
			collider.eid = position.eid = id

			collider.x = position.x + Math.floor(collider.width / 2) - collider.offsetX
			collider.y = position.y + Math.floor(collider.height / 2) - collider.offsetY
		})

		return world
	}
}
