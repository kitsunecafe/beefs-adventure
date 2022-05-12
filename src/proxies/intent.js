import { Intent } from '../components/index.js'
import { BaseProxy } from './base.js'

export class IntentProxy extends BaseProxy {
	constructor(eid) { super(Intent, eid) }
	get speed() { return this.store.speed[this.eid] }
	set speed(val) { this.store.speed[this.eid] = val }

	get jumpStrength() { return this.store.jumpStrength[this.eid] }
	set jumpStrength(val) { this.store.jumpStrength[this.eid] = val }

	get dashStrength() { return this.store.dashStrength[this.eid] }
	set dashStrength(val) { this.store.dashStrength[this.eid] = val }

	get dashAudio() { return this.store.dashAudio[this.eid] }
	set dashAudio(val) { this.store.dashAudio[this.eid] = val }

	get movement() { return this.store.movement[this.eid] }
	set movement(val) { this.store.movement[this.eid] = val }

	get jump() { return this.store.jump[this.eid] }
	set jump(val) { this.store.jump[this.eid] = val }

	get dash() { return this.store.dash[this.eid] }
	set dash(val) { this.store.dash[this.eid] = val }
}
