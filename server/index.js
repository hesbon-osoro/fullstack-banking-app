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

app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);
app.set('view engine', 'ejs');
app.use(authRoute);
app.use(accountRoute.Router);
app.use(profileRoute);
app.use(transactionsRoute);

app.get('/csrf-token', (req, res) => {
	res.send({ csrfToken: req.csrfToken() });
});

app.get('/', (_req, res) => res.json('Welcome to the Banking app API'));
app.use('*', (_req, res) => res.json('Page not found.'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
