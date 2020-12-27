import {PoolClient, QueryResult} from "pg";
import {pool} from "./database.js";
import {Track} from "../types/track";

export const init = async(): Promise<void> => new Promise((res, rej) => {
	pool.connect(async(err: Error, client: PoolClient) => {
		if(err) {
			return rej(err);
		}
		await client.query(`
			CREATE TABLE IF NOT EXISTS track (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				artist TEXT NOT NULL DEFAULT 'Unknown',
				composer TEXT,
				genre TEXT,
				year TEXT,
				duration INTEGER NOT NULL DEFAULT 0,
				track_num INTEGER NOT NULL DEFAULT 0,
				disc_num INTEGER NOT NULL DEFAULT 1,
				track_total INTEGER,
				disc_total INTEGER,
				album_id INTEGER REFERENCES album(id),
				user_id INTEGER REFERENCES "user"(id),
				play_cnt INTEGER DEFAULT 0,
				UNIQUE (name, artist, duration, track_num, disc_num, album_id)
			)
		`);
		await client.release();
		res();
	});
});

export const delete_track_by_album = async(album_id: number): Promise<undefined | { album_id: number }> => {
	try {
		const result = await pool.query(`
			DELETE
			FROM Track
			WHERE album_id = $1
			RETURNING album_id
		`, [album_id]);
		return result.rows[0];
	} catch(e) {
		if(e.code == 23503) {
			return undefined;
		}
		console.error(`Error while deleting track ${album_id} ${e}`);
		throw new Error("Database error");
	}
};

export const delete_track = async(track_id: number): Promise<undefined | { album_id: number }> => {
	try {
		const result = await pool.query(`
			DELETE
			FROM Track
			WHERE id = $1
			RETURNING album_id
		`, [track_id]);
		return result.rows[0];
	} catch(e) {
		if(e.code == 23503) {
			return undefined;
		}
		console.error(`Error while deleting track ${track_id} ${e}`);
		throw new Error("Database error");
	}
};

export const track_user_id = async(track_id: number): Promise<undefined | number> => {
	try {
		const result = await pool.query("SELECT user_id FROM track WHERE id=$1", [track_id]);
		if(result.rowCount == 0) {
			return undefined;
		}
		return result.rows[0].user_id;
	} catch(e) {
		console.error(`Error while attempting to get track user_id: ${track_id} ${e}`);
		throw new Error("Database error");
	}
};

// returns id of the Track inserted, undefined if Track already exists
export const insert_track = async(track: Track, album_id: number, user_id: number): Promise<number | undefined> => {
	try {
		const result = await pool.query(`
					INSERT INTO Track(name, artist, composer, genre, year, duration, track_num,
									  disc_num, track_total, disc_total, album_id, user_id)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
					ON CONFLICT DO NOTHING
					RETURNING id`,
		[track.name, track.artist || "Unknown", (track.composer || []).join(","),
			(track.genre || []).join(","), track.year, Math.round(track.duration || 0),
			track.track_num || 0, track.disc_num || 1, track.track_total, track.disc_total,
			album_id, user_id]);
		if(result.rows.length == 0)
			return undefined;
		else
			return result.rows[0].id;
	} catch(e) {
		console.error(`Error while inserting track ${track} ${album_id} ${user_id} ${e}`);
		throw new Error("Database error");
	}
};

export const increment_playcnt = async(track_id: number): Promise<void> => {
	try {
		await pool.query(`
			UPDATE Track
			SET play_cnt=play_cnt + 1
			WHERE id = $1
		`, [track_id]);
	} catch(e) {
		console.error(`Error while incrementing track playcnt ${track_id} ${e}`);
		throw new Error("Database error");
	}
};

export const get_user_tracks = async(user_id: number): Promise<Array<{
	id: number,
	name: string, artist: string, composer?: string, genre?: string, year?: string,
	duration: number, track_num: number, dic_num: number, album_id: number,
	qualities: [{ quality: number, status: number }]
}>> => {
	try {
		const results: QueryResult = await pool.query(`
					SELECT Track.id, name, artist, composer, genre, year, duration, track_num, disc_num, album_id, quality,
						status, play_cnt
					FROM Track
							 JOIN track_file ON track.id = track_file.track_id
					WHERE user_id = $1 AND quality > 0
					ORDER BY Track.id;`,
		[user_id]);
		const ret = [];
		for(let i = 0; i < results.rows.length; i++) {
			const row = results.rows[i];
			if(i > 0 && results.rows[i - 1].id == row.id) {
				ret[ret.length - 1].qualities.push({quality: row.quality, status: row.status});
			} else {
				row.qualities = [{quality: row.quality, status: row.status}];
				delete row.quality;
				delete row.status;
				ret.push(row);
			}
		}
		return ret;
	} catch(e) {
		console.error(`Error while attempting to get user tracks: ${user_id} ${e}`);
		throw new Error("Database error");
	}
};
