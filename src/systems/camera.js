// https://jsfiddle.net/gfcarv/QKgHs/
import { defineQuery } from 'https://esm.run/bitecs'
import { Camera, Position } from '../components/index.js'
import { CameraProxy } from '../proxies/camera.js'
import { PositionProxy } from '../proxies/vector2.js'
import { Rectangle } from '../utils/rectangle.js'

export default () => {
	const query = defineQuery([Position, Camera])
	const position = new PositionProxy(0)
	const target = new PositionProxy(0)
	const camera = new CameraProxy(0)
	const viewport = new Rectangle(0, 0, 0, 0)
	let index = 0

	return world => {
		query(world).forEach(id => {
			position.eid = camera.eid = id


			if (camera.following) {
				target.eid = camera.following

				if (target.x - position.x + camera.deadzoneX > camera.width) {
					position.x = target.x - (camera.width - camera.deadzoneX)
				} else if (target.x - camera.deadzoneX < position.x) {
					position.x = target.x - camera.deadzoneX
				}

				if (target.y - position.y + camera.deadzoneY > camera.height) {
					position.y = target.y - (camera.height - camera.deadzoneY)
				} else if (target.y - camera.deadzoneY < position.y) {
					position.y = target.y - camera.deadzoneY
				}
			}

			viewport.update(position.x, position.y, camera.width, camera.height)

			if (viewport.x < world.bounds.x) {
				position.x = world.bounds.x
			}

			if (viewport.y < world.bounds.y) {
				position.y = world.bounds.y
			}

			if (viewport.xMax > world.bounds.xMax) {
				position.x = world.bounds.xMax - camera.width
			}

			if (viewport.yMax > world.bounds.yMax) {
				position.y = world.bounds.yMax - camera.height
			}
		})

		return world
	}
}

