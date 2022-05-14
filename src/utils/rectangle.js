export class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

export class Rectangle extends Point {
  constructor(x, y, w, h) {
    super(x, y)
    this.update(x, y, w, h)
  }

  update(x, y, w, h) {
    this.x = x
    this.y = y
    this.width = w || this.width
    this.height = h || this.height
    this.xMax = this.x + this.width
    this.yMax = this.y + this.height
  }

  within(bounds) {
    return bounds.x <= this.x &&
      bounds.xMax >= this.xMax &&
      bounds.y <= this.y &&
      bounds.xMax >= this.xMax
  }
}
