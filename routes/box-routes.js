const express = require("express");
const { check } = require("express-validator");

// import middlewares
const { isAuthenticated } = require("../middlewares/auth");
const { checkErrors } = require("../middlewares/check-errors");

const router = express.Router();

const { CreateBox, GetBoxes, GetBox, UpdateBox, DeleteBox } = require("../controllers/box-controllers");

router.post("/create", isAuthenticated, check("name").notEmpty(), CreateBox);
router.get("/get-all", isAuthenticated, GetBoxes);
router.get("/get-box/:id", isAuthenticated, GetBox);
router.patch("/update-box/:id", isAuthenticated, UpdateBox);
router.delete("/delete-box/:id", isAuthenticated, DeleteBox);

module.exports = router;