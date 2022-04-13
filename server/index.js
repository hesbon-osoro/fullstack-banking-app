const express = require('express');
const authRoute = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(authRoute);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
