import { defineQuery, enterQuery } from '../../static/js/bitecs.js'
import Matter from '../../static/js/matter.min.js'
import { Body, OneWayCollider, PassThroughPlatforms, PhysicsObject } from '../components/index.js'
import { BodyProxy } from '../proxies/body.js'

export default () => {
	const colliderQuery = enterQuery(defineQuery([OneWayCollider, PhysicsObject]))
	const entityQuery = defineQuery([Body, PassThroughPlatforms, PhysicsObject])
	const entityCreatedQuery = enterQuery(entityQuery)

	const body = new BodyProxy(0)

	const DefaultCategory = 0x0001
	const EntityCategory = Matter.Body.nextCategory()
	const PlatformCategory = Matter.Body.nextCategory()

	const PlatformMask = DefaultCategory | PlatformCategory

	return world => {
		colliderQuery(world).forEach(id => {
			body.eid = id
			const composite = world.physics.bodies.get(body.index)

			composite.collisionFilter = {
				...composite.collisionFilter,
				category: PlatformCategory,
				mask: DefaultCategory | EntityCategory
			}
		})

		entityCreatedQuery(world).forEach(id => {
			body.eid = id
			const composite = world.physics.bodies.get(body.index)

			composite.collisionFilter = {
				...composite.collisionFilter,
				category: EntityCategory,
				mask: DefaultCategory | PlatformCategory
			}
		})

		const entities = entityQuery(world)
		for (let index = 0; index < entities.length; index++) {
			body.eid = entities[index]

			const composite = world.physics.bodies.get(body.index)

			composite.collisionFilter.mask = body.rising === 1 ? DefaultCategory : PlatformMask
		}

		return world
	}
}

