import { defineArchetype, defineProperty, merge } from '../utils/archetype.js'
import { Body as BodyComponent, Sprite as SpriteComponent } from '../components/index.js'
import { GameObject } from './game-object.js'

export const Sprite = defineArchetype(
	merge(GameObject),
	defineProperty(BodyComponent, { mass: 1 }),
	defineProperty(SpriteComponent, {
		scaleX: 1,
		scaleY: 1
	})
)
