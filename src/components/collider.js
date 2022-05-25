import { defineComponent, Types } from '../../static/js/bitecs.js'
import { Dimensions, Vector2 } from './types.js'

export const Collider = defineComponent({
	...Vector2,
	...Dimensions,
	offsetX: Types.f32,
	offsetY: Types.f32
}, 1024)
