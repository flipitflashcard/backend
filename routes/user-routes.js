const express = require("express");
const { check } = require("express-validator");

// import middlewares
const { isAuthenticated } = require("../middlewares/auth");
const { checkErrors } = require("../middlewares/check-errors");

const router = express.Router();

const { SignUp, LogIn, LogOut, RefreshToken } = require("../controllers/user-controllers");


router.post(
    "/signup",
    [
        check("email")
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail()
            .trim(),
        check("password")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    ],
    checkErrors,
    SignUp
);

router.post(
    "/login",
    [
        check("email")
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail()
            .trim(),
        check("password")
            .notEmpty().withMessage("Password is required")
    ],
    checkErrors,
    LogIn
);

// checking for authenticated
router.use(isAuthenticated);

router.post("/logout", LogOut);
router.post("/refresh-token", RefreshToken);

module.exports = router;