const { getMessages, createMessage } = require("../config/database");
const { addFlash } = require("../lib/flash");

async function index(req, res) {
	try {
		const messages = await getMessages();
		return res.render("home", { messages });
	} catch (error) {
		console.error("Could not load the message feed:", error);
		return res.status(500).render("home", {
			messages: [],
			errorMessage: "Unable to load the feed right now.",
		});
	}
}

function renderLoginPage(req, res) {
	return res.render("login");
}

function renderSignupPage(req, res) {
	return res.render("signup");
}

async function create(req, res) {
	if (!req.session.user) {
		addFlash(req, "error", "You must be logged in to post messages.");
		return res.redirect("/");
	}

	const content = String(req.body.content || "").trim();

	if (!content) {
		addFlash(req, "error", "Message content cannot be empty.");
		return res.redirect("/");
	}

	try {
		await createMessage({ authorId: req.session.user.id, content });
		addFlash(req, "success", "Your message was posted to the community feed.");
		return res.redirect("/");
	} catch (error) {
		console.error("Creating message failed:", error);
		addFlash(req, "error", "Your message could not be saved.");
		return res.redirect("/");
	}
}

module.exports = { index, create, renderLoginPage, renderSignupPage };
