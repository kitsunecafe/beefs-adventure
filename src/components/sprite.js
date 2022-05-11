import { defineComponent, Types } from 'https://esm.run/bitecs'

export const Sprite = defineComponent({
	spritesheet: Types.eid,
	frame: Types.ui16,
	rotation: Types.ui8,
	scaleX: Types.i8,
	scaleY: Types.i8
})
