const express = require('express');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db/connect');

const Router = express.Router();

const getAccountByAccountId = async account_id => {
	try {
		const result = await pool.query(
			'select * from account a inner join bank_user b on a.userid=b.userid where a.account_id=$1',
			[account_id]
		);
		return result.rows[0];
	} catch (err) {
		return null;
	}
};

const getAccountByEmail = async email => {
	try {
		const result = await pool.query(
			'select * from account a inner join bank_user b on a.userid=b.userid where b.email=$1',
			[email]
		);
		delete result.rows[0].password;
		return result.rows[0];
	} catch (err) {
		return null;
	}
};
// get account details by email
Router.get('/account', authMiddleware, async (req, res) => {
	try {
		const result = await getAccountByEmail(req.user.email);
		if (result) {
			res.json({ account: result });
		} else {
			res.status(400).json({ get_error: 'Account details do not exist.' });
		}
	} catch (e) {
		res.status(400).json({
			get_error: 'Error while getting account details...Try again later.',
		});
	}
});

Router.post('/account', authMiddleware, async (req, res) => {
	const { account_no, bank_name, ifsc } = req.body;
	try {
		await pool.query(
			'insert into account(account_no, bank_name, ifsc,userid) values($1,$2,$3,$4)',
			[account_no, bank_name, ifsc, req.user.userid]
		);
	} catch (e) {
		res.json({ add_error: 'Error while adding new account...Try again later' });
	}
});

Router.patch('/account', authMiddleware, async (req, res) => {
	const { ifsc } = req.body;
	try {
		const result = await pool.query(
			'update account set ifsc=$1 where userid=$2 returning *',
			[ifsc, req.user.userid]
		);
		res.json({ account: result.rows[0] });
	} catch (e) {
		res.json({
			update_error: 'Error while updating account...Try again later.',
		});
	}
});

module.exports = { Router, getAccountByAccountId };
