import express from "express";
import {File, IncomingForm} from "formidable";
import * as fs from "fs";
import * as db_album from "../database/album.js";
import {album_played, album_user_id} from "../database/album.js";
import * as db_track from "../database/track.js";
import {increment_playcnt, track_user_id} from "../database/track.js";
import * as db_track_file from "../database/track_file.js";
import * as encoding from "../encoding.js";
import {req_auth} from "../auth.js";
import {process_upload} from "../music";

export const router: express.Router = express.Router();

router.get("/track_file/:quality/:track_id", req_auth, async(req, res, next) => {
	try {
		if(!Number.isInteger(Number.parseInt(req.params.track_id)) ||
			!Number.isInteger(Number.parseInt(req.params.quality))) {
			res.sendStatus(400);
			return;
		}
		const track_id = Number.parseInt(req.params.track_id);
		const quality = Number.parseInt(req.params.quality);
		const user_id = res.locals.user.id;
		let path = await db_track_file.get_track_file_path(track_id, quality, user_id);
		if(path == undefined) {
			const task = await db_track_file.mark_encoding_task(track_id, quality, user_id);
			if(task != undefined) {
				await encoding.encode(task);
			}
			path = await db_track_file.get_track_file_path(track_id, quality, user_id);
			if(path == undefined)
				res.sendStatus(404);
			else
				res.send({path});
		} else {
			res.send({path});
		}
	} catch(e) {
		next(e);
	}
});

router.post("/track/:id/played", req_auth, async(req, res, next) => {
	try {
		const track_id = Number.parseInt(req.params.id);
		if(!Number.isInteger(track_id)) {
			res.sendStatus(400);
			return;
		}
		const user_id = await track_user_id(track_id);
		if(res.locals.user.id != user_id) {
			res.sendStatus(403);
			return;
		}
		await increment_playcnt(track_id);
		res.send({status: "OK"});
	} catch(e) {
		next(e);
	}
});

router.post("/album/:id/played", req_auth, async(req, res, next) => {
	try {
		const album_id = Number.parseInt(req.params.id);
		if(!Number.isInteger(album_id)) {
			res.sendStatus(400);
			return;
		}
		const user_id = await album_user_id(album_id);
		if(res.locals.user.id != user_id) {
			res.sendStatus(403);
			return;
		}
		await album_played(album_id);
		res.send({status: "OK"});
	} catch(e) {
		next(e);
	}
});

router.get("/albums", req_auth, async(req, res, next) => {
	try {
		const albums = await db_album.get_user_albums(res.locals.user.id);
		for(const album of albums) {
			if(typeof album.last_played === "string") {
				album.last_played = Number.parseInt(album.last_played);
			}
		}
		res.send(albums);
	} catch(e) {
		next(e);
	}
});

router.get("/tracks", req_auth, async(req, res, next) => {
	try {
		res.send(await db_track.get_user_tracks(res.locals.user.id));
	} catch(e) {
		next(e);
	}
});

router.delete("/track/:track_id", req_auth, async(req, res, next) => {
	if(!Number.isInteger(Number.parseInt(req.params.track_id))) {
		res.sendStatus(400);
		return;
	}
	const track_id = Number.parseInt(req.params.track_id);
	try {
		const user_id = await track_user_id(track_id);
		if(user_id == res.locals.user.id) {
			await db_track_file.mark_track_for_deletion(track_id);
			encoding.check_queue();
			res.send({});
		} else {
			res.sendStatus(403);
		}
	} catch(e) {
		next(e);
	}
});

router.delete("/album/:album_id", req_auth, async(req, res, next) => {
	try {
		if(!Number.isInteger(Number.parseInt(req.params.album_id))) {
			res.sendStatus(400);
			return;
		}
		const album_id = Number.parseInt(req.params.album_id);
		const user_id = await db_album.album_user_id(album_id);
		await db_track.delete_track_by_album(album_id);
		await db_album.delete_album(album_id);
		if(user_id == res.locals.user.id) {
			await db_track_file.mark_album_for_deletion(album_id);
			encoding.check_queue();
			res.send({});
		} else {
			res.sendStatus(403);
		}
	} catch(e) {
		next(e);
	}
});

router.post("/upload2", req_auth, async(req, res, next) => {
	new IncomingForm().parse(req, async(err, fields, files) => {
		if(err) {
			next(err);
			return;
		}
		const track_file: File = files.file;
		const cover_file: File = files.cover;
		try {
			await process_upload(track_file, cover_file, JSON.parse(<string>fields.album), JSON.parse(<string>fields.track), res.locals.user.id);
			encoding.check_queue();
			res.sendStatus(200);
		} catch(e) {
			next(e);
			return;
		} finally {
			if(cover_file != undefined) {
				fs.promises.unlink(cover_file.path).catch((e) => console.error(e));
			}
			if(track_file != undefined) {
				fs.promises.unlink(track_file.path).catch((e) => console.error(e));
			}
		}
	});
});
