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
		brick: 'static/brick.png'
	}

	const images = await loadImages(sources)
	const world = createWorld()
	world.time = { delta: 0, elapsed: 0, elapsedFrames: 0 }

	const keys = Object.keys(images)
	world.textures = Object.values(images).map(img => TCTex(gl, img, img.width, img.height))
	world.textureIDs = zip(keys, range(world.textures.length))
	world.actions = Actions(Input)

	const player = createPlayer(world, 50, 50)
	createCamera(world, canvas.c, player.eid)
	createPlatforms(world, 50, 100, 100, 16)

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
	const eid = addEntity(world)
	addComponent(world, Position, eid)
	Position.x[eid] = 0
	Position.y[eid] = 0

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
	Collider.x[eid] = x
	Collider.y[eid] = y
	Collider.height[eid] = SpriteSheet.frameHeight[ssId]
	Collider.width[eid] = SpriteSheet.frameWidth[ssId]

	addComponent(world, Intent, eid)
	Intent.speed[eid] = 1
	Intent.jumpStrength[eid] = 0.015
	Intent.dashStrength[eid] = 0.025
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

function createPlatforms(world, x, y, width, height) {
	const sid = addEntity(world)
	addComponent(world, SpriteSheet, sid)
	SpriteSheet.texture[sid] = world.textureIDs.brick
	SpriteSheet.frameWidth[sid] = 16
	SpriteSheet.frameHeight[sid] = 16

	const eid = addEntity(world)
	addComponent(world, Position, eid)
	Position.x[eid] = x
	Position.y[eid] = y

	addComponent(world, Collider, eid)
	Collider.x[eid] = x
	Collider.y[eid] = y
	Collider.width[eid] = width
	Collider.height[eid] = height

	addComponent(world, Body, eid)
	Body.mass[eid] = 1

	addComponent(world, Sprite, eid)
	Sprite.spritesheet[eid] = sid
	Sprite.frame[eid] = 0
	Sprite.rotation[eid] = 0
	Sprite.scaleX[eid] = 1
	Sprite.scaleY[eid] = 1

	return eid
}

function createTestEntity(world, player) {
	const eid = addEntity(world)
	addComponent(world, Position, eid)
	Position.x[eid] = 100
	Position.y[eid] = 50

	addComponent(world, Sprite, eid)
	Sprite.spritesheet[eid] = player.spritesheet
	Sprite.frame[eid] = 0
	Sprite.rotation[eid] = 0
	Sprite.scaleX[eid] = 1
	Sprite.scaleY[eid] = 1

	addComponent(world, EntityAnimation, eid)
	EntityAnimation.idle[eid] = player.animations.idle
	EntityAnimation.walk[eid] = player.animations.walk

	addComponent(world, CurrentAnimation, eid)
	CurrentAnimation.id[eid] = player.animations.idle

	return eid
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
