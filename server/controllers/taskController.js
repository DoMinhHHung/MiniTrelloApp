const { db } = require("../configs/firebase");
const admin = require("firebase-admin");

exports.getTasks = async (req, res) => {
  try {
    const { boardId, id } = req.params;
    const snapshot = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { boardId, id } = req.params;
    const { title, description, status } = req.body;
    const newTask = {
      title,
      description,
      status,
      createdAt: new Date(),
    };
    const docRef = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const { boardId, id, taskId } = req.params;
    const doc = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .doc(taskId)
      .get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { boardId, id, taskId } = req.params;
    await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .doc(taskId)
      .update(req.body);
    const doc = await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .doc(taskId)
      .get();
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { boardId, id, taskId } = req.params;
    await db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .doc(taskId)
      .delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
