import { defineQuery } from 'https://esm.run/bitecs'
import { Camera, Position, Sprite } from '../components/index.js'
import { SpriteSheetProxy } from '../proxies/spritesheet.js'
import { PositionProxy } from '../proxies/vector2.js'
import { Vector2 } from '../utils/math.js'

export default (canvas) => {
  const spriteQuery = defineQuery([Position, Sprite])
  const cameraQuery = defineQuery([Position, Camera])
  const cameraPosition = new PositionProxy(0)
  const position = new PositionProxy(0)
  const spriteSheet = new SpriteSheetProxy(0)

  let translation = new Vector2(0, 0)
  return world => {
    canvas.cls()

    cameraPosition.eid = cameraQuery(world)[0]

    let dx = 0
    let dy = 0

    if (cameraPosition.x != translation.x) {
      dx = cameraPosition.x - translation.x
    }

    if (cameraPosition.x == translation.x) {
      dy = cameraPosition.y - translation.y
    }

    canvas.trans(-dx, -dy)

    translation.x += dx
    translation.y += dy

    const entities = spriteQuery(world)
    for (let index = 0; index < entities.length; index++) {
      const id = entities[index]
      position.eid = id

      canvas.push()

      spriteSheet.eid = Sprite.spritesheet[id]
      const tid = spriteSheet.texture
      const halfWidth = spriteSheet.frameWidth / 2
      const flipX = Sprite.scaleX[id] < 0
      const xOffset = flipX ? halfWidth : 0

      canvas.trans(position.x + xOffset, position.y)
      canvas.rot(Sprite.rotation[id])
      canvas.scale(Sprite.scaleX[id], Sprite.scaleY[id])

      const x = (Sprite.frame[id] % spriteSheet.columns) * spriteSheet.frameWidth + spriteSheet.offsetX
      const y = Math.floor(Sprite.frame[id] / spriteSheet.columns) * spriteSheet.frameHeight + spriteSheet.offsetY

      const texture = world.textures[tid]
      const u0 = x / texture.width
      const v0 = y / texture.height
      const u1 = u0 + (spriteSheet.frameWidth / texture.width)
      const v1 = v0 + (spriteSheet.frameHeight / texture.height)

      canvas.img(
        texture,
        -xOffset,
        0,
        spriteSheet.frameWidth,
        spriteSheet.frameHeight,
        u0,
        v0,
        u1,
        v1
      )

      canvas.pop()
    }

    canvas.flush()
    return world
  }
}
