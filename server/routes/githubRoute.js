const express = require("express");
const router = express.Router({ mergeParams: true });
const githubController = require("../controllers/githubController");
const auth = require("../middlewares/auth");

router.post("/", auth, githubController.attachGithubResource);
router.get("/", auth, githubController.getGithubAttachments);
router.delete("/:attachmentId", auth, githubController.deleteGithubAttachment);

module.exports = router;
