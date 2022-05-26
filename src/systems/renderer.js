// https://stackoverflow.com/questions/27462949/convert-position-coordinates-to-canvas-coordinates
// https://stackoverflow.com/questions/54444944/convert-html-canvas-coordinate-system-to-cartesian-system
import { defineQuery, hasComponent } from '../../static/js/bitecs.js'
import { Camera, Position, Sprite, SpriteSheet, Text } from '../components/index.js'
import { CameraProxy } from '../proxies/camera.js'
import { SpriteSheetProxy } from '../proxies/spritesheet.js'
import { PositionProxy } from '../proxies/vector2.js'
import { Rectangle } from '../utils/rectangle.js'

export default (canvas) => {
  const spriteQuery = defineQuery([Position, Sprite])
  const cameraQuery = defineQuery([Position, Camera])
  const cameraPosition = new PositionProxy(0)
  const camera = new CameraProxy(0)
  const position = new PositionProxy(0)
  const spriteSheet = new SpriteSheetProxy(0)
  let rect = new Rectangle(0, 0, 0, 0)
  let viewport = new Rectangle(0, 0, 0, 0)

  return world => {
    canvas.cls()

    cameraPosition.eid = camera.eid = cameraQuery(world)[0]

    if (camera.eid) {
      viewport.update(cameraPosition.x, cameraPosition.y, camera.width, camera.height)
    }

    const entities = spriteQuery(world)

    const sorted = Uint32Array.from(entities).sort((a, b) => Sprite.index[a] - Sprite.index[b])

    for (let index = 0; index < sorted.length; index++) {
      const id = sorted[index]
      position.eid = id
      rect.update(position.x, position.y, spriteSheet.frameWidth, spriteSheet.frameHeight)

      canvas.push()

      spriteSheet.eid = Sprite.spritesheet[id]
      const tid = spriteSheet.texture
      const halfWidth = spriteSheet.frameWidth / 2
      const halfHeight = spriteSheet.frameHeight / 2
      const flipX = Sprite.scaleX[id] < 0
      const xOffset = flipX ? halfWidth : 0

      canvas.trans(
        (position.x + halfWidth + xOffset) - (cameraPosition.x * Position.px[id]),
        (position.y + halfHeight) - (cameraPosition.y * Position.py[id])
      )

      canvas.rot(Sprite.rotation[id])
      canvas.scale(Sprite.scaleX[id], Sprite.scaleY[id])

      const x = (Sprite.frame[id] % spriteSheet.columns) * spriteSheet.frameWidth + spriteSheet.offsetX
      const y = Math.floor(Sprite.frame[id] / spriteSheet.columns) * spriteSheet.frameHeight + 1

      const texture = world.textures[tid]
      const u0 = x / texture.width
      const v0 = y / texture.height
      const u1 = u0 + ((spriteSheet.frameWidth) / texture.width)
      const v1 = v0 + ((spriteSheet.frameHeight - 1) / texture.height)

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
