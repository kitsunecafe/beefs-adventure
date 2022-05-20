import { addComponent, addEntity } from '../../static/js/bitecs.js'
import { LoadLevel } from '../components/index.js'
import { Actions } from '../utils/actions.js'
import { loadBuffers } from '../utils/bufferloader.js'
import Input from '../utils/device-input.js'
import { range, zip } from '../utils/helpers.js'
import * as Events from '../events/index.js'
import Store from '../utils/store.js'

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
		world.audio = Object.values(audio)
		world.audioIDs = zip(
			Object.keys(audio),
			range(world.audio.length)
		)

		// Input
		world.actions = Actions(Input)

		// Text & strings
		world.text = new Store(128)
		
		world.events = Events

		const eid = addEntity(world)
		addComponent(world, LoadLevel, eid)
		LoadLevel.id[eid] = 3

		return world
	}
}
