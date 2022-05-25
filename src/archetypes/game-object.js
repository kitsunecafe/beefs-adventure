import { ID, Position } from '../components/index.js'
import { defineArchetype, defineProperty } from '../utils/archetype.js'

export const GameObject = defineArchetype(
	defineProperty(ID),
	defineProperty(Position, { px: 1, py: 1 })
)
