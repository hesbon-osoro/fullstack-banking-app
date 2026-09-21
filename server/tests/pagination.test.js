const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const { authCookie } = require('./helpers/mockDb');
const { parsePagination, buildPaginationMeta } = require('../utils/common');

jest.mock('../db/connect');
jest.mock('../middleware/auth', () =>
	jest.fn((req, _res, next) => {
		req.user = { userid: 1, email: 'test@example.com' };
		next();
	})
);

const { pool } = require('../db/connect');
const router = require('../routes/transactions');

const ROW = {
	formatted_date: '2024-03-15',
	withdraw_amount: null,
	deposit_amount: '500.00',
	balance: '1500.00',
};

const buildApp = () => {
	const app = express();
	app.use(express.json());
	app.use(cookieParser());
	app.use(router);
	return app;
};

const getWithCookie = url =>
	request(buildApp())
		.get(url)
		.set('Cookie', [`token=${authCookie().token}`]);

// The route issues two queries per paginated request: a count, then the page.
const stubCountThenRows = (total, rows) => {
	pool.query.mockImplementation(async sql => {
		if (sql.startsWith('select count(*)')) return { rows: [{ total }] };
		return { rows };
	});
};

describe('parsePagination', () => {
	it('falls back to page 1 and the default size when values are missing', () => {
		expect(parsePagination(undefined, undefined)).toEqual({
			page: 1,
			limit: 25,
		});
	});

	it.each([
		['0', undefined],
		['-3', undefined],
		['abc', undefined],
		['1.5', undefined],
		['', undefined],
	])('rejects invalid page %p and falls back to 1', raw => {
		expect(parsePagination(raw, undefined).page).toBe(1);
	});

	it('rejects invalid limits and falls back to the default', () => {
		expect(parsePagination('1', '0').limit).toBe(25);
		expect(parsePagination('1', '-10').limit).toBe(25);
		expect(parsePagination('1', 'nonsense').limit).toBe(25);
	});

	it('clamps an oversized limit to the maximum page size', () => {
		expect(parsePagination('1', '100000').limit).toBe(100);
	});
});

describe('buildPaginationMeta', () => {
	it('reports next and previous availability in the middle of a result set', () => {
		expect(buildPaginationMeta(100, 2, 25)).toEqual({
			total: 100,
			current_page: 2,
			per_page: 25,
			total_pages: 4,
			has_next_page: true,
			has_previous_page: true,
		});
	});

	it('marks the first page as having no previous page', () => {
		const meta = buildPaginationMeta(100, 1, 25);
		expect(meta.has_previous_page).toBe(false);
		expect(meta.has_next_page).toBe(true);
	});

	it('marks the last page as having no next page', () => {
		const meta = buildPaginationMeta(100, 4, 25);
		expect(meta.has_next_page).toBe(false);
		expect(meta.has_previous_page).toBe(true);
	});

	it('treats an empty result set as a single empty page', () => {
		expect(buildPaginationMeta(0, 1, 25)).toMatchObject({
			total: 0,
			total_pages: 1,
			has_next_page: false,
			has_previous_page: false,
		});
	});
});

describe('GET /transactions/:id pagination', () => {
	it('returns a bare array when no pagination parameters are supplied', async () => {
		stubCountThenRows(3, [ROW]);

		const response = await getWithCookie('/transactions/7');

		expect(response.body).toEqual([ROW]);
		expect(Array.isArray(response.body)).toBe(true);
	});

	it('returns data with pagination metadata when page is supplied', async () => {
		stubCountThenRows(60, [ROW]);

		const response = await getWithCookie('/transactions/7?page=1');

		expect(response.body.data).toEqual([ROW]);
		expect(response.body.pagination).toEqual({
			total: 60,
			current_page: 1,
			per_page: 25,
			total_pages: 3,
			has_next_page: true,
			has_previous_page: false,
		});
	});

	it('applies the requested page and limit as SQL limit and offset', async () => {
		stubCountThenRows(60, []);

		await getWithCookie('/transactions/7?page=3&limit=10');

		const [sql, params] = pool.query.mock.calls[1];
		expect(sql).toContain('limit $2 offset $3');
		expect(params).toEqual(['7', 10, 20]);
	});

	it('derives the offset from the page number as (page - 1) * limit', async () => {
		stubCountThenRows(500, []);

		await getWithCookie('/transactions/7?page=5&limit=25');

		const [, params] = pool.query.mock.calls[1];
		// page 5, limit 25 -> skip 100 rows
		expect(params).toEqual(['7', 25, 100]);
	});

	it('keeps the date filter in both the count and the page query', async () => {
		stubCountThenRows(2, [ROW]);

		await getWithCookie(
			'/transactions/7?page=1&limit=10&start_date=2024-03-01&end_date=2024-03-31'
		);

		const [countSql, countParams] = pool.query.mock.calls[0];
		const [pageSql, pageParams] = pool.query.mock.calls[1];

		expect(countSql).toContain('between $2 and $3');
		expect(countParams).toEqual(['7', '2024-03-01', '2024-03-31']);

		expect(pageSql).toContain('between $2 and $3');
		expect(pageSql).toContain('limit $4 offset $5');
		expect(pageParams).toEqual(['7', '2024-03-01', '2024-03-31', 10, 0]);
	});

	it('sends a deterministic order by clause so pages cannot overlap', async () => {
		stubCountThenRows(60, []);

		await getWithCookie('/transactions/7?page=2&limit=10');

		expect(pool.query.mock.calls[1][0]).toContain(
			'order by transaction_date desc, tr_id desc'
		);
	});

	it('returns an empty page rather than an error when the offset exceeds the total', async () => {
		stubCountThenRows(5, []);

		const response = await getWithCookie('/transactions/7?page=99&limit=10');

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual([]);
		expect(response.body.pagination).toMatchObject({
			total: 5,
			current_page: 99,
			has_next_page: false,
		});
	});

	it('falls back to defaults instead of failing on malformed pagination input', async () => {
		stubCountThenRows(5, [ROW]);

		const response = await getWithCookie(
			'/transactions/7?page=-1&limit=banana'
		);

		expect(response.status).toBe(200);
		expect(response.body.pagination).toMatchObject({
			current_page: 1,
			per_page: 25,
		});
	});

	it('still returns the error payload when the query fails', async () => {
		pool.query.mockRejectedValue(new Error('connection terminated'));

		const response = await getWithCookie('/transactions/7?page=1');

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('transactions_error');
	});
});
