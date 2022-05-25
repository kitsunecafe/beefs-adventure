import { addComponent, addEntity } from '../../static/js/bitecs'
import { assign, concat, isNull, map, pipe, uniqBy } from './helpers.js'

export const defineArchetype = (...properties) => pipe(...properties)([])

const define = (component, defaultValues) => ({ component, defaultValues })
export const defineProperty = (component, defaultValues) => archetype => ([
	...archetype,
	define(component, defaultValues)
])

export const setValues = (component, values) => eid => {
	if (isNull(component) || isNull(values)) return eid
	const combined = assign(values)

	pipe(
		Object.entries,
		map(([key, value]) => component[key][eid] = value)
	)(combined)

	return eid
}

const createProperty = (world, eid) => property => {
	addComponent(world, property.component, eid)
	setValues(property.component, property.defaultValues)(eid)

	return eid
}

export const addArchetype = (world, archetype) => eid => {
	map(createProperty(world, eid))(archetype)
	return eid
}

export const createArchetype = world => archetype => {
	const eid = addEntity(world)
	return addArchetype(world, archetype)(eid)
}

const mergeArchetypes = uniqBy(arch => arch.component)
export const merge = b => a => mergeArchetypes(concat(b)(a))
