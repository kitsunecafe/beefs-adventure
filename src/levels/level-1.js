import { createCamera, createCoin, createPlayer } from '../utils/constructors.js'
import { TileBuilder } from '../utils/tile-builder.js'

export default (world, canvas) => {
  const player = createPlayer(world, (10 * 16), 50)
  createCamera(world, canvas.c, player)
  const builder = new TileBuilder(world, world.textureIDs.tiles)
  builder.createSpriteSheet()
	createCoin(world, 16 * 3, 320 - 32)

  const tiles = [0, 1, 2, 12, 13, 14, 54, 55, 56]
  const middleTiles = [1, 1, 1, 13, 13, 13, 55, 55, 55]
  const leftTiles = [0, 1, 1, 12, 13, 13, 54, 55, 55]
  const rightTiles = [0, 1, 2, 13, 13, 14, 55, 55, 56]

  builder.createBlock(leftTiles, 0, 320, 10, 2)
  builder.createBlock(rightTiles, 10 * 16, 320 - 16, 5, 3)
  builder.createBlock(tiles,  17 * 16, 320 - 16, 10, 3)
  builder.createBlock(leftTiles,  30 * 16, 320, 10, 2)
  builder.createBlock(middleTiles,  40 * 16, 320 - 16, 3, 3)
  builder.createBlock(middleTiles,  43 * 16, 320 - 32, 3, 4)
  builder.createBlock(rightTiles,  46 * 16, 320 - (16 * 3), 3, 5)
}
