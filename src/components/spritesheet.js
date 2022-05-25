import { defineComponent, Types } from '../../static/js/bitecs.js'

export const SpriteSheet = defineComponent({
	texture: Types.eid,
	frameWidth: Types.ui16,
	frameHeight: Types.ui16,
	columns: Types.ui8,
	rows: Types.ui8,
	offsetX: Types.ui16,
	offsetY: Types.ui16
}, 64)
