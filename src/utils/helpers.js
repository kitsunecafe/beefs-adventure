export async function load(src) {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => resolve(image)
		image.onerror = reject
		image.src = src
	})
}

export const identity = x => x
export const zip = (a, b) => Object.fromEntries(a.map((e, i) => ([e, b[i]])))
export const range = n => ([...Array(n).keys()])
export const compose = (...functions) => input => functions.reduceRight((value, func) => func(value), input)
export const composeAsync = (...functions) => input => functions.reduceRight((chain, func) => chain.then(func), Promise.resolve(input))
export const pipe = (...functions) => input => functions.reduce((value, func) => func(value), input)
export const pipeAsync = (...functions) => input => functions.reduce((chain, func) => chain.then(func), Promise.resolve(input))
export const not = fn => compose(not, fn)
export const isNull = val => val === null || val === undefined
export const notNull = not(isNull)

export const tap = fn => val => {
	fn(val)
	return val
}

export const flat = depth => iter => isNull(iter) ? [] : iter.flat(depth)
export const filter = fn => iter => isNull(iter) ? [] : iter.filter(fn)
export const map = fn => iter => isNull(iter) ? [] : iter.map(fn)
export const mapObj = fn => pipe(
	Object.entries,
	map(fn),
	Object.fromEntries
)

export const prop = key => obj => obj[key]
export const hasProp = key => obj => obj && obj.hasOwnProperty(key)
