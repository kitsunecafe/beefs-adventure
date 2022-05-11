// https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop/

function timestamp() {
	return window.performance && window.performance.now ? window.performance.now() : new Date().getTime()
}

const defaultOptions = {
	fps: 60
}

export function raf(update, render, options) {
	const opts = Object.assign({}, defaultOptions, options)
	let now
	let dt = 0
	let last = timestamp()
	let step = 1 / opts.fps

	function frame() {
		now = timestamp()
		dt = dt + Math.min(1, (now - last) / 1000)

		while (dt > step) {
			dt = dt - step
			update(step)
		}

		render(dt)
		last = now
		requestAnimationFrame(frame)
	}

	requestAnimationFrame(frame)
}

export default raf
