const express = require("express");
const { body } = require("express-validator");
const { signup, login, logout } = require("../controllers/authController");
const {
	index,
	create,
	renderLoginPage,
	renderSignupPage,
} = require("../controllers/messageController");

const router = express.Router();

const signupValidation = [
	body("username").trim().notEmpty().withMessage("Username is required."),
	body("email").trim().isEmail().withMessage("A valid email is required."),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long."),
	body("confirmPassword").custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error("Passwords do not match.");
		}

		return true;
	}),
];

router.get("/", index);
router.get("/login", renderLoginPage);
router.get("/signup", renderSignupPage);
router.post("/signup", signupValidation, signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/messages", create);

module.exports = router;
