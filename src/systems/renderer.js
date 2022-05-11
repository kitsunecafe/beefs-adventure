import { defineQuery, hasComponent } from 'https://esm.run/bitecs'
import { Camera, Collider, Position, Sprite, SpriteSheet } from '../components/index.js'
import { PositionProxy } from '../proxies/vector2.js'
import { Vector2 } from '../utils/math.js'

export default (canvas) => {
  const spriteQuery = defineQuery([Position, Sprite])
  const cameraQuery = defineQuery([Position, Camera])
  const cameraPosition = new PositionProxy(0)
  const position = new PositionProxy(0)

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

      const ssid = Sprite.spritesheet[id]
      const tid = SpriteSheet.texture[ssid]
      const halfWidth = SpriteSheet.frameWidth[ssid] / 2
      const flipX = Sprite.scaleX[id] < 0
      const xOffset = flipX ? halfWidth : 0

      canvas.trans(position.x + xOffset, position.y)
      canvas.rot(Sprite.rotation[id])
      canvas.scale(Sprite.scaleX[id], Sprite.scaleY[id])

      const x = (Sprite.frame[id] % SpriteSheet.columns[ssid]) * SpriteSheet.frameWidth[ssid] + SpriteSheet.offsetX[ssid]
      const y = Math.floor(Sprite.frame[id] / SpriteSheet.columns[ssid]) * SpriteSheet.frameHeight[ssid] + SpriteSheet.offsetY[ssid]

      const texture = world.textures[tid]
      const u0 = x / texture.width
      const v0 = y / texture.height
      const u1 = u0 + (SpriteSheet.frameWidth[ssid] / texture.width)
      const v1 = v0 + (SpriteSheet.frameHeight[ssid] / texture.height)

      canvas.img(
        texture,
        -xOffset,
        0,
        SpriteSheet.frameWidth[ssid],
        SpriteSheet.frameHeight[ssid],
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
