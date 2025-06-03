const { db } = require("../configs/firebase");
const admin = require("firebase-admin");

exports.getCards = async (req, res) => {
  try {
    const { boardId } = req.params;
    const snapshot = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .get();
    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name, description, createdAt } = req.body;
    const newCard = {
      name,
      description,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      members: [],
      tasks_count: 0,
    };
    const docRef = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .add(newCard);
    const io = req.app.get("io");
    io.to(boardId).emit("card:created", { id: docRef.id, ...newCard });
    res.status(201).json({ id: docRef.id, ...newCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCard = async (req, res) => {
  try {
    const { boardId, id } = req.params;
    const doc = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .get();
    if (!doc.exists) return res.status(404).json({ error: "Card not found" });
    const io = req.app.get("io");
    io.to(boardId).emit("cardUpdated", { id: doc.id, ...doc.data() });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCardsByUser = async (req, res) => {
  try {
    const { boardId, user_id } = req.params;
    const snapshot = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .where("members", "array-contains", user_id)
      .get();
    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { boardId, id } = req.params;
    const { name, description, ...params } = req.body;
    await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .update({ name, description, ...params });
    const doc = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .get();
    const io = req.app.get("io");
    io.to(boardId).emit("cardUpdated", { id: doc.id, ...doc.data() });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { boardId, id } = req.params;
    await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .delete();
    const io = req.app.get("io");
    io.to(boardId).emit("card:deleted", { id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
