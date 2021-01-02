import exec from "child_process";
import * as tmp from "tmp";
import * as fs from "fs";
import * as db_track_file from "./database/track_file.js";
import * as file from "./file.js";
import {delete_track} from "./database/track";
import {delete_album} from "./database/album";
import {Task} from "./types/task";

const bitrates: Map<number, string> = new Map<number, string>([[1, "64k"], [2, "256k"]]);

const WORKERS = 4;
let workers_running = 0;

let startup: undefined | Promise<void>;

// Checks if there are encoding tasks and starts task if not already running a task
export const check_queue = async(): Promise<void> => {
	if(startup == undefined) {
		startup = db_track_file.reset_on_progress_encoding();
	}
	await startup;
	while(workers_running < WORKERS) {
		workers_running++;
		start_worker()
			.catch((e) => console.error(`Encoding worker failed with ${e}`))
			.finally(() => workers_running--);
	}
};

const start_worker = async() => {
	let task;
	while((task = await db_track_file.get_encoding_task()) != undefined) {
		await encode(task);
	}
};

const encoding_tasks = new Map<number, Promise<void>>();

export const encode = async(task: Task): Promise<void> => {
	if(!encoding_tasks.has(task.id)) {
		let task_promise;
		encoding_tasks.set(task.id, task_promise=encode_task(task)
			.finally(() => encoding_tasks.delete(task.id)));
		return task_promise;
	} else {
		return encoding_tasks.get(task.id);
	}
};

const encode_task = async(task: Task): Promise<void> => {
	if(task.status == db_track_file.status.ENCODING_ON_PROGRESS) {
		const original_file = await db_track_file.get_file_path(task.track_id, 0);
		if(original_file == undefined) {
			await db_track_file.complete_encoding_task(task.id, undefined, db_track_file.status.FAILED);
			throw new Error(`Original path not found for task ${task}`);
		}
		await new Promise<void>((res, rej) => {
			tmp.dir(async(err: Error | null, path: string) => {
				if(err) {
					rej(err);
					return;
				}
				const out_path = `${path}/out.opus`;
				const ffmpeg = exec.spawn("nice", ["-n", "19", "ffmpeg", "-i",
					`${file.FILE_DIR}/${original_file.path}`, "-c:a", "libopus", "-b:a",
					bitrates.get(task.quality)!, "-map_metadata", "0", "-progress", "-", "-nostats",
					out_path], {cwd: process.cwd()});
				ffmpeg.on("error", (err) => {
					rej(err);
				});
				ffmpeg.on("close", async(code) => {
					if(code == 0) {
						const audio_buf = await fs.promises.readFile(out_path);
						const file_id = await file.save_file("out.opus", audio_buf, original_file.user_id);
						await db_track_file.complete_encoding_task(task.id, file_id, db_track_file.status.DONE);
						res();
					} else {
						await db_track_file.complete_encoding_task(task.id, undefined, db_track_file.status.FAILED);
						rej(`Ffmpeg exited with code ${code}`);
					}
				});
			});
		});
	} else if(task.status == db_track_file.status.DELETE_ON_PROGRESS) {
		await db_track_file.delete_track_file(task.id);
		if(task.file_id != undefined) {
			await file.delete_file(task.file_id);
		}
		const track = await delete_track(task.track_id);
		if(track == undefined) { // Unsuccessful deletion
			return;
		}
		const album = await delete_album(track.album_id);
		if(album == undefined) {
			return;
		}
		await file.delete_file(album.cover_file_id);
	}
};
