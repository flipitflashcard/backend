const express = require("express");
const { check } = require("express-validator");

// import middlewares
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

const { CreateWord, ReviewWord, GetDueCards, GetCards, DeleteCard, GetCard, UpdateWord, GetAllOfCards } = require("../controllers/card-controllers");
// Create new card
router.post("/create", isAuthenticated, CreateWord);

// Review a card
router.post("/review/:cardId", isAuthenticated, ReviewWord);

// Get due cards for a box
router.get("/due/:boxId", isAuthenticated, GetDueCards);

// Get all cards for a box
router.get("/get-cards/:name", isAuthenticated, GetCards);

// delete a cards
router.delete("/delete-card/:id", isAuthenticated, DeleteCard);

// get one card
router.get("/get-card/:id", isAuthenticated, GetCard);

// Update existing card
router.patch("/update/:id", isAuthenticated, UpdateWord);

router.get("/get-all-cards", isAuthenticated, GetAllOfCards);

module.exports = router;