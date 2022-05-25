import { defineQuery, enterQuery, Not } from '../../static/js/bitecs.js'
import { Collider, Dynamic, Position } from '../components/index.js'
import { ColliderProxy } from '../proxies/collider.js'
import { PositionProxy } from '../proxies/vector2.js'

export default () => {
	const dynamicQuery = defineQuery([Position, Collider, Dynamic])
	const staticQuery = enterQuery(defineQuery([Position, Collider, Not(Dynamic)]))
	const collider = new ColliderProxy(0)
	const position = new PositionProxy(0)

	return world => {
		const staticEntities = staticQuery(world)
		for (let index = 0; index < staticEntities.length; index++) {
			collider.eid = position.eid = staticEntities[index]

			collider.x = position.x + Math.floor(collider.width / 2) - collider.offsetX
			collider.y = position.y + Math.floor(collider.height / 2) - collider.offsetY
		}

		const entities = dynamicQuery(world)

		for (let index = 0; index < entities.length; index++) {
			collider.eid = position.eid = entities[index]

			collider.x = position.x + Math.floor(collider.width / 2) - collider.offsetX
			collider.y = position.y + Math.floor(collider.height / 2) - collider.offsetY
		}

		return world
	}
}
