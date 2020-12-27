import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import express from "express";
import * as db_user from "./database/user.js";
import {JWT_SECRET} from "./secrets.js";

export const req_auth = async(req: express.Request, res: express.Response, next: CallableFunction): Promise<void> => {
	const user = await verify(req.headers.authorization, req.cookies.session);
	if(user == undefined) {
		res.sendStatus(403);
	} else {
		res.locals.user = user;
		next();
	}
};

const hash_password = async(password: string, salt: string): Promise<string> => new Promise((res, rej) => {
	crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err: Error | null, result: Buffer) => {
		if(err) {
			return rej(err);
		}
		res(result.toString("base64"));
	});
});

/**
 * Checks if the JWT token is valid, and returns credentials related to the user
 * @param {string | undefined} jwt_body
 * @param {string | undefined} jwt_cookie
 * @param {string | undefined} csrf_body
 * @param {string | undefined} csrf_cookie
 * @return {undefined | {id: number, username: string}} Object with username and id of the user, or undefined if the token is not valid
 */
const verify = async(jwt_body: string | undefined, jwt_cookie: string | undefined): Promise<{ id: number, username: string } | undefined> => {
	if(jwt_body == undefined || jwt_cookie != jwt_body) {
		return undefined;
	}
	return new Promise((res) => {
		jwt.verify(jwt_body, JWT_SECRET, {maxAge: "12d"}, (err, token) => {
			if(err) {
				if(err.message == "jwt malformed") {
					console.error("Error while trying to verify auth token", jwt_body, jwt_cookie, err);
				}
				return res(undefined);
			}
			if(token === undefined) {
				return res(undefined);
			}
			// @ts-ignore
			res({username: token.username, id: token.id});
		});
	});
};

/** Attempt to login, returns session token if successful, undefined if login unsuccessful
 * @param username
 * @param password
 */
export const login = async(username: string, password: string): Promise<string | undefined> => {
	const credentials = await db_user.login(username);
	if(credentials === undefined) {
		return undefined;
	}
	const given_password_hash = await hash_password(password, credentials.salt);
	if(given_password_hash === credentials.password) {
		// Return session token
		return new Promise((res, rej) => {
			jwt.sign({id: credentials.id, username}, JWT_SECRET, {algorithm: "HS512"}, (err, token) => {
				if(err) {
					return rej(err);
				}
				res(token);
			});
		});
	}
	return undefined;
};

/**
 * Attempt to register, returns undefined if successful, user-friendly error message if registration fails
 * @param username
 * @param password
 */
export const register = async(username: string, password: string): Promise<void | string> => {
	if(!await validate_username(username)) {
		return "Invalid username";
	}
	if(!await validate_password(password)) {
		return "Invalid password";
	}
	return new Promise((res, rej) => {
		crypto.randomBytes(16, async(err: Error | null, salt: Buffer) => {
			if(err) {
				return rej(err);
			}
			try {
				const password_hash = await hash_password(password, salt.toString("base64"));
				const result = await db_user.register(username, password_hash, salt.toString(("base64")));
				if(result) {
					res();
				} else {
					res("User with the given username already exists!");
				}
			} catch(e) {
				rej(e);
			}
		});
	});
};

// Returns true, if the username string is valid
export const validate_username = async(username: string): Promise<boolean> => {
	if(username.length < 3) {
		return false;
	}
	return true;
};

// Returns true, if the password string is valid
export const validate_password = async(password: string): Promise<boolean> => {
	if(password.length < 3) {
		return false;
	}
	return true;
};
