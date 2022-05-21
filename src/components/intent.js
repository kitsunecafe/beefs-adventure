import { defineComponent, Types } from '../../static/js/bitecs.js'

export const Intent = defineComponent({
	speed: Types.f32,
	jumpStrength: Types.f32,
	jumpAudio: Types.ui8,
	dashStrength: Types.f32,
	dashAudio: Types.ui8,
	movement: Types.f32,
	jump: Types.f32,
	jumpDelay: Types.f32,
	jumpCooldown: Types.f32,
	dash: Types.f32,
	dashDelay: Types.f32,
	dashCooldown: Types.f32
})
