import { addEntity, addComponent, defineQuery, enterQuery, exitQuery, hasComponent, removeComponent, removeEntity } from '../../static/js/bitecs.js'
import Matter from '../../static/js/matter.min.js'
import {
	Body,
	Collider,
	Contact,
	Dynamic,
	Force,
	PhysicsObject,
	Translate,
	Player,
	Position,
	Sensor,
	Velocity
} from '../components/index.js'

import { ColliderProxy } from '../proxies/collider.js'
import { BodyProxy } from '../proxies/body.js'
import { PositionProxy } from '../proxies/vector2.js'
import Store from '../utils/store.js'
import { ContactProxy } from '../proxies/contact.js'
import { identity } from '../utils/helpers.js'

const Bodies = Matter.Bodies
const Composite = Matter.Composite
const Detector = Matter.Detector
const Engine = Matter.Engine
const Vector = Matter.Vector

// https://github.com/liabru/matter-js/issues/5
export default (world) => {
	const composites = new Store(128)
	world.physics = { bodies: composites }

	const engine = Engine.create()
	const physicsWorld = engine.world

	const detector = Detector.create()

	const bodyQuery = defineQuery([Collider, Body])
	const bodyAdded = enterQuery(bodyQuery)
	const bodyRemoved = exitQuery(bodyQuery)

	const contactQuery = defineQuery([Contact])
	const dynamicQuery = defineQuery([Body, Collider, Dynamic])
	const translationQuery = defineQuery([Body, Translate, Position])
	const velocityQuery = defineQuery([Body, Velocity, Position])
	const forceQuery = defineQuery([Body, Force, Position])

	const body = new BodyProxy(0)
	const position = new PositionProxy(0)
	const collider = new ColliderProxy(0)
	const contact = new ContactProxy(0)

	let options = { isStatic: false, friction: 0, isSensor: 0 }

	const vector = Vector.create()
	const force = Vector.create()

	return world => {
		const contacts = contactQuery(world)

		for (let i = 0; i < contacts.length; i++) {
			removeEntity(world, contacts[i])
		}

		const collisions = Detector.collisions(detector)

		for (let i = 0; i < collisions.length; i++) {
			const collision = collisions[i]
			contact.eid = addEntity(world)
			addComponent(world, Contact, contact.eid)

			contact.a = collision.bodyA.eid
			contact.b = collision.bodyB.eid

			contact.normalX = collision.normal.x
			contact.normalY = collision.normal.y
		}

		bodyRemoved(world).forEach(id => {
			collider.eid = body.eid = position.eid = id
			const composite = composites.get(body.index)
			composites.removeIndex(body.index)
			Composite.remove(physicsWorld, composite)

			Detector.clear(detector)
			Detector.setBodies(detector, composites.items.filter(identity))
		})

		bodyAdded(world).forEach(id => {
			collider.eid = body.eid = position.eid = id

			options.isStatic = !hasComponent(world, Dynamic, id)
			options.isSensor = hasComponent(world, Sensor, id)


			const composite = Bodies.rectangle(collider.x, collider.y, collider.width, collider.height, options)
			Matter.Body.setMass(composite, body.mass)
			Matter.Body.rotate(composite, 0)
			Matter.Body.scale(composite, 1, 1)
			composite.eid = id

			if (hasComponent(world, Player, id)) {
				composite.label = 'Player'
			}

			body.index = composites.add(composite)
			Composite.add(physicsWorld, composite)
			addComponent(world, PhysicsObject, id)

			Detector.clear(detector)
			Detector.setBodies(detector, composites.items.filter(identity))
		})

		velocityQuery(world).forEach(id => {
			position.eid = body.eid = id
			const composite = composites.get(body.index)

			force.x = Velocity.x[id]
			force.y = Velocity.y[id]

			Matter.Body.setVelocity(composite, force)
			removeComponent(world, Velocity, id)
		})

		forceQuery(world).forEach(eid => {
			body.eid = position.eid = eid
			const composite = composites.get(body.index)

			vector.x = position.x
			vector.y = position.y

			force.x = Force.x[eid]
			force.y = Force.y[eid]

			Matter.Body.applyForce(composite, vector, force)
			removeComponent(world, Force, eid)
		})

		translationQuery(world).forEach(eid => {
			body.eid = eid

			const composite = composites.get(body.index)

			Matter.Body.setPosition(composite, {
				x: Translate.x[eid],
				y: Translate.y[eid]
			})

			removeComponent(world, Translate, eid)
		})

		Engine.update(engine, world.time.fixedDelta * 1000)

		dynamicQuery(world).forEach(eid => {
			body.eid = position.eid = eid

			const composite = composites.get(body.index)
			position.x = composite.position.x
			position.y = composite.position.y

			Matter.Body.setAngularVelocity(composite, 0)

			if (body.grounded) {
				composite.force = Vector.create()
			}

			body.rising = composite.velocity.y < -0.1 ? 1 : 0
		})

		return world
	}
}
