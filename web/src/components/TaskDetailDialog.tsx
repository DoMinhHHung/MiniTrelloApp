import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";

interface TaskDetailDialogProps {
  open: boolean;
  onClose: () => void;
  task: {
    title: string;
    description?: string;
    members?: { name: string; initials: string; color?: string; id?: string }[];
    listName?: string;
  };
  boardMembers: { id: string; email: string }[];
  onAddMember: (userId: string) => void;
  onRemoveMember?: (userId: string) => void;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  open,
  onClose,
  task,
  boardMembers,
  onAddMember,
  onRemoveMember,
}) => {
  const [openMemberDialog, setOpenMemberDialog] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<string>("");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ bgcolor: "#232a32", color: "#fff", p: 3, minHeight: 500 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {task.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#bbb", mt: 0.5 }}>
              in list {task.listName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 2 }}>
              <Typography sx={{ fontWeight: 500 }}>Members</Typography>
              {task.members?.map((m, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: m.color || "#d32f2f",
                      width: 32,
                      height: 32,
                      fontWeight: 600,
                    }}
                  >
                    {m.initials}
                  </Avatar>
                  {onRemoveMember && m.id && (
                    <IconButton
                      size="small"
                      sx={{ color: "#fff" }}
                      onClick={() => onRemoveMember(m.id!)}
                    >
                      ×
                    </IconButton>
                  )}
                </Box>
              ))}
              <IconButton
                size="small"
                sx={{ ml: 1, bgcolor: "#333", color: "#fff" }}
                onClick={() => setOpenMemberDialog(true)}
              >
                +
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 2 }}>
              <Typography sx={{ fontWeight: 500 }}>Notifications</Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ color: "#fff", borderColor: "#444" }}
              >
                Watch
              </Button>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 500, mb: 1 }}>Description</Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Add a more detailed description"
            value={task.description || ""}
            sx={{
              bgcolor: "#232a32",
              border: "1px solid #444",
              borderRadius: 1,
              color: "#fff",
              input: { color: "#fff" },
            }}
            InputProps={{ style: { color: "#fff" } }}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 500, mb: 1 }}>Activity</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: "#d32f2f",
                width: 32,
                height: 32,
                fontWeight: 600,
              }}
            >
              SD
            </Avatar>
            <TextField
              fullWidth
              placeholder="Write a comment"
              sx={{
                bgcolor: "#111",
                borderRadius: 1,
                input: { color: "#fff" },
              }}
              InputProps={{ style: { color: "#fff" } }}
            />
          </Box>
        </Box>
        <Box sx={{ position: "absolute", right: 32, top: 80, width: 220 }}>
          <Typography sx={{ fontWeight: 500, mb: 1 }}>Add to card</Typography>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "#444",
              mb: 1,
              justifyContent: "flex-start",
            }}
            startIcon={
              <Avatar
                sx={{ width: 24, height: 24, bgcolor: "#444", fontSize: 16 }}
              >
                M
              </Avatar>
            }
          >
            Members
          </Button>
          <Typography sx={{ fontWeight: 500, mt: 2, mb: 1 }}>
            Power-Ups
          </Typography>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "#232f3e",
              color: "#fff",
              mb: 1,
              justifyContent: "flex-start",
            }}
            startIcon={
              <Avatar
                sx={{ width: 24, height: 24, bgcolor: "#444", fontSize: 16 }}
              >
                G
              </Avatar>
            }
          >
            GitHub
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "#444",
              mb: 1,
              justifyContent: "flex-start",
            }}
          >
            Attach Branch
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{ color: "#fff", justifyContent: "flex-start" }}
          >
            Attach Commit
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{ color: "#fff", justifyContent: "flex-start" }}
          >
            Attach Issue
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{ color: "#fff", justifyContent: "flex-start" }}
          >
            Attach Pull Request...
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "#444",
              mt: 2,
              justifyContent: "flex-start",
            }}
          >
            Archive
          </Button>
        </Box>
      </Box>
      <Dialog
        open={openMemberDialog}
        onClose={() => setOpenMemberDialog(false)}
      >
        <DialogTitle>Select member to add</DialogTitle>
        <DialogContent>
          <List>
            {boardMembers.map((member) => (
              <ListItem
                key={member.id}
                component="button"
                onClick={() => setSelectedMember(member.id)}
                sx={{ cursor: "pointer" }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "#1976d2",
                    fontSize: 14,
                    mr: 2,
                  }}
                >
                  {member.email.slice(0, 2).toUpperCase()}
                </Avatar>
                <Typography>{member.email}</Typography>
                <Checkbox checked={selectedMember === member.id} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedMember) {
                onAddMember(selectedMember);
                setOpenMemberDialog(false);
                setSelectedMember("");
              }
            }}
            variant="contained"
            disabled={!selectedMember}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default TaskDetailDialog;
