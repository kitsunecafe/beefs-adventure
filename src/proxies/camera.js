import { Vector2 } from '../utils/math.js'
import { BaseProxy } from './base.js'
import { Camera } from '../components/index.js'

export class CameraProxy extends BaseProxy {
	constructor(eid) { super(Camera, eid) }

	get deadzoneX() { return this.store.deadzoneX[this.eid] }
	set deadzoneX(val) { this.store.deadzoneX[this.eid] = val }

	get deadzoneY() { return this.store.deadzoneY[this.eid] }
	set deadzoneY(val) { this.store.deadzoneY[this.eid] = val }

	get deadzone() { return new Vector2(this.deadzoneX, this.deadzoneY) }
	set deadzone(val) {
		this.deadzoneX = val.x
		this.deadzoneY = val.y
	}

	get width() { return this.store.width[this.eid] }
	set width(val) { this.store.width[this.eid] = val }

	get height() { return this.store.height[this.eid] }
	set height(val) { this.store.height[this.eid] = val }

	get following() { return this.store.following[this.eid] }
	set following(val) { this.store.following[this.eid] = val }
}
