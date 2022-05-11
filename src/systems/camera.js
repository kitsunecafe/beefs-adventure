import { defineQuery } from 'https://esm.run/bitecs'
import { Camera, Position } from '../components/index.js'
import { CameraProxy } from '../proxies/camera.js'
import { PositionProxy } from '../proxies/vector2.js'

export default () => {
	const query = defineQuery([Position, Camera])
	const position = new PositionProxy(0)
	const target = new PositionProxy(0)
	const camera = new CameraProxy(0)

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
		})

		return world
	}
}

