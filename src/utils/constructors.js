import { addComponent, addEntity } from 'https://esm.run/bitecs'
import {
  Animation,
  Body,
  Camera,
  Collider,
  Coin,
  CurrentAnimation,
  Dynamic,
  EntityAnimation,
  Intent,
  Player,
  Position,
  ReceivesInput,
  Sensor,
  Sprite,
  SpriteSheet,
  Purse
} from '../components/index.js'

export const addPosition = (world, x, y) => id => {
  addComponent(world, Position, id)
  Position.x[id] = x
  Position.y[id] = y
  return id
}

export function createObject(world, x, y) {
  const eid = addEntity(world)

  addComponent(world, Position, eid)
  Position.x[eid] = x
  Position.y[eid] = y

  return eid
}

export function createCollider(world, x, y, w, h, offsetX, offsetY) {
  const eid = createObject(world, x, y)
  const ox = offsetX || 0
  const oy = offsetY || 0

  addComponent(world, Collider, eid)
  Collider.width[eid] = w
  Collider.height[eid] = h
  Collider.offsetX[eid] = ox
  Collider.offsetY[eid] = oy

  addComponent(world, Body, eid)
  Body.mass[eid] = 1

  return eid
}

export function createCamera(world, canvas, target) {
  const eid = createObject(world, 0, 0)

  addComponent(world, Camera, eid)
  Camera.following[eid] = target

  Camera.width[eid] = canvas.width
  Camera.height[eid] = canvas.height

  Camera.deadzoneX[eid] = canvas.width / 4
  Camera.deadzoneY[eid] = canvas.height / 4

  return eid
}

export function createCoin(world, x, y) {
  const anim = createAnimation(world, 6, 10)
  const ss = createSpriteSheet(world, world.textureIDs.coin, 8)
  const eid = createCollider(world, x, y, 8, 8, 8, 8)

  addComponent(world, CurrentAnimation, eid)
  CurrentAnimation.id[eid] = anim

  addComponent(world, Sprite, eid)
  Sprite.spritesheet[eid] = ss
  Sprite.scaleX[eid] = 1
  Sprite.scaleY[eid] = 1

  addComponent(world, Coin, eid)
  addComponent(world, Sensor, eid)

  return eid
}

export function createAnimation(world, frames, duration, first) {
  const eid = addEntity(world)

  addComponent(world, Animation, eid)
  Animation.frames[eid] = frames
  Animation.frameDuration[eid] = duration
  Animation.firstFrame[eid] = first || 0

  return eid
}

export function createSpriteSheet(world, texture, frameWidth, frameHeight) {
  const eid = addEntity(world)
  addComponent(world, SpriteSheet, eid)
  SpriteSheet.texture[eid] = texture
  SpriteSheet.frameWidth[eid] = frameWidth
  SpriteSheet.frameHeight[eid] = frameHeight || frameWidth
  return eid
}

export function createPlayer(world, x, y) {
  const idle = createAnimation(world, 3, 10, 0)
  const walk = createAnimation(world, 3, 10, 3)
  const spriteSheet = createSpriteSheet(world, world.textureIDs.dog, 16)

  const w = SpriteSheet.frameWidth[spriteSheet]
  const h = SpriteSheet.frameHeight[spriteSheet]
  const eid = createCollider(world, x, y, w, h)

  addComponent(world, Sprite, eid)
  Sprite.spritesheet[eid] = spriteSheet
  Sprite.frame[eid] = 0
  Sprite.rotation[eid] = 0
  Sprite.scaleX[eid] = 1
  Sprite.scaleY[eid] = 1

  addComponent(world, EntityAnimation, eid)
  EntityAnimation.idle[eid] = idle
  EntityAnimation.walk[eid] = walk

  addComponent(world, CurrentAnimation, eid)
  CurrentAnimation.id[eid] = idle

  addComponent(world, Intent, eid)
  Intent.speed[eid] = 1.5
  Intent.jumpStrength[eid] = 0.017
  Intent.dashStrength[eid] = 0.2
  Intent.movement[eid] = 0
  Intent.jump[eid] = 0
  Intent.dash[eid] = 0

  addComponent(world, ReceivesInput, eid)
  addComponent(world, Dynamic, eid)
  addComponent(world, Purse, eid)

  return eid
}