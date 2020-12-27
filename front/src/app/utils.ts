// Pseudorandom integer from range [min, max)
export const randomInt = (min: number, max: number) => {
	return min + Math.floor((max - min) * Math.random());
};