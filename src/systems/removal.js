import { defineQuery, removeEntity } from '/static/js/bitecs.mjs'
import { Remove } from '../components/index.js'

export default () => {
	const query = defineQuery([Remove])

	return world => {
		const entities = query(world)
		const currentFrame = world.time.elapsedFrames
		for (let i = 0; i < entities.length; i++) {
			// console.log(Remove.onFrame[i], currentFrame)
			const id = entities[i]
			if (Remove.onFrame[id] < currentFrame) {
				removeEntity(world, id)
			}
		}

		return world
	}
}

