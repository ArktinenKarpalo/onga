import {File} from "formidable";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import * as db_album from "./database/album";
import * as file from "./file";
import * as db_track from "./database/track";
import * as db_track_file from "./database/track_file";
import {Track} from "./types/track";
import {Album} from "./types/album";

export const process_upload = async(track_file: File, cover_file: File, album: Album, track: Track, user_id: number): Promise<void> => {
	if(album.name == undefined || track == undefined) {
		return;
	}
	let album_id = await db_album.insert_album(album.name, album.artist,
		(album.genre || []).join(","), album.year, user_id);
	if(album_id == undefined) {
		album_id = await db_album.get_album_id(user_id, album.name, album.artist);
		if(album_id == undefined) {
			return;
		}
	}

	if(cover_file != undefined) {
		const cover = await sharp(cover_file.path)
			.resize(500, 500, {fit: "contain"})
			.png()
			.toBuffer();
		const cover_file_id = await file.save_file(cover_file.name + ".png", cover, user_id);
		if(!await db_album.set_cover(album_id, cover_file_id)) {
			await file.delete_file(cover_file_id);
		}
	}

	if(track.name == undefined || track.name.length == 0) {
		track.name = path.basename(track_file.name);
		if(track.name == undefined || track.name.length == 0) {
			return;
		}
	}
	const track_id = await db_track.insert_track(track, album_id, user_id);
	if(track_id == undefined) {
		return;
	}
	const track_file_id = await file.save_file(track_file.name, (await fs.promises.readFile(track_file.path)), user_id);
	try {
		await db_track_file.insert_track_file(track_id, track_file_id, 0);
	} catch(err) {
		console.error(err);
		await file.delete_file(track_file_id);
		return;
	}
	await db_track_file.insert_encoding_tasks(track_id);
};
