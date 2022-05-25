import { Coin as CoinComponent, CoinAnimation, CurrentAnimation, Sensor } from '../components/index.js'
import { defineArchetype, defineProperty, merge } from '../utils/archetype.js'
import { Collider } from './collider.js'
import { Sprite } from './sprite.js'

export const Coin = defineArchetype(
	merge(Collider),
	merge(Sprite),
	defineProperty(CoinAnimation),
	defineProperty(CurrentAnimation),
	defineProperty(CoinComponent),
	defineProperty(Sensor)
)
