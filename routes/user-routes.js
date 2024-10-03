const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const { SignUp, LogIn } = require("../controllers/user-controllers");

router.post("/signup", [check("email").isEmail(), check("password").isLength({ min: 8 })], SignUp);
router.post("/login", [check("email").isEmail(), check("password").isLength({ min: 8 })], LogIn);

module.exports = router;