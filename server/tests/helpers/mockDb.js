const jwt = require('jsonwebtoken');

/**
 * Builds a fake pg Pool/Client. Every `query` call is recorded in
 * `calls` so tests can assert on both the SQL text and the parameters
 * that were sent, without needing a live Postgres instance.
 */
const createMockClient = (options = {}) => {
	const calls = [];
	const respond = sql => {
		if (options.respond) return options.respond(sql);
		return { rows: [] };
	};

	const client = {
		calls,
		query: jest.fn(async sql => {
			calls.push(sql);
			return respond(sql);
		}),
		release: jest.fn(),
	};

	const pool = {
		calls,
		query: jest.fn(async sql => {
			calls.push(sql);
			return respond(sql);
		}),
		connect: jest.fn(async () => client),
	};

	return { client, pool, calls };
};

/** A valid signed token plus the cookie object the auth middleware expects. */
const authCookie = (userid = 1, email = 'test@example.com') => ({
	token: jwt.sign({ userid, email }, process.env.secret),
});

module.exports = { createMockClient, authCookie };
