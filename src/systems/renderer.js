// https://stackoverflow.com/questions/27462949/convert-position-coordinates-to-canvas-coordinates
// https://stackoverflow.com/questions/54444944/convert-html-canvas-coordinate-system-to-cartesian-system
import { defineQuery } from '/static/js/bitecs.mjs'
import { Camera, Position, Sprite } from '../components/index.js'
import { CameraProxy } from '../proxies/camera.js'
import { SpriteSheetProxy } from '../proxies/spritesheet.js'
import { PositionProxy } from '../proxies/vector2.js'
import { Vector2 } from '../utils/math.js'
import { Rectangle } from '../utils/rectangle.js'

let i = 0
export default (canvas) => {
  const spriteQuery = defineQuery([Position, Sprite])
  const cameraQuery = defineQuery([Position, Camera])
  const cameraPosition = new PositionProxy(0)
  const camera = new CameraProxy(0)
  const position = new PositionProxy(0)
  const spriteSheet = new SpriteSheetProxy(0)
  let rect = new Rectangle(0, 0, 0, 0)
  let viewport = new Rectangle(0, 0, 0, 0)

  let translation = new Vector2(0, 0)

  return world => {
    canvas.cls()

    cameraPosition.eid = camera.eid = cameraQuery(world)[0]

    if (camera.eid) {
      viewport.update(cameraPosition.x, cameraPosition.y, camera.width, camera.height)
    }

    //   let dx = 0
    //   let dy = 0

    //   if (cameraPosition.x != translation.x) {
    //     dx = cameraPosition.x - translation.x
    //   }

    //   if (cameraPosition.x == translation.x) {
    //     dy = cameraPosition.y - translation.y
    //   }

    //   canvas.trans(-dx, -dy)

    //   translation.x += dx
    //   translation.y += dy
    // }

    const entities = spriteQuery(world)

    for (let index = 0; index < entities.length; index++) {
      const id = entities[index]
      position.eid = id
      rect.update(position.x, position.y, spriteSheet.frameWidth, spriteSheet.frameHeight)

      // if (i % 5000 == 0) {
      //   console.log(rect, viewport, viewport.intersects(rect), rect.intersects(viewport))
      // }
      // if (camera.eid && !(viewport.intersects(rect) || rect.intersects(viewport))) {
      //   continue
      // }

      canvas.push()

      spriteSheet.eid = Sprite.spritesheet[id]
      const tid = spriteSheet.texture
      const halfWidth = spriteSheet.frameWidth / 2
      const halfHeight = spriteSheet.frameHeight / 2
      const flipX = Sprite.scaleX[id] < 0
      const xOffset = flipX ? halfWidth : 0

      canvas.trans(
        (position.x + halfWidth + xOffset) - cameraPosition.x,
        (position.y + halfHeight) - cameraPosition.y
      )

      canvas.rot(Sprite.rotation[id])
      canvas.scale(Sprite.scaleX[id], Sprite.scaleY[id])

      const x = (Sprite.frame[id] % spriteSheet.columns) * spriteSheet.frameWidth + spriteSheet.offsetX
      const y = Math.floor(Sprite.frame[id] / spriteSheet.columns) * spriteSheet.frameHeight + spriteSheet.offsetY

      const texture = world.textures[tid]
      const u0 = x / texture.width
      const v0 = y / texture.height
      const u1 = u0 + (spriteSheet.frameWidth / texture.width)
      const v1 = v0 + (spriteSheet.frameHeight / texture.height)

      // if (index % 100 === 0) {
      //   console.log(texture)
      // }

      // index++
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

    i++
    canvas.flush()
    return world
  }
}
