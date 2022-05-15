export async function load(src) {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => resolve(image)
		image.onerror = reject
		image.src = src
	})
}

export const zip = (a, b) => Object.fromEntries(a.map((e, i) => ([e, b[i]])))
export const range = n => ([...Array(n).keys()])
export const pipe = (...functions) => input => functions.reduce((chain, func) => chain.then(func), Promise.resolve(input));

