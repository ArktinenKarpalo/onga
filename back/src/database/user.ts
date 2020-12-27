import {pool} from "./database.js";

export const init = async(): Promise<void> => {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS "user" (
			id SERIAL PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			salt TEXT NOT NULL
		)
	`);
};

// Return password and salt or undefined if username is not found
export const login = async(username: string): Promise<undefined | { password: string, salt: string, id: number }> => {
	try {
		const result = await pool.query(`
			SELECT id, password, salt
			FROM "user"
			WHERE username = $1
		`, [username]);
		return result.rows[0];
	} catch(e) {
		console.error(`Error while fetching credentials ${username}`);
		throw new Error("Database error");
	}
};

// Return true if registration was successful, false if user with the same username already exists
export const register = async(username: string, password: string, salt: string): Promise<boolean> => {
	try {
		const result = await pool.query(`
			INSERT INTO "user"(username, password, salt)
			VALUES ($1, $2, $3)
			ON CONFLICT DO NOTHING;
		`, [username, password, salt]);
		return (result.rowCount === 1);
	} catch(e) {
		console.error(`Error while registering ${username} ${password} ${salt} ${e}`);
		throw new Error("Database error");
	}
};