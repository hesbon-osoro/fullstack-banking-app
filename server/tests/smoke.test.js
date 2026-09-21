const request = require('supertest');
const express = require('express');

// Prove the harness itself works before relying on it: an in-process
// express app must be reachable through supertest with no open port.
describe('test harness', () => {
	it('serves an in-process express app through supertest', async () => {
		const app = express();
		app.get('/ping', (_req, res) => res.json({ ok: true }));

		const response = await request(app).get('/ping');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ ok: true });
	});

	it('runs the setup file and exposes the test secret', () => {
		expect(process.env.secret).toBeDefined();
	});
});
