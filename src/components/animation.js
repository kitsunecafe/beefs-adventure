import { defineComponent, Types } from '/static/js/bitecs.mjs'

export const Animation = defineComponent({
	id: Types.ui8,
	frames: Types.ui16,
	frameDuration: Types.ui8,
	firstFrame: Types.ui16,
	loop: Types.ui8
})
