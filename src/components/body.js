import { defineComponent, Types } from '../../static/js/bitecs.js'

export const Body = defineComponent({
	mass: Types.f32,
	index: Types.ui8,
	grounded: Types.ui8,
	facing: Types.i8
})
