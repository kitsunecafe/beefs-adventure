import { addComponent, removeComponent } from 'https://esm.run/bitecs'
import { Contact, PossibleContact } from '../components/index.js'
import { BaseProxy } from './base.js'
import { Vector2Proxy } from './vector2.js'

export class BaseContactProxy extends Vector2Proxy {
	get first() { return this.store.first[this.eid] }
	set first(val) { this.store.first[this.eid] = val }
	get second() { return this.store.second[this.eid] }
	set second(val) { this.store.second[this.eid] = val }
}

export class ContactProxy extends BaseContactProxy {
	constructor(eid) { super(Contact, eid) }

	fromPossibleContact(possible) {
		this.first = possible.first
		this.second = possible.second
	}
}

export class PossibleContactProxy extends BaseContactProxy {
	constructor(eid) { super(PossibleContact, eid) }
}
