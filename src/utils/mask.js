export const maskNumber = number =>
	number.slice(-4) + number.padStart(number.length, '*');
