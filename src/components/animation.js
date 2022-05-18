import { defineComponent, Types } from '/static/js/bitecs.mjs'

export const Animation = defineComponent({
	id: Types.ui8,
	frames: Types.ui8,
	frameDuration: Types.ui8,
	firstFrame: Types.ui8,
	loop: Types.ui8
})
