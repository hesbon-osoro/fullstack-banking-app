const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const { createMockClient, authCookie } = require('./helpers/mockDb');

// The pg layer and auth middleware are replaced so the transaction route can
// be exercised in isolation. The route's own logic (which request property it
// reads, which SQL it builds) is the real subject under test.
jest.mock('../db/connect');
jest.mock('../middleware/auth', () =>
	jest.fn((req, _res, next) => {
		req.user = { userid: 1, email: 'test@example.com' };
		next();
	})
);

const { getClient, pool } = require('../db/connect');
const router = require('../routes/transactions');

const TRANSACTION_ROWS = [
	{
		formatted_date: '2024-03-15',
		withdraw_amount: null,
		deposit_amount: '500.00',
		balance: '1500.00',
	},
];

const buildApp = () => {
	const app = express();
	app.use(express.json());
	app.use(cookieParser());
	app.use(router);
	return app;
};

describe('GET /transactions/:id', () => {
	beforeEach(() => {
		const { client, pool: mockPool } = createMockClient();
		getClient.mockResolvedValue(client);
		pool.query.mockImplementation(async () => ({ rows: TRANSACTION_ROWS }));
	});

	it('applies the date range supplied by the client', async () => {
		const response = await request(buildApp())
			.get('/transactions/7')
			.set('Cookie', [`token=${authCookie().token}`])
			.query({ start_date: '2024-03-01', end_date: '2024-03-31' });

		expect(response.status).toBe(200);

		const [sql, params] = pool.query.mock.calls[0];
		expect(sql).toContain('between $2 and $3');
		expect(params).toEqual(['7', '2024-03-01', '2024-03-31']);
	});

	it('returns every transaction for the account when no date range is given', async () => {
		const response = await request(buildApp())
			.get('/transactions/7')
			.set('Cookie', [`token=${authCookie().token}`]);

		expect(response.status).toBe(200);

		const [sql, params] = pool.query.mock.calls[0];
		expect(sql).not.toContain('between');
		expect(params).toEqual(['7']);
	});

	it('returns the transaction rows to the client', async () => {
		const response = await request(buildApp())
			.get('/transactions/7')
			.set('Cookie', [`token=${authCookie().token}`]);

		expect(response.body).toEqual(TRANSACTION_ROWS);
	});

	it('responds with an error payload when the query fails', async () => {
		pool.query.mockRejectedValue(new Error('connection terminated'));

		const response = await request(buildApp())
			.get('/transactions/7')
			.set('Cookie', [`token=${authCookie().token}`]);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('transactions_error');
	});
});
