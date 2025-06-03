import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
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
import { boardService, socketService } from "../../services";
import type { Board } from "../../types";

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

  useEffect(() => {
    fetchBoards();
    setupSocketListeners();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.connect();
    socketService.onBoardCreated((board) => {
      setBoards((prev) => [...prev, board]);
    });
    socketService.onBoardUpdated((board) => {
      setBoards((prev) =>
        prev.map((b) => (b.id === board.id ? { ...b, ...board } : b))
      );
    });
    socketService.onBoardDeleted(({ id }) => {
      setBoards((prev) => prev.filter((b) => b.id !== id));
    });
  };

  const fetchBoards = async () => {
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải danh sách bảng");
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
      } else {
        await boardService.createBoard(formData.name, formData.description);
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.error || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (boardId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bảng này?")) {
      try {
        await boardService.deleteBoard(boardId);
      } catch (err: any) {
        setError(err.response?.data?.error || "Không thể xóa bảng");
      }
    }
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4">Quản lý bảng</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Tạo bảng mới
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {boards.map((board) => (
          <Grid item xs={12} sm={6} md={4} key={board.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {board.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {board.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/boards/${board.id}`)}
                >
                  Xem chi tiết
                </Button>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(board)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(board.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingBoard ? "Chỉnh sửa bảng" : "Tạo bảng mới"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Tên bảng"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <TextField
              margin="dense"
              label="Mô tả"
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
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editingBoard ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default BoardManagement;
