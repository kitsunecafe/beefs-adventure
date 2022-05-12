import { Contact } from '../components/contact.js'
import { BaseProxy } from './base.js'

export class ContactProxy extends BaseProxy {
	constructor(eid) { super(Contact, eid) }

	get a() { return this.store.a[this.eid] }
	set a(val) { this.store.a[this.eid] = val }

	get b() { return this.store.b[this.eid] }
	set b(val) { this.store.b[this.eid] = val }

	get normalX() { return this.store.normalX[this.eid] }
	set normalX(val) { this.store.normalX[this.eid] = val }

	get normalY() { return this.store.normalY[this.eid] }
	set normalY(val) { this.store.normalY[this.eid] = val }
}
