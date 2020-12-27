import express, {Application} from "express";
import cookieParser from "cookie-parser";
import * as db from "./database/database.js";
import * as auth_routes from "./routes/auth.js";
import * as music_routes from "./routes/music.js";
import {check_queue} from "./encoding";

const start = async() => {
	await db.init();
	const app2 = express();
	app2.use(express.json());
	app2.use(cookieParser());
	app2.use("/auth", auth_routes.router);
	app2.use("/music", music_routes.router);
	app2.use(express.static("./public"));
	check_queue();

	return app2;
};

export const app: Promise<Application> = start();
