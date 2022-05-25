import { defineComponent, Types } from '../../static/js/bitecs.js'
import { Dimensions } from './types.js'

export const Camera = defineComponent({
	...Dimensions,
	deadzoneX: Types.f32,
	deadzoneY: Types.f32,

	following: Types.eid
}, 8)
