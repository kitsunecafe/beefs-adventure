export function loadBuffer(context, timeout, url) {
	const to = timeout || 5000
	return new Promise((resolve, reject) => {
		setTimeout(reject, to, `timed out: ${url}`)

		const request = new XMLHttpRequest()
		request.open('GET', url, true)
		request.responseType = 'arraybuffer'

		request.onload = function () {
			context.decodeAudioData(
				request.response,
				function (buffer) {
					if (!buffer) {
						reject('error decoding file data: ' + url)
					}
					resolve(buffer)
				},
				reject
			)
		}

		request.onerror = reject
		request.send()
	})
}

export function loadBuffers(context, urls, timeout) {
	const to = timeout || 5000
	const load = loadBuffer.bind(null, context, to)
	return Promise.all(urls.map(load))
}
