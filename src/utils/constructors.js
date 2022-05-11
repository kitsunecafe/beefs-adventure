import { addComponent, addEntity } from 'https://esm.run/bitecs'
import { Body, Collider, Position } from '../components/index.js'

export function createObject(world, x, y) {
  const eid = addEntity(world)

  addComponent(world, Position, eid)
  Position.x[eid] = x
  Position.y[eid] = y

  return eid
}

export function createCollider(world, x, y, w, h) {
  const eid = createObject(world, x, y)

  addComponent(world, Collider, eid)
  Collider.x[eid] = x
  Collider.y[eid] = y
  Collider.width[eid] = w
  Collider.height[eid] = h

  addComponent(world, Body, eid)
  Body.mass[eid] = 1

  return eid
}
