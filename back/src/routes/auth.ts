import express from "express";
import * as auth from "../auth.js";

export const router: express.Router = express.Router();

router.post("/login", async(req, res, next) => {
	try {
		if(typeof req.body.username !== "string" ||
			typeof req.body.password !== "string" ||
			typeof req.headers.csrf !== "string") {
			res.sendStatus(400);
			return;
		}
		const result = await auth.login(req.body.username, req.body.password);
		if(result === undefined) {
			res.send({status: "Logging in failed, wrong username or password!"}).send();
		} else {
			res.cookie("session", result, {maxAge: 1000 * 3600 * 24 * 14, sameSite: "strict"})
				.status(200).json({status: "OK"}).send();
		}
	} catch(e) {
		next(e);
	}
});

router.post("/register", async(req, res, next) => {
	try {
		if(typeof req.body.username !== "string" ||
			typeof req.body.password !== "string" ||
			typeof req.headers.csrf !== "string") {
			res.sendStatus(400);
			return;
		}
		const error = await auth.register(req.body.username, req.body.password);
		if(!error) {
			res.status(200).json({status: "OK"}).send();
		} else {
			res.status(200).json({status: error}).send();
		}
	} catch(e) {
		next(e);
	}
});

router.post("/logout", (req, res) => {
	if(req.headers.authorization == undefined) {
		res.sendStatus(400);
	} else {
		res.clearCookie("session").json({status: "OK"}).send();
	}
});
