const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	host: process.env.POSTGRES_HOST,
	port: process.env.POSTGRES_PORT,
	database: process.env.POSTGRES_DATABASE,
});

const getClient = async () => {
	try {
		return await pool.connect();
	} catch (e) {
		return null;
	}
};
module.exports = { pool, getClient };
