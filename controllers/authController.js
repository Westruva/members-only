const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const {
	userExistsByUsernameOrEmail,
	findUserByUsernameOrEmail,
	createUser,
} = require("../config/database");
const { addFlash } = require("../lib/flash");

// Helper to ensure session changes persist before redirecting.
const redirectWithSession = (req, res, path) => {
	req.session.save(() => res.redirect(path));
};

// Keep the user on the signup page when validation fails so they can fix it.
const renderSignupWithSession = (req, res) => {
	req.session.save(() => res.render("signup"));
};

async function signup(req, res) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstMessage = errors.array()[0].msg;
		addFlash(req, "error", firstMessage);
		return renderSignupWithSession(req, res);
	}

	const username = String(req.body.username || "").trim();
	const email = String(req.body.email || "")
		.trim()
		.toLowerCase();
	const password = String(req.body.password || "");

	try {
		const existingUser = await userExistsByUsernameOrEmail({ username, email });

		if (existingUser) {
			addFlash(req, "error", "That username or email is already taken.");
			return renderSignupWithSession(req, res);
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const user = await createUser({ username, email, passwordHash });

		req.session.user = { id: user.id, username: user.username };
		addFlash(
			req,
			"success",
			`Welcome, ${user.username}! Your account is ready.`,
		);
		return redirectWithSession(req, res, "/");
	} catch (error) {
		console.error("Signup failed:", error);
		addFlash(req, "error", "We could not create your account right now.");
		return renderSignupWithSession(req, res);
	}
}

async function login(req, res) {
	const usernameOrEmail = String(req.body.username || "")
		.trim()
		.toLowerCase();
	const password = String(req.body.password || "");

	if (!usernameOrEmail || !password) {
		addFlash(
			req,
			"error",
			"Please provide both your username/email and password.",
		);
		return redirectWithSession(req, res, "/");
	}

	try {
		const user = await findUserByUsernameOrEmail(usernameOrEmail);
		const authErrorMessage = "Invalid username/email or password.";

		if (!user) {
			addFlash(req, "error", authErrorMessage);
			return redirectWithSession(req, res, "/");
		}

		const isValidPassword = await bcrypt.compare(password, user.password_hash);

		if (!isValidPassword) {
			addFlash(req, "error", authErrorMessage);
			return redirectWithSession(req, res, "/");
		}

		req.session.user = { id: user.id, username: user.username };
		addFlash(req, "success", `Welcome back, ${user.username}!`);
		return redirectWithSession(req, res, "/");
	} catch (error) {
		console.error("Login failed:", error);
		addFlash(req, "error", "We could not log you in right now.");
		return redirectWithSession(req, res, "/");
	}
}

function logout(req, res) {
	req.session.destroy((error) => {
		if (error) {
			console.error("Session destroy failed:", error);
		}
		return res.redirect("/");
	});
}

module.exports = { signup, login, logout };
