export class Point {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
}

export class Rectangle extends Point {
	constructor(x, y, w, h) {
		super(x, y)

		this.width = w
		this.height = h
		this.right = this.left + this.width
		this.bottom = this.top + this.height
	}

	within(bounds) {
		return bounds.left <= this.left &&
			bounds.right >= this.right &&
			bounds.top <= this.top &&
			bounds.bottom >= this.bottom
	}
}
