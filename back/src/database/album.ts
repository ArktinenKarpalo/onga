import {PoolClient} from "pg";
import {pool} from "./database.js";

export const init = async(): Promise<void> => new Promise((res) => {
	pool.connect(async(err: Error, client: PoolClient) => {
		if(err) {
			return console.error(err);
		}
		await client.query(`
			CREATE TABLE IF NOT EXISTS album (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				artist TEXT NOT NULL DEFAULT 'Unknown',
				genre TEXT,
				year TEXT,
				cover_file_id INTEGER REFERENCES file(id),
				user_id INTEGER REFERENCES "user"(id) NOT NULL,
				last_played BIGINT,
				UNIQUE (user_id, name, artist)
			)
		`);
		await client.release();
		res();
	});
});

export const delete_album = async(album_id: number): Promise<undefined | { cover_file_id: number }> => {
	try {
		const result = await pool.query("DELETE FROM album WHERE id=$1 RETURNING cover_file_id",
			[album_id]);
		return result.rows[0];
	} catch(e) {
		if(e.code == 23503) {
			return undefined;
		}
		console.error(`Error while attempting to delete album with id: ${album_id} ${e}`);
		throw new Error("Database error");
	}
};

export const album_user_id = async(album_id: number): Promise<undefined | number> => {
	try {
		const result = await pool.query("SELECT user_id FROM album WHERE id=$1", [album_id]);
		if(result.rows.length == 0)
			return undefined;
		else
			return result.rows[0].user_id;
	} catch(e) {
		console.error(`Error while attempting to get album user_id with id: ${album_id} ${e}`);
		throw new Error("Database error");
	}
};

export const insert_album = async(name: string, artist: string | undefined = "Unknown", genre: string | undefined, year: number | undefined, user_id: number): Promise<number | undefined> => {
	try {
		const result = (await pool.query("INSERT INTO Album(name, artist, genre, year, user_id, last_played) VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING RETURNING id", [name, artist, genre, year, user_id, new Date().getTime()]));
		if(result.rows.length == 0)
			return undefined;
		else
			return result.rows[0].id;
	} catch(e) {
		console.error(`Error while attempting to insert album ${name} ${artist} ${genre} ${year} ${user_id} ${e}`);
		throw new Error("Database error");
	}
};

export const get_album_id = async(user_id: number, name: string, artist: string | undefined = "Unknown"): Promise<undefined | number> => {
	try {
		const result = await pool.query("SELECT id FROM Album WHERE user_id=$1 AND name=$2 AND artist=$3", [user_id, name, artist]);
		if(result.rows.length == 0)
			return undefined;
		else
			return result.rows[0].id;
	} catch(e) {
		console.error(`Error while attempting to get album: ${user_id} ${name} ${artist} ${e}`);
		throw new Error("Database error");
	}
};

// Returns true if the cover_file_id was set, false if cover_file_id already existed on the Album
export const set_cover = async(album_id: number, cover_file_id: number): Promise<boolean> => {
	try {
		const result = await pool.query("UPDATE Album SET cover_file_id=$1 WHERE id=$2 AND cover_file_id IS NULL", [cover_file_id, album_id]);
		return result.rowCount == 1;
	} catch(e) {
		console.error(`Error while attempting to set album cover: ${album_id} ${cover_file_id} ${e}`);
		throw new Error("Database error");
	}
};

export const album_played = async(album_id: number): Promise<void> => {
	try {
		await pool.query(`
			UPDATE Album
			SET last_played=$1
			WHERE id = $2
		`, [new Date().getTime(), album_id]);
	} catch(e) {
		console.error(`Error while marking album played ${album_id} ${e}`);
		throw new Error("Database error");
	}
};

export const get_user_albums = async(user_id: number): Promise<{ id: number, name: string, artist: string, genre: string, year: string, cover_path: string, last_played: string | number }[]> => {
	try {
		const result = await pool.query(`
			SELECT Album.id, name, artist, genre, year, file.path AS cover_path, last_played
			FROM Album
					 LEFT JOIN file ON cover_file_id = file.id
			WHERE Album.user_id = $1`, [user_id]);
		return result.rows;
	} catch(e) {
		console.error(`Error while attempting to get album with user_id ${user_id} ${e}`);
		throw new Error("Database error");
	}
};
