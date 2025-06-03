import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { cardService } from "../../services/cardService";
import { taskService } from "../../services/taskService";
import type { Card as BoardCard, Task } from "../../types";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import logo from "../../assets/logo.png";
import { socketService } from "../../services/socketService";
import { boardService } from "../../services/boardService";
import axios from "axios";
import TaskDetailDialog from "../../components/TaskDetailDialog";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const CARD_TYPE = "CARD";
const TASK_TYPE = "TASK";

function getUserNameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return localStorage.getItem("userEmail") || "User";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload.name ||
      payload.email ||
      localStorage.getItem("userEmail") ||
      "User"
    );
  } catch {
    return localStorage.getItem("userEmail") || "User";
  }
}

const BoardDetail = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [tasks, setTasks] = useState<{ [cardId: string]: Task[] }>({});
  const [openCardDialog, setOpenCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<BoardCard | null>(null);
  const [cardForm, setCardForm] = useState({ name: "", description: "" });
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    cardId: string;
    task: Task | null;
  } | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [boardName, setBoardName] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteLinkEnabled, setInviteLinkEnabled] = useState(true);
  const [members, setMembers] = useState<string[]>([]);
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [sidebarSelected, setSidebarSelected] = useState("boards");
  const [taskDetailDialogOpen, setTaskDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskMembers, setTaskMembers] = useState<string[]>([]);
  const navigate = useNavigate();

  console.log("BoardDetail render, memberEmails:", memberEmails);

  useEffect(() => {
    if (!boardId) return;
    fetchCards();
    const fetchMembers = () => {
      boardService.getBoard(boardId).then((board) => {
        setBoardName(board.name);
        setMembers(board.members || []);
        if (board.members && board.members.length > 0) {
          axios
            .get(`/boards/users?ids=${board.members.join(",")}`)
            .then((res) => {
              const emails = res.data.map((u: any) => u.email);
              console.log(
                "FE nhận được emails:",
                emails,
                "board.members:",
                board.members
              );
              setMemberEmails(emails);
              setTimeout(() => {
                console.log(
                  "Sau khi setMemberEmails:",
                  emails,
                  "memberEmails state:",
                  memberEmails
                );
              }, 1000);
            })
            .catch(() => {
              setMemberEmails([]);
            });
        } else {
          setMemberEmails([]);
        }
      });
    };
    fetchMembers();

    socketService.connect();
    socketService.joinBoard(boardId);

    const handleMemberJoined = () => {
      fetchMembers();
    };
    socketService.onMemberJoined(handleMemberJoined);

    socketService.onCardCreated((card: BoardCard) => {
      setCards((prev) => {
        if (prev.find((c) => c.id === card.id)) return prev;
        return [...prev, card];
      });
    });

    socketService.onCardUpdated((card: BoardCard) => {
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, ...card } : c))
      );
    });

    socketService.onCardDeleted(({ id }: { id: string }) => {
      setCards((prev) => prev.filter((c) => c.id !== id));
    });

    const handleTaskUpsert = (task: Task) => {
      if (task.cardId) {
        setTasks((prev) => {
          const newTasks = { ...prev };
          Object.keys(newTasks).forEach((cardId) => {
            newTasks[cardId] = newTasks[cardId].filter((t) => t.id !== task.id);
          });
          const arr = newTasks[task.cardId as string] || [];
          if (!arr.find((t) => t.id === task.id)) {
            newTasks[task.cardId as string] = [...arr, task];
          }
          return newTasks;
        });
      }
    };

    socketService.onTaskCreated(handleTaskUpsert);
    socketService.onTaskUpdated(handleTaskUpsert);

    socketService.onTaskDeleted(
      ({ cardId, taskId }: { cardId: string; taskId: string }) => {
        setTasks((prev) => ({
          ...prev,
          [cardId]: (prev[cardId] || []).filter((t) => t.id !== taskId),
        }));
      }
    );

    return () => {
      socketService.disconnect();
    };
  }, [boardId]);

  useEffect(() => {
    if (selectedTask && boardId && selectedTask.cardId) {
      taskService
        .getAssignedMembers(boardId, selectedTask.cardId, selectedTask.id)
        .then((res) => {
          const data = res && (res as any).data ? (res as any).data : res;
          if (Array.isArray(data) && typeof data[0] === "string") {
            setTaskMembers(data);
          } else if (Array.isArray(data) && data[0]?.memberId) {
            setTaskMembers(data.map((m: any) => m.memberId));
          } else {
            setTaskMembers([]);
          }
        })
        .catch(() => setTaskMembers([]));
    }
  }, [selectedTask, boardId]);

  const fetchCards = async () => {
    if (!boardId) return;
    const data = await cardService.getCards(boardId);
    setCards(data);
    const tasksObj: { [cardId: string]: Task[] } = {};
    for (const card of data) {
      tasksObj[card.id] = await taskService.getTasks(boardId, card.id);
    }
    setTasks(tasksObj);
  };

  const handleOpenCardDialog = (card?: BoardCard) => {
    if (card) {
      setEditingCard(card);
      setCardForm({ name: card.name, description: card.description });
    } else {
      setEditingCard(null);
      setCardForm({ name: "", description: "" });
    }
    setOpenCardDialog(true);
  };
  const handleCloseCardDialog = () => {
    setOpenCardDialog(false);
    setEditingCard(null);
    setCardForm({ name: "", description: "" });
  };
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardId) return;
    if (editingCard) {
      await cardService.updateCard(boardId, editingCard.id, cardForm);
    } else {
      await cardService.createCard(
        boardId,
        cardForm.name,
        cardForm.description
      );
    }
    await fetchCards();
    handleCloseCardDialog();
  };
  const handleDeleteCard = async (cardId: string) => {
    if (!boardId) return;
    await cardService.deleteCard(boardId, cardId);
    await fetchCards();
  };

  const handleOpenTaskDialog = (cardId: string, task?: Task) => {
    if (task) {
      setEditingTask({ cardId, task });
      setTaskForm({ title: task.title, description: task.description });
    } else {
      setEditingTask({ cardId, task: null });
      setTaskForm({ title: "", description: "" });
    }
    setOpenTaskDialog(true);
  };
  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setEditingTask(null);
    setTaskForm({ title: "", description: "" });
  };
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardId || !editingTask) return;
    const { cardId, task } = editingTask;
    if (task) {
      await taskService.updateTask(boardId, cardId, task.id, {
        title: taskForm.title,
        description: taskForm.description,
        status: task.status,
      });
    } else {
      await taskService.createTask(
        boardId,
        cardId,
        taskForm.title,
        taskForm.description,
        "icebox"
      );
    }
    await fetchCards();
    handleCloseTaskDialog();
  };
  const handleDeleteTask = async (cardId: string, taskId: string) => {
    if (!boardId) return;
    await taskService.deleteTask(boardId, cardId, taskId);
    await fetchCards();
  };

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setCards((prev) => {
        const updated = [...prev];
        const [removed] = updated.splice(dragIndex, 1);
        updated.splice(hoverIndex, 0, removed);
        updated.forEach((card, idx) => {
          if (card.order !== idx) {
            cardService.updateCard(boardId!, card.id, { order: idx });
          }
        });
        return updated.map((card, idx) => ({ ...card, order: idx }));
      });
    },
    [boardId]
  );

  const moveTask = useCallback(
    (
      fromCardId: string,
      toCardId: string,
      fromIndex: number,
      toIndex: number
    ) => {
      if (!boardId) return;
      const moved = (tasks[fromCardId] || [])[fromIndex];
      if (!moved) return;
      taskService.updateTask(boardId, fromCardId, moved.id, {
        cardId: toCardId,
        order: toIndex,
        status: moved.status,
      });
    },
    [boardId, tasks]
  );

  const CardDnD = ({
    card,
    index,
    children,
  }: {
    card: BoardCard;
    index: number;
    children: React.ReactNode;
  }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag({
      type: CARD_TYPE,
      item: { id: card.id, index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    const [, drop] = useDrop({
      accept: CARD_TYPE,
      hover(item: { id: string; index: number }, monitor) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveCard(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });
    drag(drop(ref));
    return (
      <Box ref={ref} sx={{ opacity: isDragging ? 0.5 : 1 }}>
        {children}
      </Box>
    );
  };

  const TaskDnD = ({
    cardId,
    task,
    index,
  }: {
    cardId: string;
    task: Task;
    index: number;
  }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag({
      type: TASK_TYPE,
      item: { id: task.id, cardId, index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    const [, drop] = useDrop({
      accept: TASK_TYPE,
      hover(item: { id: string; cardId: string; index: number }, monitor) {
        if (!ref.current) return;
        if (item.cardId === cardId && item.index === index) return;

        const fromTasks = tasks[item.cardId] || [];
        const toTasks = tasks[cardId] || [];

        const fromIndex = item.index;
        const toIndex = index;

        moveTask(item.cardId, cardId, fromIndex, toIndex);

        item.index = toIndex;
        item.cardId = cardId;
      },
    });
    drag(drop(ref));
    return (
      <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <ListItem
          sx={{
            bgcolor: "#333",
            mb: 1,
            borderRadius: 1,
            "&:hover": {
              bgcolor: "#444",
            },
          }}
          secondaryAction={
            <>
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleOpenTaskDialog(cardId, task)}
                color="inherit"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleDeleteTask(cardId, task.id)}
                color="inherit"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                size="small"
                onClick={() => {
                  setSelectedTask(task);
                  setTaskDetailDialogOpen(true);
                }}
                color="inherit"
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </>
          }
        >
          <ListItemText
            primary={task.title}
            secondary={task.description}
            primaryTypographyProps={{ color: "#fff" }}
            secondaryTypographyProps={{ color: "#bbb" }}
          />
        </ListItem>
      </div>
    );
  };

  const TaskDropZone = ({ cardId }: { cardId: string }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [, drop] = useDrop({
      accept: TASK_TYPE,
      drop(item: { id: string; cardId: string; index: number }) {
        moveTask(item.cardId, cardId, item.index, 0);
        item.cardId = cardId;
        item.index = 0;
      },
      canDrop: (item) => item.cardId !== cardId,
    });
    drop(ref);
    return (
      <div
        ref={ref}
        style={{
          minHeight: 48,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontStyle: "italic",
          marginBottom: 8,
        }}
      >
        Drop task here
      </div>
    );
  };

  const handleOpenInvite = () => {
    setInviteOpen(true);
    setInviteEmail("");
    setInviteError("");
    setInviteSuccess("");
  };
  const handleCloseInvite = () => {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteError("");
    setInviteSuccess("");
  };
  const handleInvite = async () => {
    if (!boardId || !inviteEmail) return;
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      await boardService.inviteMember(boardId, inviteEmail);
      setInviteSuccess("Invitation sent!");
      setInviteEmail("");
    } catch (e: any) {
      setInviteError(e?.response?.data?.error || "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };
  const handleCopyLink = async () => {
    if (boardId) {
      await navigator.clipboard.writeText(
        window.location.origin + `/boards/${boardId}/invite`
      );
    }
  };

  const handleAddMemberToTask = async (userId: string) => {
    if (!selectedTask) return;
    const cardId = selectedTask.cardId;
    if (!boardId || !cardId) return;

    try {
      await taskService.assignMember(boardId, cardId, selectedTask.id, userId);
      const res = await taskService.getAssignedMembers(
        boardId,
        cardId,
        selectedTask.id
      );
      const data = res && (res as any).data ? (res as any).data : res;
      if (Array.isArray(data) && typeof data[0] === "string") {
        setTaskMembers(data);
      } else if (Array.isArray(data) && data[0]?.memberId) {
        setTaskMembers(data.map((m: any) => m.memberId));
      } else {
        setTaskMembers([]);
      }
    } catch (e) {
      alert("Không thể gán thành viên vào task!");
    }
  };

  // Hàm xóa member khỏi task (chuẩn bị cho chức năng xóa)
  const handleRemoveMemberFromTask = async (userId: string) => {
    if (!selectedTask) return;
    const cardId = selectedTask.cardId;
    if (!boardId || !cardId) return;
    // TODO: sẽ gọi taskService.removeMemberAssignment ở bước sau
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          bgcolor: "#2c333a",
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Sidebar
            onClose={() => setSidebarOpen(false)}
            selected={sidebarSelected}
            onSelect={setSidebarSelected}
            boardId={boardId}
            members={members}
            memberEmails={memberEmails}
            onNavigateBoards={() => navigate("/boards")}
            userName={getUserNameFromToken()}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              height: 56,
              bgcolor: "#232a32",
              display: "flex",
              alignItems: "center",
              px: 3,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 32, mr: 2 }}
            />
            <Typography
              variant="h6"
              color="#fff"
              sx={{ flex: 1, fontWeight: 600 }}
            >
              {boardName || "BOARD DETAIL"}
            </Typography>
            <IconButton
              color="inherit"
              sx={{ color: "#fff" }}
              onClick={handleOpenInvite}
            >
              Invite member
              <PersonAddIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, p: 4, overflow: "auto" }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              {cards.map((card, cardIdx) => (
                <CardDnD card={card} index={cardIdx} key={card.id}>
                  <Box
                    sx={{
                      minWidth: 300,
                      bgcolor: "#222",
                      color: "#fff",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="subtitle1">{card.name}</Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenCardDialog(card)}
                          color="inherit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCard(card.id)}
                          color="inherit"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1, mt: 1 }}>
                      {card.description}
                    </Typography>
                    <List
                      dense
                      sx={{ bgcolor: "#111", borderRadius: 1, mb: 1 }}
                    >
                      {(tasks[card.id] || []).length === 0 ? (
                        <TaskDropZone cardId={card.id} />
                      ) : (
                        (tasks[card.id] || []).map((task, taskIdx) => (
                          <TaskDnD
                            key={task.id}
                            cardId={card.id}
                            task={task}
                            index={taskIdx}
                          />
                        ))
                      )}
                    </List>
                    <Button
                      variant="text"
                      color="inherit"
                      startIcon={<AddIcon />}
                      sx={{ mt: 1, color: "#fff" }}
                      onClick={() => handleOpenTaskDialog(card.id)}
                    >
                      Add a card
                    </Button>
                  </Box>
                </CardDnD>
              ))}
              <Box
                sx={{
                  minWidth: 300,
                  bgcolor: "#eee",
                  color: "#888",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() => handleOpenCardDialog()}
              >
                <AddIcon sx={{ mr: 1 }} /> Add another list
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={openCardDialog} onClose={handleCloseCardDialog}>
        <DialogTitle>
          {editingCard ? "Edit card" : "Create new card"}
        </DialogTitle>
        <form onSubmit={handleCardSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Card name"
              fullWidth
              required
              value={cardForm.name}
              onChange={(e) =>
                setCardForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={cardForm.description}
              onChange={(e) =>
                setCardForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCardDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCard ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog}>
        <DialogTitle>
          {editingTask?.task ? "Edit task" : "Create new task"}
        </DialogTitle>
        <form onSubmit={handleTaskSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Task title"
              fullWidth
              required
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTaskDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTask?.task ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={inviteOpen} onClose={handleCloseInvite}>
        <DialogTitle>Invite to Board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email address or name"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={inviteLoading}
          />
          {inviteError && (
            <Typography color="error" variant="body2">
              {inviteError}
            </Typography>
          )}
          {inviteSuccess && (
            <Typography color="success.main" variant="body2">
              {inviteSuccess}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              Invite someone to this Workspace with a link:
              <Button
                variant="text"
                size="small"
                sx={{ ml: 1, textTransform: "none" }}
                onClick={() => setInviteLinkEnabled(!inviteLinkEnabled)}
              >
                {inviteLinkEnabled ? "Disable link" : "Enable link"}
              </Button>
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              disabled={!inviteLinkEnabled}
            >
              Copy link
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvite}>Cancel</Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={!inviteEmail || inviteLoading}
          >
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      <TaskDetailDialog
        open={taskDetailDialogOpen}
        onClose={() => setTaskDetailDialogOpen(false)}
        task={
          selectedTask
            ? {
                title: selectedTask.title,
                description: selectedTask.description,
                members: (taskMembers || []).map((userId) => {
                  const idx = members.indexOf(userId);
                  const email = memberEmails[idx] || userId;
                  return {
                    name: email,
                    initials: email.split("@")[0].slice(0, 2).toUpperCase(),
                    color: "#d32f2f",
                    id: userId,
                  };
                }),
                listName: cards.find((c) => c.id === selectedTask.cardId)?.name,
              }
            : { title: "", description: "", members: [] }
        }
        boardMembers={members.map((id, idx) => ({
          id,
          email: memberEmails[idx] || id,
        }))}
        onAddMember={handleAddMemberToTask}
        onRemoveMember={handleRemoveMemberFromTask}
      />
    </DndProvider>
  );
};

export default BoardDetail;
