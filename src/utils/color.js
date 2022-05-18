export const hexToRGB = hex => (
	hex.match(/.{1,2}/g).map(n => parseInt(n, 16) / 255)
)
