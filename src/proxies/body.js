import { Body } from '../components/index.js'
import { BaseProxy } from './base.js'

export class BodyProxy extends BaseProxy {
	constructor(eid) { super(Body, eid) }

	get index() { return this.store.index[this.eid] }
	set index(val) { this.store.index[this.eid] = val }

	get mass() { return this.store.mass[this.eid] }
	set mass(val) { this.store.mass[this.eid] = val }

	get grounded() { return this.store.grounded[this.eid] }
	set grounded(val) { this.store.grounded[this.eid] = val }

	get facing() { return this.store.facing[this.eid] }
	set facing(val) { this.store.facing[this.eid] = val }
}
