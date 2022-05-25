import { defineArchetype, defineProperty, merge } from '../utils/archetype.js'
import { Body as BodyComponent, Collider as ColliderComponent, Event as EventComponent, Sensor as  SensorComponent } from '../components/index.js'
import { GameObject } from './game-object.js'

export const Collider = defineArchetype(
	merge(GameObject),
	defineProperty(ColliderComponent),
	defineProperty(BodyComponent, { mass: 1 })
)
export const Sensor = defineArchetype(
	merge(Collider),
	defineProperty(SensorComponent)
)

export const Event = defineArchetype(
	merge(Sensor),
	defineProperty(EventComponent)
)
