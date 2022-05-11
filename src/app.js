import { addComponent, addEntity, createWorld, pipe } from 'https://esm.run/bitecs'
import {
  Animation,
  Body,
  Camera,
  Collider,
  CurrentAnimation,
  Dynamic,
  EntityAnimation,
  Intent,
  Position,
  ReceivesInput,
  SpriteSheet,
  Sprite
} from './components/index.js'

import animationSystem from './systems/animation.js'
import spritesheetSystem from './systems/spritesheet.js'
import cameraSystem from './systems/camera.js'
import rendererSystem from './systems/renderer.js'
import inputSystem from './systems/input.js'
import animatorSystem from './systems/animator.js'
import colliderSystem from './systems/collider.js'
import physicsSystem from './systems/physics.js'
import statsSystem from './systems/stats.js'

import Input from './utils/device-input.js'
import { Actions } from './utils/actions.js'
import raf from './utils/raf.js'
import { TileBuilder } from './utils/tile-builder.js'
import { createObject } from './utils/constructors.js'

async function load(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

const zip = (a, b) => Object.fromEntries(a.map((e, i) => ([e, b[i]])))

const loadImages = map => {
  const keys = Object.keys(map)

  return Promise.all(Object.values(map).map(load)).then(images => zip(keys, images))
}

const range = n => ([...Array(n).keys()])

async function create() {
  const canvas = TC(document.querySelector('main canvas'))
  canvas.bkg(0.2, 0.2, 0.2)
  const gl = canvas.g

  const sources = {
    dog: 'static/dog2.png',
    brick: 'static/brick.png',
    tiles: 'static/tiles_packed.png',
    mvtiles: 'static/tiles/tileset.png'
  }

  const images = await loadImages(sources)
  const world = createWorld()
  world.time = { delta: 0, elapsed: 0, elapsedFrames: 0 }

  const keys = Object.keys(images)
  world.textures = Object.values(images).map(img => TCTex(gl, img, img.width, img.height))
  world.textureIDs = zip(keys, range(world.textures.length))
  world.actions = Actions(Input)

  const player = createPlayer(world, 40 * 16, 50)
  createCamera(world, canvas.c, player.eid)
  const builder = new TileBuilder(world, world.textureIDs.mvtiles)
  builder.createSpriteSheet()

  const tiles = [0, 1, 2, 12, 13, 14, 54, 55, 56]
  const middleTiles = [1, 1, 1, 13, 13, 13, 55, 55, 55]
  const leftTiles = [0, 1, 1, 12, 13, 13, 54, 55, 55]
  const rightTiles = [0, 1, 2, 13, 13, 14, 55, 55, 56]

  builder.createBlock(leftTiles, 0, 320, 10, 2)
  builder.createBlock(rightTiles, 10 * 16, 320 - 16, 5, 3)
  builder.createBlock(tiles,  17 * 16, 320 - 16, 10, 3)
  builder.createBlock(leftTiles,  30 * 16, 320, 10, 2)
  builder.createBlock(middleTiles,  40 * 16, 320 - 16, 3, 3)
  builder.createBlock(middleTiles,  43 * 16, 320 - 32, 3, 4)
  builder.createBlock(rightTiles,  46 * 16, 320 - (16 * 3), 3, 5)

  const state = {
    canvas,
    world,
    updateSystems: pipe(
      statsSystem(),
      inputSystem(),
      spritesheetSystem(),
      colliderSystem(),
      physicsSystem(),
    ),
    renderSystems: pipe(
      animationSystem(),
      animatorSystem(),
      cameraSystem(),
      rendererSystem(canvas)
    )
  }

  raf(update.bind(null, state), render.bind(null, state), { fps: 60 })
}

function createCamera(world, canvas, target) {
  const eid = createObject(world, 0, 0)

  addComponent(world, Camera, eid)
  Camera.following[eid] = target

  Camera.width[eid] = canvas.width
  Camera.height[eid] = canvas.height

  Camera.deadzoneX[eid] = canvas.width / 4
  Camera.deadzoneY[eid] = canvas.height / 4
}

// TODO Use proxies and builders to clean this up
function createPlayer(world, x, y) {
  const idle = addEntity(world)
  addComponent(world, Animation, idle)
  Animation.frames[idle] = 3
  Animation.frameDuration[idle] = 10
  Animation.firstFrame[idle] = 0

  const walk = addEntity(world)
  addComponent(world, Animation, walk)
  Animation.frames[walk] = 3
  Animation.frameDuration[walk] = 10
  Animation.firstFrame[walk] = 3

  const ssId = addEntity(world)
  addComponent(world, SpriteSheet, ssId)
  SpriteSheet.texture[ssId] = world.textureIDs.dog
  SpriteSheet.frameWidth[ssId] = 16
  SpriteSheet.frameHeight[ssId] = 16

  const eid = addEntity(world)
  addComponent(world, Position, eid)
  Position.x[eid] = x
  Position.y[eid] = y

  addComponent(world, Sprite, eid)
  Sprite.spritesheet[eid] = ssId
  Sprite.frame[eid] = 0
  Sprite.rotation[eid] = 0
  Sprite.scaleX[eid] = 1
  Sprite.scaleY[eid] = 1

  addComponent(world, EntityAnimation, eid)
  EntityAnimation.idle[eid] = idle
  EntityAnimation.walk[eid] = walk

  addComponent(world, CurrentAnimation, eid)
  CurrentAnimation.id[eid] = idle

  addComponent(world, Collider, eid)
  const w = SpriteSheet.frameWidth[ssId]
  const h = SpriteSheet.frameHeight[ssId]
  const hw = w / 2
  const hh = h / 2

  const colX = x + Math.floor(w / 2) - hw
  const colY = h + Math.floor(h / 2) - hh

  Collider.x[eid] = colX
  Collider.y[eid] = colY
  Collider.width[eid] = h
  Collider.height[eid] = w

  addComponent(world, Intent, eid)
  Intent.speed[eid] = 1
  Intent.jumpStrength[eid] = 0.017
  Intent.dashStrength[eid] = 0.043
  Intent.movement[eid] = 0
  Intent.jump[eid] = 0
  Intent.dash[eid] = 0

  addComponent(world, Body, eid)
  Body.mass[eid] = 1
  Body.grounded[eid] = 0
  Body.facing[eid] = -1

  addComponent(world, ReceivesInput, eid)
  addComponent(world, Dynamic, eid)

  return {
    eid,
    spritesheet: ssId,
    animations: {
      idle,
      walk
    }
  }
}

function update(state, dt) {
  state.world.time.delta = dt
  state.world.time.elapsed += dt
  state.updateSystems(state.world)
}

function render(state, dt) {
  state.world.actions.tick()
  state.world.time.elapsedFrames++
  state.renderSystems(state.world)
}

create()
