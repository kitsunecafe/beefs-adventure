import { removeEntity } from '../../static/js/bitecs.js'
import { Position } from '../components/index.js'
import { createText } from '../utils/constructors.js'
import { sleep } from '../utils/helpers.js'

export const name = 'checkpoint-info'

const timedText = async (ms, world, ...args) => {
	const eid = createText(world, ...args)
	await sleep(ms)
	removeEntity(world, eid)
}

export async function execute(world, eventId) {
	await timedText(
		3 * 1000,
		world,
		Position.x[eventId] - 128,
		Position.y[eventId] - 16,
		144,
		16,
		'You will respawn here',
		{ color: 'white' }
	)
}
