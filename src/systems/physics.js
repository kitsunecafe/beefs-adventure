import { addEntity, addComponent, defineQuery, enterQuery, exitQuery, hasComponent, removeComponent, removeEntity } from '/static/js/bitecs.mjs'
import Matter from 'https://esm.run/matter-js'
import { Body, Collider, Contact, Dynamic, Intent, Translate, Player, Position, Sensor } from '../components/index.js'
import { ColliderProxy } from '../proxies/collider.js'
import { BodyProxy } from '../proxies/body.js'
import { PositionProxy } from '../proxies/vector2.js'
import { IntentProxy } from "../proxies/intent.js"
import Store from '../utils/store.js'
import { ContactProxy } from '../proxies/contact.js'
import { identity } from '../utils/helpers.js'

const Bodies = Matter.Bodies
const Composite = Matter.Composite
const Detector = Matter.Detector
const Engine = Matter.Engine
const Query = Matter.Query
const Vector = Matter.Vector

// https://github.com/liabru/matter-js/issues/5
export default () => {
	const composites = new Store(128)

	const engine = Engine.create()
	const physicsWorld = engine.world

	const detector = Detector.create()

	const bodyQuery = defineQuery([Collider, Body])
	const bodyAdded = enterQuery(bodyQuery)
	const bodyRemoved = exitQuery(bodyQuery)

	const contactQuery = defineQuery([Contact])
	const dynamicQuery = defineQuery([Body, Collider, Dynamic])
	const intentQuery = defineQuery([Body, Intent, Position])
	const translationQuery = defineQuery([Translate, Position])

	const body = new BodyProxy(0)
	const position = new PositionProxy(0)
	const collider = new ColliderProxy(0)
	const intent = new IntentProxy(0)
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

			Detector.clear(detector)
			Detector.setBodies(detector, composites.items.filter(identity))
		})

		const bodies = composites.items.filter(identity)

		translationQuery(world).forEach(id => {
			position.eid = id
			const composite = composites.get(body.index)

			Matter.Body.setPosition(composite, {
				x: Translate.x[id],
				y: Translate.y[id]
			})

			removeComponent(world, Translate, id)
		})

		dynamicQuery(world).forEach(id => {
			collider.eid = body.eid = position.eid = id

			const composite = composites.get(body.index)
			position.x = composite.position.x
			position.y = composite.position.y
		})

		intentQuery(world).forEach(id => {
			intent.eid = body.eid = collider.eid = position.eid = id

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

				const end = Vector.add(vector, Vector.mult(force, 100))
				const collisions = Query.ray(
					bodies,
					vector,
					end
				)
					.filter(col => col.body.id !== composite.id && !col.body.isSensor)

				let dashPosition = end

				if (collisions.length > 0) {
					const collision = collisions.map(col => col.body).reduce((prev, cur) => (
						Math.abs(cur.position.x - vector.x) < Math.abs(prev.position.x - vector.x) ? cur : prev
					))

					const bounds = body.facing > 0 ? collision.bounds.min : collision.bounds.max
					const halfWidth = composite.bounds.max.x - composite.bounds.min.x
					dashPosition.x = bounds.x
				}

				Matter.Body.setPosition(composite, dashPosition)
				// Matter.Body.applyForce(composite, vector, force)
			}
		})

		Engine.update(engine, world.time.fixedDelta * 1000)
		return world
	}
}
