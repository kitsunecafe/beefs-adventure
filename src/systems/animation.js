import { defineQuery } from 'https://esm.run/bitecs'
import { Animation, CurrentAnimation, Sprite } from '../components/index.js'

export default () => {
  const query = defineQuery([Sprite, CurrentAnimation])

  return world => {
    const currentFrame = world.time.elapsedFrames

    const entities = query(world)
    for (let i = 0; i < entities.length; i++) {
      const id = entities[i]
      const aid = CurrentAnimation.id[id]

      if (Animation.loop[aid] > 0 || Sprite.frame[id] - Animation.firstFrame[aid] < Animation.frames[aid] - 1) {
        const frame = Math.floor(((currentFrame - CurrentAnimation.startFrame[id]) / Animation.frameDuration[aid]) % Animation.frames[aid])
        Sprite.frame[id] = Animation.firstFrame[aid] + frame
      }
    }

    return world
  }
}
