import {Pool} from "pg";
import * as db_file from "./file.js";
import * as db_user from "./user.js";
import * as db_track from "./track.js";
import * as db_track_file from "./track_file.js";
import * as db_album from "./album.js";

export const pool = new Pool({
	host: process.env.POSTGRES_DB_URL,
	user: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB
});

pool.on("error", err => {
	console.error("Database pool error:", err);
	process.exit(-1);
});

export const reset_database = async(): Promise<void> => {
	await pool.query("DROP SCHEMA public cascade");
	await pool.query("CREATE SCHEMA public");
	await init();
};

export const init = async(): Promise<void> => {
	await db_user.init();
	await db_file.init();
	await db_album.init();
	await db_track.init();
	await db_track_file.init();
};
