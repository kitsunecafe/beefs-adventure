import Stats from '../utils/stats.module.js'

export default () => {
	const stats = new Stats()
	document.body.append(stats.dom)

	return world => {
		stats.update()
		return world
	}
}
