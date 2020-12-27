import * as chai from "chai";
import {app} from "../../src/app.js";
import {Server} from "http";
import * as db from "../../src/database/database";
import supertest from "supertest";

const assert = chai.assert;

suite("Auth route", () => {
	let server: Server;
	suiteSetup(async function() {
		// this.timeout(5000);
		// server = (await app).listen(3000);
	});
	suiteTeardown(() => {
		// server.close();
	});
	teardown(async function() {
		await db.reset_database();
	});
	test("Login attempt without credentials", async() => {
		await supertest(await app).post("/auth/login")
			.set("csrf", "")
			.expect(400);
	});
	test("Login attempt without csrf", async() => {
		await supertest(await app).post("/auth/login")
			.send({username: "test", password: "test"})
			.expect(400);
	});
	test("Login attempt with invalid credentials", async() => {
		const res = await supertest(await app).post("/auth/login")
			.set("csrf", "")
			.send({username: "test", password: "test"})
			.expect(200);
		assert.equal(res.body.status,  "Logging in failed, wrong username or password!");
	});
	test("Register attempt without credentials", async() => {
		await supertest(await app).post("/auth/login")
			.set("csrf", "")
			.expect(400);
	});
	test("Register attempt without csrf", async() => {
		await supertest(await app).post("/auth/register")
			.send({username: "test", password: "test"})
			.expect(400);
	});
	test("Register attempt once with valid credentials", async() => {
		const res = await supertest(await app).post("/auth/register")
			.set("csrf", "")
			.send({username: "test", password: "test"})
			.expect(200);
		assert.equal(res.body.status, "OK");
	});
	test("Register attempt twice with same credentials", async() => {
		const res = await supertest(await app).post("/auth/register")
			.set("csrf", "")
			.send({username: "test", password: "test"})
			.expect(200);
		assert.equal(res.body.status, "OK");
		const res2 = await supertest(await app).post("/auth/register")
			.set("csrf", "")
			.send({username: "test", password: "test"})
			.expect(200);
		assert.notEqual(res2.body.status, "OK");
	});
	test("Login attempt after registration", async() => {
		const res: supertest.Response = await supertest(await app).post("/auth/register")
			.set("csrf", "")
			.send({username: "test", password: "test"})
			.expect(200);
		assert.equal(res.body.status, "OK");
		const res2: supertest.Response = await supertest(await app).post("/auth/login")
			.set("csrf", "")
			.send({username: "test", password: "test"})
			.expect(200);
		assert.include(res2.headers["set-cookie"][0], "session=");
		assert.isAtLeast(res2.headers["set-cookie"][0].length, 100);
	});
});
