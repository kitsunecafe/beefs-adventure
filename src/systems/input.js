import { defineQuery } from '../../static/js/bitecs.js'
import { Body, Intent, ReceivesInput } from '../components/index.js'
import { BodyProxy } from '../proxies/body.js'
import { IntentProxy } from "../proxies/intent.js"
import { createAudio } from '../utils/constructors.js'

export default () => {
	const query = defineQuery([Body, ReceivesInput, Intent])
	const intent = new IntentProxy(0)
	const body = new BodyProxy(0)

	return world => {
		const movement = world.actions.movement
		const jump = world.actions.jump
		const dash = world.actions.dash

		query(world).forEach(id => {
			body.eid = intent.eid = id

			if (movement !== 0) {
				body.facing = movement > 0 ? 1 : -1
			}

			intent.movement = movement * intent.speed

			intent.jump = jump ? -intent.jumpStrength : 0

			if (body.facing !== 0) {
				intent.dash = dash ? intent.dashStrength : 0
			}
		})

		return world
	}
}
