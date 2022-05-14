import { createCamera, createCoin, createPlayer } from '../utils/constructors.js'
import { TileBuilder } from '../utils/tile-builder.js'

export default (world, canvas) => {
  const player = createPlayer(world, 2 * 16, 180)
  createCamera(world, canvas.c, player)
  const builder = new TileBuilder(world, world.textureIDs.ground)
  builder.createSpriteSheet()

  const Water = {
    tiles: [0, 1, 2, 12, 13, 14, 54, 55, 56],
    middle: [1, 1, 1, 13, 13, 13, 55, 55, 55],
    left: [0, 1, 1, 12, 13, 13, 54, 55, 55],
    right: [0, 1, 2, 13, 13, 14, 55, 55, 56]
  }

  const Rock = {
    tiles: [0, 1, 2, 12, 13, 14, 24, 25, 26]
  }
  const ground = 320

  const newBlock = buildFromStart(builder, 0, ground, 16, 16)
  newBlock(Water.left, 0, 0, 10, 2)
  newBlock(Water.right, 0, 1, 5, 3)
  createCoin(world, 16 * 15 + 12, ground - (3 * 16))

  newBlock(Water.tiles, 2, 1, 10, 3)
  createCoin(world, 16 * 28, ground - (3 * 16))

  newBlock(Water.left, 2, 0, 10, 2)
  newBlock(Water.middle, 0, 1, 3, 3)
  newBlock(Water.middle, 0, 2, 3, 4)
  newBlock(Water.middle, 0, 3, 3, 5)
  newBlock(Water.right, 0, 4, 3, 6)

  newBlock(Rock.tiles, 3, 5, 10, 2)
  createCoin(world, 16 * 57, ground - (5 * 16) - 10)
  createCoin(world, 16 * 59, ground - (5 * 16) - 10)
  createCoin(world, 16 * 61, ground - (5 * 16) - 10)

  builder.createBlock(Water.tiles, 53 * 16, ground, 20, 2)
  builder.createBlock(Water.tiles, 75 * 16, ground - 16, 20, 3)

  newBlock(Rock.tiles, 2, 5, 2, 2)
  newBlock(Rock.tiles, 2, 7, 2, 2)
  createCoin(world, 16 * 71 - 4, ground - (7 * 16) - 10)
  newBlock(Rock.tiles, 2, 9, 2, 2)

  newBlock(Rock.tiles, 0, 11, 2, 2)
  newBlock(Rock.tiles, 0, 13, 2, 2)
  newBlock(Rock.tiles, 0, 15, 10, 2)

  createCoin(world, 16 * 82, ground - (15 * 16) - 10)
  createCoin(world, 16 * 84, ground - (15 * 16) - 10)
  createCoin(world, 16 * 86, ground - (15 * 16) - 10)
  createCoin(world, 16 * 88, ground - (15 * 16) - 10)
}

const buildFromStart = (builder, start, ground, frameWidth, frameHeight) => {
  let x = start

  return (tiles, xOffset, yOffset, width, height) => {
    x += xOffset * frameWidth

    if (tiles && tiles.length > 0) {
      builder.createBlock(tiles, x, ground + (-yOffset * frameHeight), width, height)
    }

    x += width * frameWidth
  }
}
