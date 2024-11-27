const express = require("express");
const { check } = require("express-validator");

// import middlewares
const { isAuthenticated } = require("../middlewares/auth");
const { checkErrors } = require("../middlewares/check-errors");

const router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { SignUp, LogIn, LogOut, RefreshToken, GetUserProfile, UpdateUserProfile, UpdateProfilePicture } = require("../controllers/user-controllers");

// Public routes
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

router.post("/refresh-token", RefreshToken);

// Protected routes
router.post("/logout", isAuthenticated, LogOut);

// Get user profile
router.get("/profile", isAuthenticated, GetUserProfile);

// Update user profile
router.patch("/update-profile", isAuthenticated, UpdateUserProfile);

router.post('/update-profile-picture',
    isAuthenticated,
    upload.single('profile_picture'),
    UpdateProfilePicture
);
module.exports = router;