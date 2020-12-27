import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as file_db from "./database/file.js";

export const FILE_DIR = "public/files/";

fs.mkdirSync(FILE_DIR, {recursive: true});

// Returns id of the generated file
export const save_file = async(filename: string, file: Buffer | Uint8Array, user_id: number): Promise<number> => {
	const extension: string = path.extname(filename);
	let filepath;
	let id;
	do {
		filepath = crypto.randomBytes(32).toString("hex") + extension;
	} while((id = await file_db.insert_file(filename, filepath, file.length, user_id)) == -1);
	await fs.promises.writeFile(`${FILE_DIR + filepath}_tmp`, file);
	await fs.promises.rename(`${FILE_DIR + filepath}_tmp`, FILE_DIR + filepath);
	return id;
};

export const delete_file = async(file_id: number): Promise<void> => {
	const path = await file_db.delete_file(file_id);
	if(path != undefined) {
		await fs.promises.unlink(FILE_DIR + path);
	}
};
