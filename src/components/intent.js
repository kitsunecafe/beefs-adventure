import { defineComponent, Types } from 'https://esm.run/bitecs'

export const Intent = defineComponent({
	speed: Types.f32,
	jumpStrength: Types.f32,
	dashStrength: Types.f32,
	movement: Types.f32,
	jump: Types.f32,
	dash: Types.f32
})
