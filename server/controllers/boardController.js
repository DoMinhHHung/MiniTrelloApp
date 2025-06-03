const { db } = require("../configs/firebase");
const { sendBoardInvitationEmail } = require("../configs/email");
const admin = require("firebase-admin");

exports.createBoard = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userData.id;
    const newBoard = {
      name,
      description,
      owner: userId,
      members: [userId],
      createdAt: new Date(),
    };
    const docRef = await db.collection("boards").add(newBoard);
    const io = req.app.get("io");
    io.emit("boardCreated", { id: docRef.id, ...newBoard });
    res.status(201).json({ id: docRef.id, ...newBoard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const userId = req.userData.id;
    const snapshot = await db
      .collection("boards")
      .where("members", "array-contains", userId)
      .get();
    const boards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("boards").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Board not found" });
    const boardData = doc.data();
    const invitesSnap = await db
      .collection("boards")
      .doc(id)
      .collection("invites")
      .get();
    const pendingInvites = [];
    invitesSnap.forEach((inviteDoc) => {
      const invite = inviteDoc.data();
      if (invite.status === "pending") {
        pendingInvites.push(invite.email_member);
      }
    });

    res.status(200).json({ id: doc.id, ...boardData, pendingInvites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await db.collection("boards").doc(id).update({ name, description });
    const doc = await db.collection("boards").doc(id).get();
    const io = req.app.get("io");
    io.to(id).emit("boardUpdated", { id: doc.id, ...doc.data() });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("boards").doc(id).delete();
    const io = req.app.get("io");
    io.emit("boardDeleted", { id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email_member } = req.body;

    const userSnap = await db
      .collection("users")
      .where("email", "==", email_member)
      .get();
    if (userSnap.empty) {
      return res
        .status(404)
        .json({ error: "Email is not registered account." });
    }
    let member_id = userSnap.docs[0].id;

    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const boardData = boardDoc.data();

    const invite = {
      boardId,
      member_id,
      email_member,
      status: "pending",
      createdAt: new Date(),
    };
    await db
      .collection("boards")
      .doc(boardId)
      .collection("invites")
      .add(invite);

    await sendBoardInvitationEmail(
      email_member,
      boardId,
      boardData.name,
      "Board Owner"
    );

    const io = req.app.get("io");
    io.to(boardId).emit("memberInvited", { boardId, email_member, member_id });
    res.status(200).json({ success: true, member_id, invited: true });
  } catch (error) {
    console.error("Error in inviteMember:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email_member } = req.body;

    const userSnap = await db
      .collection("users")
      .where("email", "==", email_member)
      .get();
    if (userSnap.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userSnap.docs[0].id;

    const boardRef = db.collection("boards").doc(boardId);
    await boardRef.update({
      members: admin.firestore.FieldValue.arrayUnion(userId),
    });

    const invitesSnap = await boardRef
      .collection("invites")
      .where("email_member", "==", email_member)
      .get();
    invitesSnap.forEach((doc) => doc.ref.update({ status: "accepted" }));

    const io = req.app.get("io");
    io.to(boardId).emit("memberJoined", { boardId, userId });
    res.json({ success: true, joined: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersByIds = async (req, res) => {
  try {
    const ids = (req.query.ids || "").split(",").filter(Boolean);
    if (!ids.length) return res.status(400).json({ error: "No ids provided" });
    const usersRef = db.collection("users");
    const users = [];
    for (const id of ids) {
      const doc = await usersRef.doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        users.push({ id: doc.id, email: data.email });
      }
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
