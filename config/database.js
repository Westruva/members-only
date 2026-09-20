const { Pool } = require("pg");

const pool = new Pool({
	connectionString:
		process.env.DATABASE_URL ||
		"postgresql://wayne:1234@localhost:5432/members_only",
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: false,
});

async function initializeDatabase() {
	await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
	await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

	await pool.query(`
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			username VARCHAR(50) UNIQUE NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS messages (
			id BIGSERIAL PRIMARY KEY,
			author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			content TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await pool.query(`
		CREATE INDEX IF NOT EXISTS idx_messages_global_feed
		ON messages(created_at DESC);
	`);

	await pool.query(`
		CREATE INDEX IF NOT EXISTS idx_messages_author
		ON messages(author_id, created_at DESC);
	`);
}

async function getMessages() {
	const result = await pool.query(`
		SELECT
			m.id,
			m.content,
			m.created_at,
			u.username
		FROM messages AS m
		INNER JOIN users AS u ON u.id = m.author_id
		ORDER BY m.created_at DESC
		LIMIT 50;
	`);

	return result.rows;
}

async function userExistsByUsernameOrEmail({ username, email }) {
	const result = await pool.query(
		"SELECT id FROM users WHERE username = $1 OR email = $2;",
		[username, email],
	);

	return result.rows[0];
}

async function findUserByUsernameOrEmail(usernameOrEmail) {
	const result = await pool.query(
		`
			SELECT id, username, password_hash
			FROM users
			WHERE username = $1 OR email = $1;
		`,
		[usernameOrEmail],
	);

	return result.rows[0];
}

async function createUser({ username, email, passwordHash }) {
	const result = await pool.query(
		`
			INSERT INTO users (username, email, password_hash)
			VALUES ($1, $2, $3)
			RETURNING id, username, email;
		`,
		[username, email, passwordHash],
	);

	return result.rows[0];
}

async function createMessage({ authorId, content }) {
	await pool.query(
		`
			INSERT INTO messages (author_id, content)
			VALUES ($1, $2);
		`,
		[authorId, content],
	);
}

module.exports = {
	pool,
	initializeDatabase,
	getMessages,
	userExistsByUsernameOrEmail,
	findUserByUsernameOrEmail,
	createUser,
	createMessage,
};
