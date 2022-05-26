import { defineQuery, removeComponent, removeEntity } from '../../static/js/bitecs.js'
import { Camera, Position, ReceivesInput, Intent, Purse } from '../components/index.js'
import { createCamera, createObject, createText } from '../utils/constructors.js'
import { sleep } from '../utils/helpers.js'

export const name = 'ending'

const allQuery = defineQuery([])
const removeEverything = world => {
	const entities = allQuery(world)
	for (let index = 0; index < entities.length; index++) {
		removeEntity(world, entities[index])
	}
}

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
		Intent.jump[id] = 0
		Intent.dash[id] = 0
		removeComponent(world, ReceivesInput, id)
	}
	const player = entities[0]

	await timedText(
		3 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] + 16,
		128,
		128,
		'HI BEEF! What are you doing out here?'
	)

	await timedText(
		3.5 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] + 16,
		128,
		128,
		'Did you came all this way to find me?'
	)

	await timedText(
		4 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] + 16,
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
				Position.y[eventId] + 16,
				128,
				128,
				'You even found a coin!'
			)
		} else if (coins > 1) {
			await timedText(
				4 * 1000,
				world,
				Position.x[eventId] - 64,
				Position.y[eventId] + 16,
				128,
				128,
				'Wait... you even found some coins?'
			)

			await timedText(
				4 * 1000,
				world,
				Position.x[eventId] - 64,
				Position.y[eventId] + 16,
				128,
				128,
				`You found ${Purse.value[player]} of them!!`
			)

			if (coins > 20) {
				await timedText(
					4 * 1000,
					world,
					Position.x[eventId] - 64,
					Position.y[eventId] + 16,
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
		Position.y[eventId] + 16,
		128,
		128,
		'By the way... it looks like you came the long way.'
	)

	await timedText(
		4 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] + 16,
		128,
		128,
		'You know this beach is just to the west of our house, right?'
	)

	await timedText(
		4 * 1000,
		world,
		Position.x[eventId] - 64,
		Position.y[eventId] + 16,
		128,
		128,
		'That\'s okay. Let\'s go to 7/11.'
	)

	removeEverything(world)
	const empty = createObject(world, 0, 0, 1, 1)
	const eid = createCamera(world, world.canvas.c, empty)
	const canvas = world.canvas.c
	const x = world.bounds.x - (canvas.width / 2)
	const y = world.bounds.y + (canvas.height / 2)

	await timedText(
		4 * 1000,
		world,
		x,
		y,
		canvas.width,
		canvas.height,
		'This game is dedicated to my wife and best friend.',
		{ color: 'white', align: 'center' }
	)

	timedText(
		8 * 1000,
		world,
		x,
		y,
		canvas.width,
		canvas.height,
		'Thanks for always being there for me',
		{ color: 'white', align: 'center' }
	)
	await sleep(4000)
	await timedText(
		4 * 1000,
		world,
		x,
		y + 16,
		canvas.width,
		canvas.height,
		'and for being patient while I made this.',
		{ color: 'white', align: 'center' }
	)

	await timedText(
		4 * 1000,
		world,
		x,
		y,
		canvas.width,
		canvas.height,
		'and sorry for waking you up while writing this.',
		{ color: 'white', align: 'center' }
	)

	await timedText(
		4 * 1000,
		world,
		x,
		y,
		canvas.width,
		canvas.height,
		'I love you very much. Happy 15th anniversary.',
		{ color: 'white', align: 'center' }
	)

	await timedText(
		4 * 1000,
		world,
		x,
		y,
		canvas.width,
		canvas.height,
		'Thank you for playing.',
		{ color: 'white', align: 'center' }
	)
}
