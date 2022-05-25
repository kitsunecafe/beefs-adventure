import { defineComponent, Types } from '../../static/js/bitecs.js'
import { Vector2 } from './types.js'

export const Position = defineComponent({
	...Vector2,
	px: Types.f32,
	py: Types.f32
}, 1024)
