module.exports = {
	testEnvironment: 'node',
	setupFiles: ['<rootDir>/tests/setup.js'],
	clearMocks: true,
	collectCoverageFrom: [
		'routes/**/*.js',
		'middleware/**/*.js',
		'utils/**/*.js',
	],
};
