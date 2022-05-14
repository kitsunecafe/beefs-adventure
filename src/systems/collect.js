import { addComponent, defineQuery, hasComponent, removeComponent, removeEntity } from 'https://esm.run/bitecs'
import { Animation, Coin, CoinAnimation, CurrentAnimation, Contact, Remove, Purse, Sprite } from '../components/index.js'
import { ContactProxy } from '../proxies/contact.js'
import { createAudio } from '../utils/constructors.js'

export default () => {
	const query = defineQuery([Contact])
	const contact = new ContactProxy(0)

	return world => {
		const entities = query(world)

		for (let index = 0; index < entities.length; index++) {
			contact.eid = entities[index]
			let purse
			let coin

			if (hasComponent(world, Coin, contact.a) && hasComponent(world, Purse, contact.b)) {
				coin = contact.a
				purse = contact.b
			} else if (hasComponent(world, Coin, contact.b) && hasComponent(world, Purse, contact.a)) {
				coin = contact.b
				purse = contact.a
			} else {
				continue
			}

			Purse.value[purse] += 1

			const aid = CoinAnimation.collect[coin]
			const duration = Animation.frames[aid] * Animation.frameDuration[aid]

			CurrentAnimation.id[coin] = CoinAnimation.collect[coin]
			CurrentAnimation.startFrame[coin] = world.time.elapsedFrames
			Sprite.frame[coin] = Animation.firstFrame[aid]

			addComponent(world, Remove, coin)
			Remove.onFrame[coin] = world.time.elapsedFrames + duration

			createAudio(world, Coin.audio[coin])
			removeComponent(world, Coin, coin)
			removeEntity(world, contact.eid)
		}

		return world
	}
}
