import { addComponent } from 'https://esm.run/bitecs'

export class BaseProxy {
	constructor(store, eid) {
		this.eid = eid
		this.store = store
	}

	create(world) {
		addComponent(world, this.store, this.eid)
	}
}
