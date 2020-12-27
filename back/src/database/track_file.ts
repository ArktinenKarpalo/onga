import {PoolClient} from "pg";
import {pool} from "./database.js";

export const enum status {
	TO_ENCODE = 0,
	ENCODING_ON_PROGRESS = 1,
	DONE = 2,
	FAILED = 3,
	TO_DELETE = 4,
	TO_DELETE_AFTER = 5,
	DELETE_ON_PROGRESS = 6
}

export const init = async(): Promise<void> => new Promise((res, rej) => {
	pool.connect(async(err: Error, client: PoolClient) => {
		if(err) {
			return rej(err);
		}
		await client.query(`
			CREATE TABLE IF NOT EXISTS track_file (
				id SERIAL PRIMARY KEY,
				track_id INTEGER REFERENCES "track"(id),
				file_id INTEGER REFERENCES "file"(id),
				quality INTEGER, /* Original = 0, LOW = 1, HIGH = 2*/
				status INTEGER /* See status enum */
			)
		`);
		await client.release();
		res();
	});
});

export const delete_track_file = async(id: number): Promise<void> => {
	try {
		await pool.query("DELETE FROM track_file WHERE id=$1", [id]);
	} catch(e) {
		console.error(`Error while deleting track file ${id} ${e}`);
		throw new Error("Database error");
	}
};

export const mark_track_for_deletion = async(track_id: number): Promise<void> => {
	try {
		await pool.query(`
			UPDATE track_file
			SET status = CASE WHEN status = 1 THEN 5 ELSE 4 END
			WHERE track_id = $1;
		`, [track_id]);
	} catch(e) {
		console.error(`Error while marking track for deletion: ${track_id} ${e}`);
		throw new Error("Database error");
	}
};

export const mark_album_for_deletion = async(album_id: number): Promise<void> => {
	try {
		await pool.query(`
			UPDATE track_file
			SET status = CASE WHEN status = 1 THEN 5 ELSE 4 END
			FROM Track
			WHERE track_file.track_id = Track.id AND album_id = $1;
		`, [album_id]);
	} catch(e) {
		console.error(`Error while marking album for deletion: ${album_id} ${e}`);
		throw new Error("Database error");
	}
};

export const get_track_file_path = async(track_id: number, quality: number, user_id: number): Promise<undefined | string> => {
	try {
		const result = await pool.query("SELECT path FROM track_file JOIN file ON file_id=file.id WHERE track_file.track_id=$1 AND quality=$2 AND status=2 AND file.user_id=$3", [track_id, quality, user_id]);
		if(result.rows.length == 0) {
			return undefined;
		}
		return result.rows[0].path;
	} catch(e) {
		console.error(`Error while getting track filepath ${track_id} ${quality} ${user_id} ${e}`);
		throw new Error("Database error");
	}
};

export const insert_track_file = async(track_id: number, file_id: number, quality: number): Promise<void> => {
	try {
		await pool.query("INSERT INTO track_file (track_id, file_id, quality) VALUES($1, $2, $3)", [track_id, file_id, quality]);
	} catch(e) {
		console.error(`Error while inserting trackfile ${track_id} ${file_id} ${quality} ${e}`);
		throw new Error("Database error");
	}
};

export const insert_encoding_tasks = async(track_id: number): Promise<void> => {
	try {
		await pool.query("INSERT INTO track_file (track_id, quality, status) VALUES($1, $2, $3),($4, $5, $6)", [track_id, 1, 0, track_id, 2, 0]);
	} catch(err) {
		console.error("Failed to insert encoding tasks for track_id", track_id, err);
	}
};

// Returns the task or undefined if no tasks, marks the task as in progress
export const get_encoding_task = async(): Promise<undefined | {
	id: number, track_id: number,
	quality: 1 | 2, status: number, file_id: number
}> => {
	try {
		const result = await pool.query(`
			UPDATE track_file
			SET status=CASE WHEN status = 0 THEN 1 ELSE 6 END
			WHERE id = (SELECT id
						FROM track_file
						WHERE status = 0 OR status = 4
						ORDER BY status DESC
						LIMIT 1 FOR UPDATE)
			RETURNING id, track_id, quality, status, file_id;
		`);
		return result.rows[0];
	} catch(e) {
		console.error(`Error while getting encoding task ${e}`);
		throw new Error("Database error");
	}
};

export const get_file_path = async(track_id: number, quality: number): Promise<undefined | { user_id: number, path: string }> => {
	try {
		const result = await pool.query(`
			SELECT file.path, file.user_id
			FROM track_file
					 JOIN file ON track_file.file_id = file.id
			WHERE track_file.track_id = $1 AND quality = $2
		`, [track_id, quality]);
		return result.rows[0];
	} catch(e) {
		console.error(`Error while getting filepath for trackfile ${track_id} ${quality} ${e}`);
		throw new Error("Database error");
	}
};

export const complete_encoding_task = async(id: number, file_id: number | undefined, status: status): Promise<void> => {
	try {
		await pool.query(`
			UPDATE track_file
			SET file_id=$1
			WHERE id = $2;`, [file_id, id]);
		await pool.query(`
			UPDATE track_file
			SET status=CASE WHEN status = 1 THEN $2 ELSE 4 END, file_id=$1
			WHERE id = $3 AND (status = 1 OR status = 5)
		`, [file_id, status, id]);
	} catch(e) {
		console.error(`Error while completing encoding task ${id} ${file_id} ${e}`);
		throw new Error("Database error");
	}
};

export const reset_on_progress_encoding = async(): Promise<void> => {
	try {
		await pool.query(`UPDATE track_file
						  SET status=0
						  WHERE status = 1`);
	} catch(e) {
		console.error(`Error while resetting encoding progress ${e}`);
		throw new Error("Database error");
	}
};
