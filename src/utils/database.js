const { Pool } = require("pg");
const logger = require("./logger");

let pool;

/**
 * Initialize database connection pool
 * - Uses DATABASE_URL in production (Render)
 * - Uses individual DB_* vars in local development
 */
const initializePool = () => {
	if (pool) return pool;

	// ✅ PRODUCTION (Render)
	if (process.env.DATABASE_URL) {
		logger.verbose("Using DATABASE_URL for PostgreSQL connection");

		pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false, // REQUIRED for Render
			},
			max: 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 5000,
		});
	}
	// ✅ LOCAL DEVELOPMENT
	else {
		logger.verbose("Using local PostgreSQL connection");

		pool = new Pool({
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			max: 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 5000,
		});
	}

	pool.on("error", (err) => {
		logger.critical("Unexpected PostgreSQL error", err);
	});

	return pool;
};

/**
 * Test DB connection
 */
const connectDB = async () => {
	try {
		const dbPool = initializePool();
		const client = await dbPool.connect();
		logger.verbose("Connected to PostgreSQL database");
		client.release();
	} catch (error) {
		logger.critical("Failed to connect to database", error);
		throw error;
	}
};

/**
 * Run query
 */
const query = async (text, params = []) => {
	const dbPool = initializePool();
	const start = Date.now();

	try {
		const result = await dbPool.query(text, params);
		logger.verbose("Executed query", {
			text,
			duration: Date.now() - start,
			rows: result.rowCount,
		});
		return result;
	} catch (error) {
		logger.critical("Database query error", error);
		throw error;
	}
};

/**
 * Get client for transactions
 */
const getClient = async () => {
	const dbPool = initializePool();
	return await dbPool.connect();
};

module.exports = {
	connectDB,
	query,
	getClient,
};
