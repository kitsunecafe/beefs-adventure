import { addComponent, addEntity } from '../../static/js/bitecs.js'
import { LoadLevel } from '../components/index.js'
import { Actions } from '../utils/actions.js'
import { loadBuffers } from '../utils/bufferloader.js'
import Input from '../utils/input.js'
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
			bark: 'static/audio/bark.wav',
			door: 'static/audio/sfx_sounds_impact11.wav',
			bgm1: 'static/audio/Komiku - Time for the walk of the day.mp3',
			bgm2: 'static/audio/Komiku - Fetch Land.mp3',
			bgm3: 'static/audio/Komiku - Cat City.mp3',
			bgm4: 'static/audio/Komiku - Chillin\' Poupi.mp3',
			bgm5: 'static/audio/Komiku - Serenity Temple.mp3',
			bgm6: 'static/audio/Komiku - Mr Angst Theme.mp3',
			bgm7: 'static/audio/Komiku - Poupi\'s Theme.mp3'
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
		world.actions = Actions(Input(world.canvas.c, world.canvas.c.width, world.canvas.c.height))

		// Text & strings
		world.text = new Store(128)

		world.events = Events

		const eid = addEntity(world)
		addComponent(world, LoadLevel, eid)
		LoadLevel.id[eid] = 0

		return world
	}
}
