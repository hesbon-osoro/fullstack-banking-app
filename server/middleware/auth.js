const jwt = require('jsonwebtoken');
const { pool } = require('../db/connect');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
	try {
		const token = req.cookies.token;
		const decoded = jwt.verify(token, process.env.SECRET);
		const result = await pool.query(
			'select b.userid, b.first_name, b.last_name, b.email, t.access_token from bank_user b inner join tokens t on b.userid=t.userid where access_token=$1 and t.userid=$2',
			[token, decoded.userid]
		);
		const user = result.rows[0];
		if (user) {
			req.user = user;
			req.token = token;
			next();
		} else {
			throw new Error('Error while authenticating');
		}
	} catch (error) {
		res.status(400).json({ auth_error: 'Authentication failed.' });
	}
};

module.exports = authMiddleware;
