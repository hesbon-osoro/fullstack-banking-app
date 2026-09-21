// Environment variables that the server modules read at require-time.
// These are only used to keep jwt.sign/verify working in tests; no real
// network or database connection is ever opened by the test suite.
process.env.secret = process.env.secret || 'test-secret';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'test';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'test';
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
process.env.POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || 'test';
