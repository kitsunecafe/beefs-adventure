import { SpriteSheet } from '../components/index.js'
import { BaseProxy } from './base.js'

export class SpriteSheetProxy extends BaseProxy {
  constructor(eid) { super(SpriteSheet, eid) }

  get texture() { return this.store.texture[this.eid] }
  set texture(val) { this.store.texture[this.eid] = val }

  get frameWidth() { return this.store.frameWidth[this.eid] }
  set frameWidth(val) { this.store.frameWidth[this.eid] = val }

  get frameHeight() { return this.store.frameHeight[this.eid] }
  set frameHeight(val) { this.store.frameHeight[this.eid] = val }

  get columns() { return this.store.columns[this.eid] }
  set columns(val) { this.store.columns[this.eid] = val }

  get rows() { return this.store.rows[this.eid] }
  set rows(val) { this.store.rows[this.eid] = val }

  get offsetX() { return this.store.offsetX[this.eid] }
  set offsetX(val) { this.store.offsetX[this.eid] = val }

  get offsetY() { return this.store.offsetY[this.eid] }
  set offsetY(val) { this.store.offsetY[this.eid] = val }
}
