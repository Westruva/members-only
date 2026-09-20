const express = require("express");
const session = require("express-session");
const path = require("path");

const { initializeDatabase } = require("./config/database");
const viewLocals = require("./middleware/viewLocals");
const routes = require("./routes");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
	session({
		secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 60 * 4,
		},
		proxy: true,
	}),
);

app.use(viewLocals);
app.use(routes);

async function startServer() {
	try {
		await initializeDatabase();
		app.listen(port, () => {
			console.log(`Members-only app listening on http://localhost:${port}`);
		});
	} catch (error) {
		console.error(
			"Database initialization failed. Check your PostgreSQL connection.",
			error,
		);
		process.exit(1);
	}
}

startServer();
