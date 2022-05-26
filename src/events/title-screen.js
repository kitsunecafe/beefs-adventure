import { addComponent, addEntity, removeEntity } from '../../static/js/bitecs.js'
import { LoadLevel } from '../components/load-level.js'

export const name = 'title-screen'

const waitForInput = (world, eventId) => {
	if (world.actions.input.anyDown()) {
		const eid = addEntity(world)
		addComponent(world, LoadLevel, eid)
		LoadLevel.id[eid] = 1
		removeEntity(world, eventId)
	} else {
		requestAnimationFrame(waitForInput.bind(null, world))
	}
}

export const init = (world, eventId) => {
	requestAnimationFrame(waitForInput.bind(null, world, eventId))
}
