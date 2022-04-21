const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const authRoute = require('./routes/auth');
const profileRoute = require('./routes/profile');
const accountRoute = require('./routes/account');
const transactionsRoute = require('./routes/transactions');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const csrfProtection = csrf({ cookie: true });

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);
app.set('view engine', 'ejs');

// Routes
app.use(authRoute);
app.use(accountRoute.Router);
app.use(profileRoute);
app.use(transactionsRoute);

app.get('/csrf-token', (req, res) => {
	res.json({ csrfToken: req.csrfToken() });
});
// Home Route
app.get('/', (_, res) => res.json('Welcome to the Banking app APIs'));

// 404
app.use('*', (_, res) => res.status(404).json('Page not found!'));

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
