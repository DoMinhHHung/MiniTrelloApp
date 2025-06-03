const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");
const auth = require("../middlewares/auth");
const cardRoutes = require("./cardRoute");

router.post("/", auth, boardController.createBoard);
router.get("/", auth, boardController.getBoards);
router.get("/:id", auth, boardController.getBoard);
router.put("/:id", auth, boardController.updateBoard);
router.delete("/:id", auth, boardController.deleteBoard);
router.post("/:boardId/invite", auth, boardController.inviteMember);
router.post("/:boardId/invite/accept", auth, boardController.acceptInvite);
router.use("/:boardId/cards", cardRoutes);
router.get("/users", auth, boardController.getUsersByIds);

module.exports = router;
