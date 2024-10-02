const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const { SignUp } = require("../controllers/user-controllers");

router.post("/signup", [check("email").isEmail(), check("password").isLength({ max: 8 })], SignUp);

module.exports = router;