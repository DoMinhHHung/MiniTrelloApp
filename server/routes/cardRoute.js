const express = require("express");
const router = express.Router({ mergeParams: true });
const cardController = require("../controllers/cardController");
const auth = require("../middlewares/auth");

router.get("/", auth, cardController.getCards);
router.post("/", auth, cardController.createCard);
router.get("/:id", auth, cardController.getCard);
router.get("/user/:user_id", auth, cardController.getCardsByUser);
router.put("/:id", auth, cardController.updateCard);
router.delete("/:id", auth, cardController.deleteCard);

module.exports = router;
