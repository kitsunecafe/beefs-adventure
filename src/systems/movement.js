import { addComponent, addEntity, defineQuery, hasComponent, removeEntity } from '../../static/js/bitecs.js'
import Matter from '../../static/js/matter.min.js'
import { Body, Force, Intent, PhysicsObject, Position, Remove, Sprite, Translate, Velocity } from '../components/index.js'
import { BodyProxy } from '../proxies/body.js'
import { ColliderProxy } from '../proxies/collider.js'
import { IntentProxy } from '../proxies/intent.js'
import { SpriteSheetProxy } from '../proxies/spritesheet.js'
import { PositionProxy } from '../proxies/vector2.js'
import { createAudio, createObject } from '../utils/constructors.js'
import { identity, map, pipe, tap, times } from '../utils/helpers.js'
import { div } from '../utils/math.js'

const Query = Matter.Query
const Vector = Matter.Vector
const timesR = fn => n => times(n)(fn)

export default () => {
	const query = defineQuery([Body, Intent, Position, PhysicsObject])

	const body = new BodyProxy(0)
	const position = new PositionProxy(0)
	const collider = new ColliderProxy(0)
	const intent = new IntentProxy(0)
	const spriteSheet = new SpriteSheetProxy(0)

	const vector = Vector.create()
	const force = Vector.create()
	let moved = false

	return world => {
		const entities = query(world)
		const bodies = world.physics.bodies.items.filter(identity)

		for (let index = 0; index < entities.length; index++) {
			const eid = intent.eid = body.eid = collider.eid = position.eid = entities[index]

			const composite = world.physics.bodies.get(body.index)
			if (!composite) continue

			moved = intent.movement != composite.velocity.x
			if (moved) {
				addComponent(world, Velocity, eid)
				Velocity.x[eid] = intent.movement
				Velocity.y[eid] = composite.velocity.y
			}

			intent.jumpCooldown = Math.max(0, intent.jumpCooldown - world.time.delta)
			intent.dashCooldown = Math.max(0, intent.dashCooldown - world.time.delta)

			if (intent.jump != 0 && intent.jumpCooldown <= 0 && body.grounded) {
				intent.jumpCooldown = intent.jumpDelay
				body.rising = 1

				if (!moved) {
					addComponent(world, Velocity, eid)
				}

				Velocity.y[eid] = 0

				addComponent(world, Force, eid)
				Force.x[eid] = 0
				Force.y[eid] = intent.jump
			}

			if (intent.dash != 0 && intent.dashCooldown <= 0) {
				createAudio(world, intent.dashAudio)
				intent.dashCooldown = intent.dashDelay
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
					dashPosition.x = bounds.x
				}
				if (hasComponent(world, Sprite, eid)) {
					spriteSheet.eid = Sprite.spritesheet[eid]

					const duration = 0.075
					const ghost = (x, i) => createGhost(world, eid, duration * i, x, Position.y[eid])

					pipe(
						Math.abs,
						Math.round,
						div(spriteSheet.frameWidth),
						Math.floor,
						timesR(i => position.x + (spriteSheet.frameWidth * i) * Sprite.scaleX[eid] * -1),
						map(ghost),
					)(end.x - vector.x)
				}

				addComponent(world, Translate, intent.eid)
				Translate.x[intent.eid] = dashPosition.x
				Translate.y[intent.eid] = dashPosition.y
			}
		}

		return world
	}
}

const createGhost = (world, eid, duration, x, y) => {
	const geid = createObject(world, x, y)

	addComponent(world, Sprite, geid)
	Sprite.spritesheet[geid] = Sprite.spritesheet[eid]
	Sprite.frame[geid] = Sprite.frame[eid]
	Sprite.scaleX[geid] = Sprite.scaleX[eid]
	Sprite.scaleY[geid] = Sprite.scaleY[eid]

	addComponent(world, Remove, geid)
	Remove.time[geid] = world.time.elapsed + duration
	return geid
}
