import { defineQuery } from '/static/js/bitecs.mjs'
import { Animation, CurrentAnimation, Sprite } from '../components/index.js'

export default () => {
  const query = defineQuery([Sprite, CurrentAnimation])

  return world => {
    const elapsed = world.time.elapsed * 1000

    const entities = query(world)
    for (let i = 0; i < entities.length; i++) {
      const id = entities[i]
      const aid = CurrentAnimation.id[id]

      if (Animation.loop[aid] > 0 || Sprite.frame[id] - Animation.firstFrame[aid] < Animation.frames[aid] - 1) {
        const currentFrame = Math.floor(elapsed / Animation.frameDuration[aid])
        const frame = Math.floor((currentFrame - CurrentAnimation.startFrame[id]) % Animation.frames[aid])
        Sprite.frame[id] = Animation.firstFrame[aid] + frame
      }
    }

    return world
  }
}
