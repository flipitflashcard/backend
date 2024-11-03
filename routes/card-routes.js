const express = require("express");
const { check } = require("express-validator");

// import middlewares
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

const { CreateWord } = require("../controllers/card-controllers");

router.post("/create", isAuthenticated, CreateWord);

module.exports = router;