require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connect');
const puppeteer = require('puppeteer');
const moment = require('moment');
const path = require('path');

const isInvalidField = (receivedFields, validFieldsToUpdate) => {
	return receivedFields.some(
		field => validFieldsToUpdate.indexOf(field) === -1
	);
};

const validateUser = async (email, password) => {
	const result = await pool.query(
		'select userid, email, password from bank_user where email = $1',
		[email]
	);
	const user = result.rows[0];
	if (user) {
		const isMatch = await bcrypt.compare(password, user.password);
		if (isMatch) {
			delete user.password;
			return user;
		} else {
			throw new Error();
		}
	} else {
		throw new Error();
	}
};

const generateAuthToken = async user => {
	const { userid, email } = user;
	const secret = process.env.secret;
	const token = await jwt.sign({ userid, email }, secret);
	return token;
};

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * Normalises untrusted pagination input from a query string.
 * Returns defaults rather than throwing so a malformed request cannot
 * turn a listing endpoint into a 500. Out-of-range values are clamped.
 */
const parsePagination = (rawPage, rawLimit) => {
	const page = Number.parseInt(rawPage, 10);
	const limit = Number.parseInt(rawLimit, 10);

	const safePage = Number.isInteger(page) && page > 0 ? page : 1;
	const safeLimit =
		Number.isInteger(limit) && limit > 0
			? Math.min(limit, MAX_PAGE_SIZE)
			: DEFAULT_PAGE_SIZE;

	return {
		page: safePage,
		limit: safeLimit,
	};
};

const buildPaginationMeta = (total, page, limit) => {
	const totalPages = Math.ceil(total / limit) || 1;
	return {
		total,
		current_page: page,
		per_page: limit,
		total_pages: totalPages,
		has_next_page: page < totalPages,
		has_previous_page: page > 1,
	};
};

/**
 * Fetches one page of transactions plus the total row count for the same
 * filter. `order by transaction_date desc, tr_id desc` keeps ordering
 * deterministic when several transactions share a date, so a row cannot be
 * silently skipped or repeated between pages.
 */
const getTransactionsPage = async (
	account_id,
	start_date,
	end_date,
	page,
	limit
) => {
	const offset = (page - 1) * limit;
	const filters = [account_id];
	let where = 'where account_id=$1';

	if (start_date && end_date) {
		where += " and to_char(transaction_date, 'YYYY-MM-DD') between $2 and $3";
		filters.push(start_date, end_date);
	}

	const columns =
		"to_char(transaction_date, 'YYYY-MM-DD') as formatted_date, withdraw_amount, deposit_amount, balance";

	const countResult = await pool.query(
		`select count(*)::int as total from transactions ${where}`,
		filters
	);
	const total = countResult.rows[0] ? countResult.rows[0].total : 0;

	// Placeholders continue after the filter parameters, so the same `where`
	// clause and parameter numbering can be shared by both queries.
	const limitPlaceholder = `$${filters.length + 1}`;
	const offsetPlaceholder = `$${filters.length + 2}`;
	const pageQuery = `select ${columns} from transactions ${where} order by transaction_date desc, tr_id desc limit ${limitPlaceholder} offset ${offsetPlaceholder}`;

	const result = await pool.query(pageQuery, [...filters, limit, offset]);

	return { rows: result.rows, total };
};

const getTransactions = async (account_id, start_date, end_date) => {
	let result;
	try {
		if (start_date && end_date) {
			result = await pool.query(
				"select to_char(transaction_date, 'YYYY-MM-DD') as formatted_date, withdraw_amount, deposit_amount, balance from transactions where account_id=$1 and to_char(transaction_date, 'YYYY-MM-DD') between $2 and $3 order by transaction_date desc",
				[account_id, start_date, end_date]
			);
		} else {
			result = await pool.query(
				"select to_char(transaction_date, 'YYYY-MM-DD') as formatted_date, withdraw_amount, deposit_amount,balance from transactions where account_id=$1 order by transaction_date desc",
				[account_id]
			);
		}
		return result;
	} catch (err) {
		throw new Error();
	}
};

const generatePDF = async filepath => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(`file:${path.join(filepath, 'transactions.html')}`, {
		waitUntil: 'networkidle2',
	});

	await page.setViewport({ width: 1680, height: 1050 });
	const pdfURL = path.join(filepath, 'transactions.pdf');
	await page.addStyleTag({
		content: `
	.report-table { border-collapse: collapse; width: 100%;}
	.report-table td, th { border: 1px solid #ddd; padding: 10px; }
	.report-table th { text-align: left;}`,
	});
	const pdf = await page.pdf({
		path: pdfURL,
		format: 'A4',
		printBackground: true,
		displayHeaderFooter: true,
		headerTemplate: `<div style="font-size:7px; white-space:nowrap;margin-left:38px;">${moment(
			new Date()
		).format('Do MMMM YYYY')}</div>`,
		footerTemplate: `<div style="font-size:7px;white-space:nowrap;margin-left:38px;margin-right:35px;width:100%;">
		<span style="display:inline-block;float:right;margin-right:10px;">
			<span class="pageNumber"</span> / <span class="totalPages"></span>
		</span>
	</div>`,
		margin: {
			top: '1.2cm',
			right: '1.2cm',
			bottom: '1.2cm',
			left: '1.2cm',
		},
	});
	await browser.close();

	return pdf.length;
};

module.exports = {
	isInvalidField,
	validateUser,
	generateAuthToken,
	getTransactions,
	getTransactionsPage,
	parsePagination,
	buildPaginationMeta,
	generatePDF,
};
