export function Actions(input) {
	// input.init()

	const jump = {
		key: 88,
		gamepad: 0
	}

	const dash = {
		key: 90,
		gamepad: 1
	}

	return {
		get movement() {
			return input.getAxis().x
		},

		get jump() {
			return input.getButtonDown(jump)
		},

		get dash() {
			return input.getButtonDown(dash)
		},
		// get movement() {
		// 	return +input.key[1].isDown - +input.key[0].isDown
		// },

		// get jump() {
		// 	return input.key[6].pressedThisFrame || input.key[2].pressedThisFrame
		// },

		// get dash() {
		// 	return input.key[7].pressedThisFrame
		// },

		update() {
			input.update()
		}
	}
}
