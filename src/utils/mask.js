export const maskNumber = number =>
	number.slice(-4) + number.padStart(number.length, '*');

console.log(maskNumber(12548655));
