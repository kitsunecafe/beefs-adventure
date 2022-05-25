import { defineArchetype, defineProperty, merge } from '../utils/archetype.js'
import {
	CurrentAnimation,
	Dynamic,
	EntityAnimation,
	Intent,
	LastCheckpoint,
	PassThroughPlatforms,
	Persistent,
	Player as PlayerComponent,
	Purse,
	ReceivesInput
} from '../components/index.js'
import { Sprite } from './sprite.js'
import { Collider } from './collider.js'

export const Player = defineArchetype(
	merge(Sprite),
	merge(Collider),
	defineProperty(Intent, {
		speed: 1.5,
		jumpStrength: 0.02,
		dashStrength: 0.65,
		jumpDelay: 0.1,
		dashDelay: 0.1
	}),
	defineProperty(EntityAnimation),
	defineProperty(CurrentAnimation),
	defineProperty(ReceivesInput),
	defineProperty(Dynamic),
	defineProperty(Purse),
	defineProperty(Persistent),
	defineProperty(LastCheckpoint),
	defineProperty(PassThroughPlatforms),
	defineProperty(PlayerComponent)
)
