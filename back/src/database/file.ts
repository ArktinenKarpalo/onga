import {PoolClient} from "pg";
import {pool} from "./database.js";

export const init = async(): Promise<void> => new Promise((res, rej) => {
	pool.connect(async(err: Error, client: PoolClient) => {
		if(err) {
			return rej(err);
		}
		await client.query(`
            CREATE TABLE IF NOT EXISTS file (
                id
                SERIAL
                PRIMARY
                KEY,
                original_filename
                TEXT,
                PATH
                TEXT
                UNIQUE,
                user_id
                INTEGER
                REFERENCES
                "user"(
                id
            ), SIZE INTEGER )
		`);
		await client.release();
		res();
	});
});

// Returns id of the inserted file, -1 if insertion failed
export const insert_file = async(original_filename: string, path: string, size: number, user_id: number): Promise<number> => {
	try {
		const result = await pool.query(`
                    INSERT INTO File(original_filename, path, size, user_id)
                    VALUES ($1, $2, $3, $4) RETURNING id`,
		[original_filename, path, size, user_id]);
		return result.rows[0].id;
	} catch(e) {
		if(e.code == 23505) {
			return -1;
		}
		console.error(`Error while inserting file ${original_filename} ${path} ${size} ${user_id} ${e}`);
		throw new Error("Database error");
	}
};

// Returns filepath
export const delete_file = async(file_id: number): Promise<undefined | string> => {
	try {
		const result = await pool.query(`
            DELETE
            FROM file
            WHERE id = $1 RETURNING PATH`, [file_id]);
		if(result.rows.length == 0)
			return undefined;
		else
			return result.rows[0].path;
	} catch(e) {
		console.error(`Error while deleting file ${file_id} ${e}`);
		throw new Error("Database error");
	}
};
