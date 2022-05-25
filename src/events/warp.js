import { addComponent, addEntity, hasComponent } from '../../static/js/bitecs'
import { LoadLevel, Warp } from '../components/index.js'

export const name = 'warp'

export async function execute(world, eventId, eid1, eid2) {
	let warp

	if (hasComponent(world, Warp, eid1)) {
		warp = eid1
	} else if (hasComponent(world, Warp, eid2)) {
		warp = eid2
	} else {
		return
	}

	const eid = addEntity(world)
	addComponent(world, LoadLevel, eid)
	LoadLevel.id[eid] = Warp.id[warp]
}
