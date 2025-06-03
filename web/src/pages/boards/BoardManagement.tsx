import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Sidebar from "../../components/Sidebar";
import logo from "../../assets/logo.png";
import { boardService, socketService } from "../../services";
import type { Board } from "../../types";

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

const BoardManagement = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    boardId: string | null;
  }>({ open: false, boardId: null });

  useEffect(() => {
    fetchBoards();
    socketService.connect();
    socketService.onBoardCreated((board: Board) => {
      setBoards((prev) => [...prev, board]);
    });
    socketService.onBoardUpdated((board: Board) => {
      setBoards((prev) =>
        prev.map((b) => (b.id === board.id ? { ...b, ...board } : b))
      );
    });
    socketService.onBoardDeleted(({ id }: { id: string }) => {
      setBoards((prev) => prev.filter((b) => b.id !== id));
    });
    return () => {
      socketService.disconnect();
    };
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (err: any) {
      setError("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (board?: Board) => {
    if (board) {
      setEditingBoard(board);
      setFormData({
        name: board.name,
        description: board.description,
      });
    } else {
      setEditingBoard(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBoard(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBoard) {
        await boardService.updateBoard(
          editingBoard.id,
          formData.name,
          formData.description
        );
        await fetchBoards();
      } else {
        await boardService.createBoard(formData.name, formData.description);
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(
        editingBoard ? "Failed to update board" : "Failed to create board"
      );
    }
  };

  const handleDelete = (boardId: string) => {
    setConfirmDelete({ open: true, boardId });
  };

  const confirmDeleteBoard = async () => {
    if (confirmDelete.boardId) {
      try {
        await boardService.deleteBoard(confirmDelete.boardId);
        setConfirmDelete({ open: false, boardId: null });
      } catch (err: any) {
        setError("Failed to delete board");
      }
    }
  };

  return (
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
          selected="boards"
          userName={getUserNameFromToken()}
        />
      </Box>
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
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
            YOUR WORKSPACES
          </Typography>
        </Box>
        {/* Boards grid */}
        <Box sx={{ flex: 1, p: 4, overflow: "auto", width: "100%" }}>
          <Grid container spacing={3} sx={{ width: "100%", margin: 0 }}>
            {boards.map((board) => (
              <Grid item xs={12} sm={6} md={4} key={board.id}>
                <Card
                  sx={{
                    bgcolor: "#fff",
                    minHeight: 140,
                    minWidth: 260,
                    maxWidth: 320,
                    width: "100%",
                    cursor: "pointer",
                    position: "relative",
                    mx: "auto",
                  }}
                >
                  <CardContent
                    onClick={() => navigate(`/boards/${board.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Typography variant="body1" color="text.primary">
                      {board.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {board.description}
                    </Typography>
                  </CardContent>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(board);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(board.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  bgcolor: "transparent",
                  border: "1px solid #888",
                  minHeight: 140,
                  minWidth: 260,
                  maxWidth: 320,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  mx: "auto",
                }}
                onClick={() => handleOpenDialog()}
              >
                <Typography color="#bbb">+ Create a new board</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingBoard ? "Edit board" : "Create new board"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Board name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingBoard ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, boardId: null })}
      >
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this board?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDelete({ open: false, boardId: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteBoard}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoardManagement;
