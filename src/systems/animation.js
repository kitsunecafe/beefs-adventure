import { defineQuery } from 'https://esm.run/bitecs'
import { Animation, CurrentAnimation, Sprite } from '../components/index.js'

export default () => {
	const query = defineQuery([Sprite, CurrentAnimation])

	return world => {
		const currentFrame = world.time.elapsedFrames

		query(world).forEach(id => {
			const aid = CurrentAnimation.id[id]
			const frame = Math.floor((currentFrame / Animation.frameDuration[aid]) % Animation.frames[aid])
			Sprite.frame[id] = Animation.firstFrame[aid] + frame
		})

		return world
	}
}
