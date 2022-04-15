export const maskNumber = number =>
	number.slice(-4).padStart(number.length, '*');
