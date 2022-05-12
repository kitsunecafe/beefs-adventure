import { createWorld, pipe } from 'https://esm.run/bitecs'

import animationSystem from './systems/animation.js'
import spritesheetSystem from './systems/spritesheet.js'
import cameraSystem from './systems/camera.js'
import rendererSystem from './systems/renderer.js'
import audioSystem from './systems/audio.js'
import inputSystem from './systems/input.js'
import animatorSystem from './systems/animator.js'
import colliderSystem from './systems/collider.js'
import physicsSystem from './systems/physics.js'
import statsSystem from './systems/stats.js'
import collectSystem from './systems/collect.js'
import groundCheckSystem from './systems/ground-check.js'
import removalSystem from './systems/removal.js'

import level1 from './levels/level-1.js'

import Input from './utils/device-input.js'
import { Actions } from './utils/actions.js'
import raf from './utils/raf.js'
import { loadBuffers } from './utils/bufferloader.js'
import { createAudio } from './utils/constructors.js'

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

  return Promise.all(Object.values(map).map(load)).then(zip.bind(null, keys))
}

const loadAudio = async (context, map) => {
  const keys = Object.keys(map)
  return loadBuffers(context, Object.values(map)).then(zip.bind(null, keys))
}

const range = n => ([...Array(n).keys()])

async function create() {
  const canvas = TC(document.querySelector('main canvas'))
  canvas.bkg(0.2, 0.25, 0.25)

  const world = createWorld()
  world.time = { delta: 0, elapsed: 0, elapsedFrames: 0 }


  const imageSources = {
    dog: 'static/image/dog2.png',
    tiles: 'static/image/tiles/tileset.png',
    water: 'static/image/tiles/fg_0.png',
    coin: 'static/image/misc/coin_anim.png'
  }

  const audioSources = {
    coin: 'static/audio/sfx_coin_single6.wav',
    bark: 'static/audio/bark.wav'
  }

  window.AudioContext = window.AudioContext || window.webkitAudioContext

  world.audioContext = new AudioContext()
  const audio = await loadAudio(world.audioContext, audioSources)
  const aKeys = Object.keys(audio)
  world.audio = Object.values(audio)
  world.audioIDs = zip(aKeys, range(world.audio.length))
  console.log(world.audioIDs)

  const gl = canvas.g
  const images = await loadImages(imageSources)
  const keys = Object.keys(images)
  world.textures = Object.values(images).map(img => TCTex(gl, img, img.width, img.height))
  world.textureIDs = zip(keys, range(world.textures.length))
  world.actions = Actions(Input)

  level1(world, canvas)

  const state = {
    canvas,
    world,
    updateSystems: pipe(
      statsSystem(),
      inputSystem(),
      spritesheetSystem(),
      colliderSystem(),
      collectSystem(),
      physicsSystem(),
      groundCheckSystem()
    ),
    renderSystems: pipe(
      audioSystem(world.audioContext),
      animationSystem(),
      animatorSystem(),
      cameraSystem(),
      removalSystem(),
      rendererSystem(canvas)
    )
  }

  raf(update.bind(null, state), render.bind(null, state), { fps: 60 })
}

function update(state, dt) {
  state.world.time.delta = dt
  state.world.time.elapsed += dt

  state.updateSystems(state.world)
}

function render(state, dt) {
  state.world.time.elapsedFrames++

  state.renderSystems(state.world)
}

create()
