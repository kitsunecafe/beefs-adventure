import { addComponent, defineQuery, enterQuery, hasComponent } from 'https://esm.run/bitecs'
import { Collider } from '../components/index.js'
import { ColliderProxy } from '../proxies/collider.js'
import { PositionProxy } from '../proxies/vector2.js'

export default () => {
	const query = defineQuery([Collider])
	// const enter = enterQuery(query)
	const collider = new ColliderProxy(0)
	const position = new PositionProxy(0)

	return world => {
		const entities = query(world)

		entities.forEach(id => {
			collider.eid = position.eid = id

			collider.x = position.x
			collider.y = position.y
		})

		return world
	}
}
