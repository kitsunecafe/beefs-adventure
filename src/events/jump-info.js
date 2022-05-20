import { removeEntity } from '../../static/js/bitecs.js'
import { Position } from '../components/index.js'
import { createText } from '../utils/constructors.js'
import { sleep } from '../utils/helpers.js'

export const name = 'jump-info'

const timedText = async (ms, world, ...args) => {
	const eid = createText(world, ...args)
	await sleep(ms)
	removeEntity(world, eid)
}

export async function execute(world, eventId) {
	await timedText(
		3 * 1000,
		world,
		Position.x[eventId] - 88,
		Position.y[eventId] - 16,
		128,
		16,
		'Press X to Jump',
		{ color: 'white' }
	)
}
