const express = require("express");
const AuthController = require("../controller/authcontroller");

const router = express.Router();

// Auth routes using the controller methods
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

module.exports = router;
