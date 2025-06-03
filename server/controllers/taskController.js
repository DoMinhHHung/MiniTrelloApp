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
    const io = req.app.get("io");
    io.to(boardId).emit("task:created", {
      id: docRef.id,
      ...newTask,
      cardId: id,
    });
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
    const { cardId, order, ...updateData } = req.body;

    if (cardId && cardId !== id) {
      const taskDoc = await db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(id)
        .collection("tasks")
        .doc(taskId)
        .get();

      if (!taskDoc.exists) {
        return res.status(404).json({ error: "Task not found" });
      }

      const taskData = taskDoc.data();

      await db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(id)
        .collection("tasks")
        .doc(taskId)
        .delete();

      const newTaskRef = await db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(cardId)
        .collection("tasks")
        .add({
          ...taskData,
          ...updateData,
          cardId,
          order,
        });

      const oldCardRef = db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(id);
      const newCardRef = db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(cardId);

      await db.runTransaction(async (transaction) => {
        const oldCardDoc = await transaction.get(oldCardRef);
        const newCardDoc = await transaction.get(newCardRef);

        transaction.update(oldCardRef, {
          tasks_count: (oldCardDoc.data().tasks_count || 0) - 1,
        });
        transaction.update(newCardRef, {
          tasks_count: (newCardDoc.data().tasks_count || 0) + 1,
        });
      });

      const io = req.app.get("io");
      io.to(boardId).emit("task:deleted", { cardId: id, taskId });
      io.to(boardId).emit("task:created", {
        id: newTaskRef.id,
        ...taskData,
        ...updateData,
        cardId,
        order,
      });

      res
        .status(200)
        .json({ id: newTaskRef.id, ...taskData, ...updateData, cardId, order });
    } else {
      await db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(id)
        .collection("tasks")
        .doc(taskId)
        .update({ ...updateData, order });

      const doc = await db
        .collection("boards")
        .doc(boardId)
        .collection("cards")
        .doc(id)
        .collection("tasks")
        .doc(taskId)
        .get();

      const io = req.app.get("io");
      io.to(boardId).emit("task:updated", { id: doc.id, ...doc.data() });

      res.status(200).json({ id: doc.id, ...doc.data() });
    }
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
    const io = req.app.get("io");
    io.to(boardId).emit("task:deleted", { cardId: id, taskId });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignMemberToTask = async (req, res) => {
  try {
    const { boardId, id, taskId } = req.params;
    const { memberId } = req.body;
    const userId = req.userData.id;

    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists)
      return res.status(404).json({ error: "Board not found" });
    const boardData = boardDoc.data();
    if (!boardData.members.includes(userId)) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền thao tác trên board này" });
    }
    if (!boardData.members.includes(memberId)) {
      return res
        .status(400)
        .json({ error: "Thành viên này không thuộc board" });
    }

    const taskRef = db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .doc(taskId);

    const taskDoc = await taskRef.get();
    if (!taskDoc.exists)
      return res.status(404).json({ error: "Task not found" });

    const taskData = taskDoc.data();
    let members = taskData.members || [];
    if (!members.includes(memberId)) {
      members.push(memberId);
      await taskRef.update({ members });
    }
    res.status(201).json({ taskId, memberId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTaskAssignedMembers = async (req, res) => {
  try {
    const { boardId, id, taskId } = req.params;
    const userId = req.userData.id;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists)
      return res.status(404).json({ error: "Board not found" });
    const boardData = boardDoc.data();
    if (!boardData.members.includes(userId)) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền thao tác trên board này" });
    }

    const taskRef = db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .doc(taskId);

    const taskDoc = await taskRef.get();
    if (!taskDoc.exists)
      return res.status(404).json({ error: "Task not found" });

    const members = taskDoc.data().members || [];
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeMemberFromTask = async (req, res) => {
  try {
    const { boardId, id, taskId, memberId } = req.params;
    const userId = req.userData.id;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists)
      return res.status(404).json({ error: "Board not found" });
    const boardData = boardDoc.data();
    if (!boardData.members.includes(userId)) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền thao tác trên board này" });
    }

    const taskRef = db
      .collection("boards")
      .doc(boardId)
      .collection("cards")
      .doc(id)
      .collection("tasks")
      .doc(taskId);

    const taskDoc = await taskRef.get();
    if (!taskDoc.exists)
      return res.status(404).json({ error: "Task not found" });

    let members = taskDoc.data().members || [];
    members = members.filter((m) => m !== memberId);
    await taskRef.update({ members });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
