import { Position } from '../components/index.js'
import { BaseProxy } from './base.js'

export class Vector2Proxy extends BaseProxy {
	get x() { return this.store.x[this.eid] }
	set x(val) { this.store.x[this.eid] = val }
	get y() { return this.store.y[this.eid] }
	set y(val) { this.store.y[this.eid] = val }

	isZero() { return this.x === 0 && this.y === 0 }
}

export class PositionProxy extends Vector2Proxy {
	constructor(eid) { super(Position, eid) }
}
