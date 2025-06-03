const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/signin", authController.verifyCode);
router.post("/send-code", authController.sendCode);

router.get("/github", authController.githubAuth);
router.get("/github/callback", authController.githubCallback);

module.exports = router;
