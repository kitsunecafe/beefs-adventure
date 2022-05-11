import { Collider } from '../components/index.js'
import { Vector2Proxy } from './vector2.js'

export class RectProxy extends Vector2Proxy {
	get width() { return this.store.width[this.eid] }
	set width(val) { this.store.width[this.eid] = val }
	get height() { return this.store.height[this.eid] }
	set height(val) { this.store.height[this.eid] = val }
}

export class ColliderProxy extends RectProxy {
	constructor(eid) { super(Collider, eid) }
}
