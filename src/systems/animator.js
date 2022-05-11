import { defineQuery } from 'https://esm.run/bitecs'
import { CurrentAnimation, EntityAnimation, Intent, Sprite } from '../components/index.js'
import { IntentProxy } from "../proxies/intent.js"

export default () => {
	const query = defineQuery([EntityAnimation, CurrentAnimation, Intent, Sprite])
	const intent = new IntentProxy(0)

	return world => {
		query(world).forEach(id => {
			intent.eid = id
			const isIdle = intent.movement == 0
			const anim = isIdle ? EntityAnimation.idle : EntityAnimation.walk
			CurrentAnimation.id[id] = anim[id]

			if (!isIdle) {
				if (intent.movement > 0) {
					Sprite.scaleX[id] = -1
				} else if (intent.movement < 0) {
					Sprite.scaleX[id] = 1
				}
			}
		})

		return world
	}
}
