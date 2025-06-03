const express = require("express");
const router = express.Router({ mergeParams: true });
const taskController = require("../controllers/taskController");
const auth = require("../middlewares/auth");
const githubRoutes = require("./githubRoute");

router.get("/", auth, taskController.getTasks);
router.post("/", auth, taskController.createTask);
router.get("/:taskId", auth, taskController.getTask);
router.put("/:taskId", auth, taskController.updateTask);
router.delete("/:taskId", auth, taskController.deleteTask);

router.post("/:taskId/assign", auth, taskController.assignMemberToTask);
router.get("/:taskId/assign", auth, taskController.getTaskAssignedMembers);
router.delete(
  "/:taskId/assign/:memberId",
  auth,
  taskController.removeMemberFromTask
);

router.use("/:taskId/github-attachments", githubRoutes);

module.exports = router;
