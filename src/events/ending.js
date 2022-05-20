import { defineQuery, removeComponent, removeEntity } from '../../static/js/bitecs.js'
import { Collider, Position, ReceivesInput, Intent, Text, Purse } from '../components/index.js'
import { createText } from '../utils/constructors.js'
import { sleep } from '../utils/helpers.js'

export const name = 'ending'

const timedText = async (ms, world, ...args) => {
	const eid = createText(world, ...args)
	await sleep(ms)
	removeEntity(world, eid)
}

const query = defineQuery([ReceivesInput, Intent])
export async function execute(world, eventId) {
	const entities = query(world)
	for (let index = 0; index < entities.length; index++) {
		const id = entities[index]
		Intent.movement[id] = 0
		removeComponent(world, ReceivesInput, id)
	}
	const player = entities[0]

	await timedText(
		3 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] - 64,
		128,
		128,
		'HI BEEF! What are you doing out here?'
	)

	await timedText(
		3.5 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] - 64,
		128,
		128,
		'Did you came all this way to find me?'
	)

	await timedText(
		4 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] - 64,
		128,
		128,
		'Wow!! That\'s so impressive! Good job Beef!'
	)

	const coins = Purse.value[player]
	if (coins > 0) {
		if (coins === 1) {
			await timedText(
				4 * 1000,
				world,
				Position.x[eventId] - 64,
				Position.y[eventId] - 64,
				128,
				128,
				'You even found a coin!'
			)
		} else if (coins > 1) {
			await timedText(
				4 * 1000,
				world,
				Position.x[eventId] - 64,
				Position.y[eventId] - 64,
				128,
				128,
				'Wait... you even found some coins?'
			)

			await timedText(
				4 * 1000,
				world,
				Position.x[eventId] - 64,
				Position.y[eventId] - 64,
				128,
				128,
				`You found ${Purse.value[player]} of them!!`
			)

			if (coins > 20) {
				await timedText(
					4 * 1000,
					world,
					Position.x[eventId] - 64,
					Position.y[eventId] - 64,
					128,
					128,
					'How did you even carry all these?'
				)
			}
		}
	}

	await timedText(
		3 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] - 64,
		128,
		128,
		'By the way... it looks like you came the long way.'
	)

	await timedText(
		4 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] - 72,
		128,
		128,
		'You know this beach is just to the west of our house, right?'
	)

	await timedText(
		4 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] - 64,
		128,
		128,
		'That\'s okay. Let\'s go to 7/11.'
	)
}
