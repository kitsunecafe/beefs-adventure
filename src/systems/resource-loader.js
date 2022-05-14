import { Actions } from '../utils/actions.js'
import { loadBuffers } from '../utils/bufferloader.js'
import Input from '../utils/device-input.js'
import { range, zip } from '../utils/helpers.js'

const loadAudio = async (context, map) => {
	const keys = Object.keys(map)
	return loadBuffers(context, Object.values(map)).then(zip.bind(null, keys))
}

export default () => {
	return async world => {
		const audioSources = {
			coin: 'static/audio/sfx_coin_single6.wav',
			bark: 'static/audio/bark.wav'
		}

		// Audio
		window.AudioContext = window.AudioContext || window.webkitAudioContext

		world.audioContext = new AudioContext()
		const audio = await loadAudio(world.audioContext, audioSources)
		const aKeys = Object.keys(audio)
		world.audio = Object.values(audio)
		world.audioIDs = zip(aKeys, range(world.audio.length))

		// Input
		world.actions = Actions(Input)

		return world
	}
}
