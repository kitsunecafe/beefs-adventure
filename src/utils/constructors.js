import { addComponent, addEntity, hasComponent } from '../../static/js/bitecs.js'
import { Camera } from '../archetypes/camera.js'
import { Coin } from '../archetypes/coin.js'
import { Collider, Event, Sensor } from '../archetypes/collider.js'
import { Player } from '../archetypes/player.js'
import { Sprite } from '../archetypes/sprite.js'
import * as Component from '../components/index.js'
import { createArchetype, setValues } from './archetype.js'
import { hasProp, pipe } from './helpers.js'

const eqType = type => obj => obj.type === type

export const addPosition = (world, x, y) => id => {
  addComponent(world, Component.Position, id)
  Component.Position.x[id] = x
  Component.Position.y[id] = y
  return id
}

export function createObject(world, x, y, px, py) {
  const eid = addEntity(world)

  addComponent(world, Component.Position, eid)
  Component.Position.x[eid] = x
  Component.Position.y[eid] = y
  Component.Position.px[eid] = px || 1
  Component.Position.py[eid] = py || 1

  return eid
}

export function createCollider(world, x, y, width, height, oneWay) {
  const eid = pipe(
    createArchetype(world),
    setValues(Component.Position, { x, y }),
    setValues(Component.Collider, { width, height })
  )(Collider)

  if (oneWay) {
    addComponent(world, Component.OneWayCollider, eid)
  }

  return eid
}

export function createCamera(world, canvas, target) {
  return pipe(
    createArchetype(world),
    setValues(Component.Camera, {
      following: target,
      width: canvas.width,
      height: canvas.height,
      deadzoneX: canvas.width / 3,
      deadzoneY: canvas.height / 4
    })
  )(Camera)
}

const defaultAudioOptions = {
  loop: false
}

export function createAudio(world, audio, options) {
  const opts = Object.assign({}, defaultAudioOptions, options)
  const eid = addEntity(world)
  addComponent(world, Component.Audio, eid)
  Component.Audio.id[eid] = audio
  Component.Audio.loop[eid] = opts.loop ? 1 : 0
  return eid
}

export function createAnimation(world, frames, duration, first, loop) {
  const eid = addEntity(world)

  addComponent(world, Component.Animation, eid)
  Component.Animation.frames[eid] = frames
  Component.Animation.frameDuration[eid] = duration
  Component.Animation.firstFrame[eid] = first || 0
  Component.Animation.loop[eid] = loop == undefined || loop ? 1 : 0

  return eid
}

const defaultSpriteSheetOptions = {
  offsetX: 0,
  offsetY: 0
}

export function createSpriteSheet(world, texture, options) {
  const opts = Object.assign({}, defaultSpriteSheetOptions, options)
  const eid = addEntity(world)

  addComponent(world, Component.SpriteSheet, eid)
  Component.SpriteSheet.texture[eid] = texture
  Component.SpriteSheet.frameWidth[eid] = opts.frameWidth
  Component.SpriteSheet.frameHeight[eid] = opts.frameHeight
  Component.SpriteSheet.offsetX[eid] = opts.offsetX
  Component.SpriteSheet.offsetY[eid] = opts.offsetY

  return eid
}

const defaultSpriteOptions = {
  id: 0,
  px: 1,
  py: 1,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  index: 0
}

export function createSprite(world, spritesheet, frame, x, y, options) {
  const opts = Object.assign({}, defaultSpriteOptions, options)

  return pipe(
    createArchetype(world),
    setValues(Component.ID, { value: opts.id }),
    setValues(Component.Position, { x, y, px: opts.px, py: opts.py}),
    setValues(Component.Sprite, {
      spritesheet,
      frame,
      rotation: opts.rotation,
      scaleX: opts.scaleX,
      scaleY: opts.scaleY,
      index: opts.index
    })
  )(Sprite)
}

export function createSensor(world, x, y, width, height) {
  return pipe(
    createArchetype(world),
    setValues(Component.Position, { x, y }),
    setValues(Component.Collider, { width, height })
  )(Sensor)
}

export function createCheckpoint(world, x, y, width, height) {
  const eid = pipe(
    createArchetype(world),
    setValues(Component.Position, { x, y }),
    setValues(Component.Collider, { width, height }),
  )(Sensor)

  addComponent(world, Component.Checkpoint, eid)
  return eid
}

export function createDamageZone(world, x, y, width, height) {
  const eid = pipe(
    createArchetype(world),
    setValues(Component.Position, { x, y }),
    setValues(Component.Collider, { width, height }),
  )(Sensor)

  addComponent(world, Component.DamageZone, eid)
  return eid
}

export function createEvent(world, x, y, width, height, eventName, references) {
  const id = Object.values(world.events).findIndex(evt => evt.name === eventName)

  if (id >= 0) {
    const eid = pipe(
      createArchetype(world),
      setValues(Component.Position, { x, y }),
      setValues(Component.Collider, { width, height }),
      setValues(Component.Event, { id, references })
    )(Event)

    return eid
  }

  return -1
}

export function createText(world, x, y, width, height, text, options) {
  const eid = createSensor(world, x, y, width, height)

  addComponent(world, Component.Text, eid)
  Component.Text.id[eid] = world.text.add({
    text,
    options: Object.assign({}, options)
  })

  return eid
}

export function createWarp(world, x, y, w, h, level) {
  const levelID = world.scenes.findIndex(name => name === level)

  if (levelID >= 0) {
    const eid = createEvent(world, x, y, w, h, 'warp')
    if (eid > -1) {
      addComponent(world, Component.Warp, eid)
      Component.Warp.id[eid] = levelID

      return eid
    }
  }

  return -1
}

export function createCoin(world, spritesheet, animations, x, y, width, height, offsetX, offsetY) {
  const spin = animations.spin.eid
  const collect = animations.collect.eid
  const position = { x, y }

  return pipe(
    createArchetype(world),
    setValues(Component.Position, position),
    setValues(Component.Collider, { ...position, width, height, offsetX, offsetY }),
    setValues(Component.Sprite, { spritesheet, index: 1 }),
    setValues(Component.CoinAnimation, { spin, collect }),
    setValues(Component.CurrentAnimation, { id: spin }),
    setValues(Component.Coin, { audio: world.audioIDs.coin })
  )(Coin)
}

export function createPlayer(world, spritesheet, animations, id, x, y, width, height) {
  const idle = animations.idle.eid
  const walk = animations.walk.eid

  const position = {
    x: x - width / 2,
    y: y - height / 2
  }

  return pipe(
    createArchetype(world),
    setValues(Component.ID, { value: id }),
    setValues(Component.Position, position),
    setValues(Component.Collider, { width, height }),
    setValues(Component.Sprite, { spritesheet, index: 1 }),
    setValues(Component.EntityAnimation, { idle, walk }),
    setValues(Component.CurrentAnimation, { id: idle }),
    setValues(Component.Intent, { dashAudio: world.audioIDs.bark })
  )(Player)
}