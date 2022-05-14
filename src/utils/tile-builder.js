import { addComponent, addEntity } from 'https://esm.run/bitecs'
import { SpriteSheetProxy } from '../proxies/spritesheet.js'
import { Body, Position, Sprite, SpriteSheet } from '../components/index.js'
import { createCollider } from './constructors.js'

function spriteCreator(world, spriteSheetId) {
  return createSprite.bind(null, world, spriteSheetId)
}

function createSprite(world, spriteSheetId, tile, x, y, options) {
  const opts = Object.assign({}, defaultSpriteOptions, options)

  const eid = addEntity(world)
  addComponent(world, Position, eid)
  Position.x[eid] = x
  Position.y[eid] = y

  addComponent(world, Body, eid)
  Body.mass[eid] = 1

  addComponent(world, Sprite, eid)
  Sprite.spritesheet[eid] = spriteSheetId
  Sprite.frame[eid] = tile
  Sprite.rotation[eid] = opts.rotation
  Sprite.scaleX[eid] = opts.scaleX
  Sprite.scaleY[eid] = opts.scaleY

  return eid
}

function blockCreator(world, creator, fw, fh, tiles) {
  const width = Math.sqrt(tiles.length)

  const hfw = fw / 2
  const hfh = fh / 2

  return (x, y, w, h) => {
    createCollider(world, x, y, w * fw, h * fh, hfw, hfh)
    createPlatform(creator, x, y, w, h, tiles, width)
  }
}

const getTile = (max, width) => i => {
  if (i === 0) return 0
  else if (i === max) return width
  else return (i % (width - 1)) + 1
}
const index2d = w => (x, y) => w * y + x

function createPlatform(creator, sx, sy, w, h, tiles, tileWidth = 3) {
  const getX = getTile(w - 1, tileWidth - 1)
  const getY = getTile(h - 1, tileWidth - 1)
  const getIndex = index2d(tileWidth)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = sx + (x * 16)
      const py = sy + (y * 16)
      const tile = tiles[getIndex(getX(x), getY(y))]
      // console.log(x, y, getX(x), getY(y), getIndex(getX(x), getY(y)))
      creator(tile, px, py)
    }
  }
}

export class TileBuilder {
  constructor(world, textureID) {
    this.world = world
    this.textureID = textureID
    this.spritesheet = new SpriteSheetProxy(0)
  }

  createSpriteSheet(options) {
    this.spritesheet.eid = createSpriteSheet(this.world, this.textureID, options)
    this.spriteGenerator = spriteCreator(this.world, this.spritesheet.eid)
  }

  createSprite(tile, x, y, options) {
    return this.spriteGenerator(tile, x, y, options)
  }

  createBlock(tiles, x, y, w, h) {
    this.blockCreator = blockCreator(
      this.world,
      this.spriteGenerator,
      this.spritesheet.frameWidth,
      this.spritesheet.frameHeight,
      tiles
    )

    this.blockCreator(x, y, w, h)
  }
}
