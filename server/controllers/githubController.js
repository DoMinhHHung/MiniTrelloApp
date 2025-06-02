const { db } = require("../configs/firebase");

exports.attachGithubResource = async (req, res) => {
  try {
    const { boardId, cardId, taskId } = req.params;
    const { type, number, sha, issueNumber } = req.body;

    const attachment = {
      type,
      createdAt: new Date(),
    };

    if (type === "pull_request" && number) {
      attachment.number = number;
    }
    if (type === "commit" && sha) {
      attachment.sha = sha;
    }
    if (type === "issue" && issueNumber) {
      attachment.number = issueNumber;
    }

    const ref = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(cardId)
      .collection("tasks")
      .doc(taskId)
      .collection("github_attachments")
      .add(attachment);

    res.status(201).json({
      taskId,
      attachmentId: ref.id,
      ...attachment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGithubAttachments = async (req, res) => {
  try {
    const { boardId, cardId, taskId } = req.params;
    const snapshot = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(cardId)
      .collection("tasks")
      .doc(taskId)
      .collection("github_attachments")
      .get();

    const attachments = snapshot.docs.map((doc) => ({
      attachmentId: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGithubAttachment = async (req, res) => {
  try {
    const { boardId, cardId, taskId, attachmentId } = req.params;
    await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(cardId)
      .collection("tasks")
      .doc(taskId)
      .collection("github_attachments")
      .doc(attachmentId)
      .delete();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
