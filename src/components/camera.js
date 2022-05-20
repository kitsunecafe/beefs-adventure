import { defineComponent, Types } from '../../static/js/bitecs.js'

export const Camera = defineComponent({
	deadzoneX: Types.f32,
	deadzoneY: Types.f32,

	width: Types.f32,
	height: Types.f32,

	following: Types.eid
})
