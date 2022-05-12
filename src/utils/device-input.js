// https://gablaxian.com/articles/creating-a-game-with-javascript/handling-user-input
const Key = () => ({
	isDown: false,
	pressedThisFrame: false,
	releasedThisFrame: false,
	dirty: false,
	press() {
		this.isDown = true
		this.pressedThisFrame = true
		this.releasedThisFrame = false
		this.dirty = true
	},
	release() {
		this.isDown = false
		this.pressedThisFrame = false
		this.releasedThisFrame = true
		this.dirty = true
	},
	tick() {
		if (this.dirty) {
			this.dirty = false
		} else {
			this.pressedThisFrame = false
			this.releasedThisFrame = false
		}
	}
})

export const Input = {
	gamepad: null,
	ticking: false,
	prevTimestamp: null,
	key: new Array(8).fill(0).map(Key),
	_keyboard: new Array(8).fill(0),

	init() {
		// Set up the keyboard events
		document.addEventListener('keydown', function (e) { Input.changeKey(e.keyCode, 1) })
		document.addEventListener('keyup', function (e) { Input.changeKey(e.keyCode, 0) })
	},

	// called on key up and key down events
	changeKey(which, to) {
		let index = -1

		switch (which) {
			case 65: case 37: index = 0; break; // left
			case 87: case 38: index = 2; break; // up
			case 68: case 39: index = 1; break; // right
			case 83: case 40: index = 3; break;// down
			case 32: index = 4; break; // attack (space bar)
			case 91: index = 5; break; // use item (cmd)
			case 88: index = 6; break; // start (x)
			case 90: index = 7; break; // select (z)
		}

		if (index >= 0) {
			const key = this.key[index]
			if (to && !key.isDown) key.press()
			else if (!to && key.isDown) key.release()
		}
	},

	tick() {
		this.key.forEach(k => k.tick())

		// We're only interested in one gamepad, which is the first.
		Input.gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0]

		if (!Input.gamepad)
			return

		// Don’t do anything if the current timestamp is the same as previous
		// one, which means that the state of the gamepad hasn’t changed.
		// The first check makes sure we’re not doing anything if the timestamps are empty or undefined.
		if (Input.gamepad.timestamp && (Input.gamepad.timestamp == Input.prevTimestamp)) {
			return
		}

		Input.prevTimestamp = gamepad.timestamp

		Input.updateKeys()
	},

	updateKeys() {
		// Map the d-pad
		this.key[0].isDown = gamepad.axes[0] <= -0.5 ? 1 : 0 // left
		this.key[1].isDown = gamepad.axes[0] >= 0.5 ? 1 : 0 // right
		this.key[2].isDown = gamepad.axes[1] <= -0.5 ? 1 : 0 // up
		this.key[3].isDown = gamepad.axes[1] >= 0.5 ? 1 : 0 // down

		// Map the Buttons
		this.key[4].isDown = gamepad.buttons[0] // attack (A)
		this.key[5].isDown = gamepad.buttons[1] // use item (B)

		this.key[6].isDown = gamepad.buttons[10] // start
		this.key[7].isDown = gamepad.buttons[9] // select
	}
}

export default Input
