export function Actions(input) {
	input.init()

	return {
		get movement() {
			return +input.key[1].isDown - +input.key[0].isDown
		},

		get jump() {
			return input.key[6].pressedThisFrame || input.key[2].pressedThisFrame
		},

		get dash() {
			return input.key[7].pressedThisFrame
		},

		tick() {
			input.tick()
		}
	}
}
