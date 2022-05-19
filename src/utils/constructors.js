import { addComponent, addEntity } from '/static/js/bitecs.mjs'
import {
  Animation,
  Audio,
  Body,
  Camera,
  Checkpoint,
  Collider,
  Coin,
  CoinAnimation,
  CurrentAnimation,
  DamageZone,
  Dynamic,
  EntityAnimation,
  Intent,
  LastCheckpoint,
  Player,
  Position,
  ReceivesInput,
  Sensor,
  Sprite,
  SpriteSheet,
  Purse,
  Warp
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
  // console.log('createCollider(', arguments, ')')
  const eid = createObject(world, x, y)
  const ox = offsetX || 0
  const oy = offsetY || 0

  addComponent(world, Collider, eid)
  Collider.width[eid] = w
  Collider.height[eid] = h
  // Collider.offsetX[eid] = ox
  // Collider.offsetY[eid] = oy

  addComponent(world, Body, eid)
  Body.mass[eid] = 1

  return eid
}

export function createCamera(world, canvas, target) {
  const eid = createObject(world, 0, 0)

  addComponent(world, Camera, eid)
  Camera.following[eid] = target

  Camera.width[eid] = canvas.width / 1 
  Camera.height[eid] = canvas.height / 1.49

  Camera.deadzoneX[eid] = canvas.width / 3
  Camera.deadzoneY[eid] = canvas.height / 4

  return eid
}

export function createAudio(world, audio) {
  const eid = addEntity(world)
  addComponent(world, Audio, eid)
  Audio.id[eid] = audio
  return eid
}

export function createAnimation(world, frames, duration, first, loop) {
  const eid = addEntity(world)

  addComponent(world, Animation, eid)
  Animation.frames[eid] = frames
  Animation.frameDuration[eid] = duration
  Animation.firstFrame[eid] = first || 0
  Animation.loop[eid] = loop == undefined || loop ? 1 : 0

  return eid
}

const defaultSpriteSheetOptions = {
  offsetX: 0,
  offsetY: 0
}

export function createSpriteSheet(world, texture, options) {
  const opts = Object.assign({}, defaultSpriteSheetOptions, options)
  const eid = addEntity(world)

  addComponent(world, SpriteSheet, eid)
  SpriteSheet.texture[eid] = texture
  SpriteSheet.frameWidth[eid] = opts.frameWidth
  SpriteSheet.frameHeight[eid] = opts.frameHeight
  SpriteSheet.offsetX[eid] = opts.offsetX
  SpriteSheet.offsetY[eid] = opts.offsetY

  return eid
}

const defaultSpriteOptions = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1
}

export function createSprite(world, spriteSheet, tile, x, y, options) {
  const opts = Object.assign({}, defaultSpriteOptions, options)

  const eid = addEntity(world)
  addComponent(world, Position, eid)
  Position.x[eid] = x - (SpriteSheet.frameWidth[eid] / 2)
  Position.y[eid] = y - (SpriteSheet.frameHeight[eid] / 2)

  addComponent(world, Body, eid)
  Body.mass[eid] = 1

  addComponent(world, Sprite, eid)
  Sprite.spritesheet[eid] = spriteSheet
  Sprite.frame[eid] = tile
  Sprite.rotation[eid] = opts.rotation
  Sprite.scaleX[eid] = opts.scaleX
  Sprite.scaleY[eid] = opts.scaleY

  return eid
}

export function createCheckpoint(world, x, y, w, h) {
  const eid = createCollider(world, x, y, w, h)
  addComponent(world, Checkpoint, eid)
  addComponent(world, Sensor, eid)
}

export function createDamageZone(world, x, y, w, h) {
  const eid = createCollider(world, x, y, w, h)
  addComponent(world, DamageZone, eid)
  addComponent(world, Sensor, eid)
}

export function createWarp(world, x, y, w, h, level) {
  const levelID = world.levels.findIndex(name => name === level)

  if (levelID >= 0) {
    const eid = createCollider(world, x, y, w, h)
    addComponent(world, Warp, eid)
    Warp.id[eid] = levelID
    addComponent(world, Sensor, eid)
    return eid
  }

  return -1
}

export function createCoin(world, spriteSheet) {
  const spin = createAnimation(world, 6, 100, 0)
  const collect = createAnimation(world, 6, 100, 7, false)

  const w = SpriteSheet.frameWidth[spriteSheet]
  const h = SpriteSheet.frameHeight[spriteSheet]

  return (x, y) => {
    const eid = createSprite(world, spriteSheet, 0, x + w, y)

    addComponent(world, Collider, eid)
    Collider.width[eid] = w
    Collider.height[eid] = h
    Collider.offsetX[eid] = w
    Collider.offsetY[eid] = h

    addComponent(world, CoinAnimation, eid)
    CoinAnimation.spin[eid] = spin
    CoinAnimation.collect[eid] = collect

    addComponent(world, CurrentAnimation, eid)
    CurrentAnimation.id[eid] = spin

    addComponent(world, Coin, eid)
    Coin.audio[eid] = world.audioIDs.coin

    addComponent(world, Sensor, eid)

    return eid
  }
}

export function createPlayer(world, spriteSheet) {
  const idle = createAnimation(world, 3, 100, 0)
  const walk = createAnimation(world, 3, 100, 3)

  const w = SpriteSheet.frameWidth[spriteSheet]
  const h = SpriteSheet.frameHeight[spriteSheet]

  return (x, y) => {
    const eid = createCollider(world, x - (w / 2), y - (h / 2), w, h)

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
    Intent.dashStrength[eid] = 0.65
    Intent.dashAudio[eid] = world.audioIDs.bark
    Intent.movement[eid] = 0
    Intent.jump[eid] = 0
    Intent.dash[eid] = 0

    addComponent(world, ReceivesInput, eid)
    addComponent(world, Dynamic, eid)
    addComponent(world, Player, eid)
    addComponent(world, Purse, eid)
    addComponent(world, LastCheckpoint, eid)

    return eid
  }
}