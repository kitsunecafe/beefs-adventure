import { defineComponent, Types } from '../../static/js/bitecs.js'

export const Collider = defineComponent({
	x: Types.f32,
	y: Types.f32,
	offsetX: Types.f32,
	offsetY: Types.f32,
	width: Types.f32,
	height: Types.f32
})

