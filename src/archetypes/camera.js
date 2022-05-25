import { defineArchetype, defineProperty, merge } from '../utils/archetype.js'
import { Camera as CameraComponent, Persistent } from '../components/index.js'
import { GameObject } from './game-object.js'

export const Camera = defineArchetype(
	merge(GameObject),
	defineProperty(CameraComponent),
	defineProperty(Persistent)
)

