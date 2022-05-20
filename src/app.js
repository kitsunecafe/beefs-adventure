import { createWorld } from '../static/js/bitecs.js'

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
import warpSystem from './systems/warp.js'
import removalSystem from './systems/removal.js'
import checkpointSystem from './systems/checkpoint.js'
import respawnSystem from './systems/respawn.js'
import resourceLoader from './systems/resource-loader.js'
import levelLoader from './systems/level-loader.js'
import eventSystem from './systems/events.js'
import textSystem from './systems/text.js'

import raf from './utils/raf.js'
import { pipeAsync as pipe } from './utils/helpers.js'

async function create() {
  const canvas = TC(document.querySelector('main canvas'))

  const world = createWorld()
  world.time = { fixedDelta: 0, delta: 0, elapsed: 0, elapsedFrames: 0 }
  world.canvas = canvas
  world.levels = ['level-1.tmj', 'level-2.tmj', 'level-3.tmj', 'end.tmj']

  const state = {
    canvas,
    world,
    startSystems: pipe(
      resourceLoader(),
    ),
    updateSystems: pipe(
      levelLoader(canvas),
      // statsSystem(),
      inputSystem(),
      spritesheetSystem(),
      colliderSystem(),
      collectSystem(),
      checkpointSystem(),
      respawnSystem(),
      physicsSystem(),
      groundCheckSystem(),
      warpSystem(),
      eventSystem()
    ),
    renderSystems: pipe(
      audioSystem(world.audioContext),
      animationSystem(),
      animatorSystem(),
      cameraSystem(),
      removalSystem(),
      textSystem(),
      rendererSystem(canvas)
    )
  }

  await state.startSystems(world)

  raf(update.bind(null, state), render.bind(null, state), { fps: 60 })
}

function update(state, dt) {
  state.world.time.fixedDelta = dt
  state.world.time.fixedElapsed += dt

  state.updateSystems(state.world)
}

function render(state, dt) {
  state.world.time.delta = dt
  state.world.time.elapsed += dt
  state.world.time.elapsedFrames++

  state.renderSystems(state.world)
}

create()
