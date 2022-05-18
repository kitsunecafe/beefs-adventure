import { defineComponent, Types } from '/static/js/bitecs.mjs'

export const Body = defineComponent({
	mass: Types.f32,
	index: Types.ui8,
	grounded: Types.ui8,
	facing: Types.i8
})
