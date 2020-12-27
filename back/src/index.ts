import * as db from "./database/database.js";
import {app} from "./app.js";

const PORT = 4664;
(async() => {
	const server = (await app).listen(PORT, () => {
		console.log("Listening on port", PORT);
	});

	const shutdown = () => {
		server.close();
		db.pool.end();
	};

	process.on("SIGTERM", shutdown);
})();
