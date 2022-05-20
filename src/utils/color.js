export const hexToRGB = hex => (
	hex.replace('#', '').match(/#?.{1,2}/g).map(n => parseInt(n, 16) / 255)
)
