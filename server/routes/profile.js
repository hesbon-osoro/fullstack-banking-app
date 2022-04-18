const express = require('express');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db/connect');
const { isInvalidField } = require('../utils/common');

const Router = express.Router();

Router.post('/profile', authMiddleware, async (req, res) => {
	try {
		const { first_name, last_name } = req.body;

		const validFieldsToUpdate = ['first_name', 'last_name'];
		const receivedFields = Object.keys(req.body);

		const isInvalidFieldProvided = isInvalidField(
			receivedFields,
			validFieldsToUpdate
		);

		if (isInvalidFieldProvided) {
			return res.status(400).json({ update_error: 'Invalid field' });
		}
		const result = await pool.query(
			'update bank_user set first_name=$1, last_name=$2 where userid=$3 returning userid, first_name, last_name, email',
			[first_name, last_name, req.user.userid]
		);
		res.json(result.rows[0]);
	} catch (e) {
		res.status(400).json({
			update_error: 'Error while updating profile...Try again later.',
		});
	}
});

Router.get('/profile', authMiddleware, async (req, res) => {
	try {
		res.json(req.user);
	} catch (e) {
		res.status(400).json({
			update_error: 'Error while getting profile data...Try again later.',
		});
	}
});

module.exports = Router;
