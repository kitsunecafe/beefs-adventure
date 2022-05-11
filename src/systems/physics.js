import { defineQuery, enterQuery, exitQuery, hasComponent } from 'https://esm.run/bitecs'
import Matter from 'https://esm.run/matter-js'
import { Body, Collider, Dynamic, Intent } from '../components/index.js'
import { ColliderProxy } from '../proxies/collider.js'
import { BodyProxy } from '../proxies/body.js'
import { PositionProxy } from '../proxies/vector2.js'
import { IntentProxy } from "../proxies/intent.js"
import Store from '../utils/store.js'

const Bodies = Matter.Bodies
const Composite = Matter.Composite
const Detector = Matter.Detector
const Engine = Matter.Engine

export default () => {
	const composites = new Store(128)

	const engine = Engine.create()
	const physicsWorld = engine.world
	// engine.gravity.y = 5

	const detector = Detector.create()

	const bodyQuery = defineQuery([Collider, Body])
	const bodyAdded = enterQuery(bodyQuery)
	const bodyRemoved = exitQuery(bodyQuery)

	const intentQuery = defineQuery([Intent])

	const body = new BodyProxy(0)
	const position = new PositionProxy(0)
	const collider = new ColliderProxy(0)
	const intent = new IntentProxy(0)

	const staticOptions = { isStatic: true, friction: 0 }
	const dynamicOptions = { friction: 0 }

	const vector = Matter.Vector.create()
	const force = Matter.Vector.create()
	return world => {
		const collisions = Detector.collisions(detector)

		bodyRemoved(world).forEach(id => {
			collider.eid = body.eid = position.eid = id
			const composite = composites.get(body.index)
			composites.removeIndex(body.index)
			Composite.remove(physicsWorld, composite)

			Detector.clear(detector)
			Detector.setBodies(detector, composites.items.filter(x => x))
		})

		bodyAdded(world).forEach(id => {
			collider.eid = body.eid = position.eid = id
			const options = hasComponent(world, Dynamic, id) ? dynamicOptions : staticOptions
			const composite = Bodies.rectangle(collider.x, collider.y, collider.width, collider.height, options)
			Matter.Body.setMass(composite, body.mass)
			Matter.Body.rotate(composite, 0)
			Matter.Body.scale(composite, 1, 1)

			body.index = composites.add(composite)
			Composite.add(physicsWorld, composite)

			Detector.clear(detector)
			Detector.setBodies(detector, composites.items.filter(x => x))
		})

		bodyQuery(world).forEach(id => {
			collider.eid = body.eid = position.eid = id

			const composite = composites.get(body.index)
			position.x = composite.position.x
			position.y = composite.position.y

			if (collisions.length > 0) {
				const ownCollisions = collisions.filter(col => col.bodyA.id == composite.id || col.bodyB.id == composite.id)
				body.grounded = ownCollisions.some(col => col.normal.y < -.9) ? 1 : 0
			} else {
				body.grounded = 0
			}
		})

		intentQuery(world).forEach(id => {
			intent.eid = body.eid = position.eid = id

			const composite = composites.get(body.index)
			force.x = intent.movement
			force.y = composite.velocity.y

			Matter.Body.setVelocity(composite, force)

			if (intent.jump != 0 && body.grounded) {
				vector.x = position.x
				vector.y = position.y

				force.x = 0
				force.y = intent.jump

				Matter.Body.applyForce(composite, vector, force)
			}

			if (intent.dash != 0) {
				vector.x = position.x
				vector.y = position.y

				force.x = intent.dash * body.facing
				force.y = 0

				Matter.Body.applyForce(composite, vector, force)
			}
		})

		Engine.update(engine, world.delta * 1000)
		return world
	}
}
