import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupIcon from "@mui/icons-material/Group";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  onClose?: () => void;
  selected?: string;
  onSelect?: (key: string) => void;
  boardId?: string;
  members?: string[];
  memberEmails?: string[];
  onNavigateBoards?: () => void;
  userName?: string;
}

const navItems = [
  { key: "boards", label: "Boards", icon: <BarChartIcon /> },
  { key: "members", label: "All Members", icon: <GroupIcon /> },
];

const Sidebar = ({
  onClose,
  selected = "boards",
  onSelect,
  boardId,
  members,
  memberEmails,
  onNavigateBoards,
  userName = "User",
}: SidebarProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { logout } = useAuth();

  const handleCloseClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmLogout = () => {
    setOpenDialog(false);
    logout();
  };

  const handleCancelLogout = () => {
    setOpenDialog(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  console.log("Sidebar nhận memberEmails:", memberEmails);

  return (
    <>
      <Box
        sx={{
          width: 260,
          height: "100vh",
          bgcolor: "#232a32",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              p: 2,
              bgcolor: "#232f3e",
              borderRadius: 1,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#1976d2",
                width: 40,
                height: 40,
                mr: 2,
              }}
            >
              {getInitials(userName)}
            </Avatar>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                maxWidth: 120,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </Typography>
          </Box>

          <List>
            {navItems.map((item) => (
              <ListItem
                disablePadding
                key={item.key}
                {...(selected === item.key ? { selected: true } : {})}
                onClick={() => {
                  if (item.key === "boards" && onNavigateBoards) {
                    onNavigateBoards();
                  } else if (onSelect) {
                    onSelect(item.key);
                  }
                }}
                sx={{
                  bgcolor: selected === item.key ? "#232f3e" : "inherit",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemButton>
                  <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {selected === "members" && memberEmails && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "#bbb", mb: 1, pl: 2 }}
              >
                Board Members
              </Typography>
              <List dense>
                {(memberEmails.length === 0 ? [userName] : memberEmails).map(
                  (email) => (
                    <ListItem
                      key={email}
                      sx={{
                        bgcolor: "#232f3e",
                        mb: 1,
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#2c3e50",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "#1976d2",
                            fontSize: 14,
                          }}
                        >
                          {getInitials(email)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={email}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          },
                        }}
                      />
                    </ListItem>
                  )
                )}
              </List>
            </Box>
          )}
        </Box>
        <Box>
          <Divider sx={{ bgcolor: "#444", mb: 2 }} />
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleCloseClick}
            sx={{ fontWeight: 600 }}
          >
            Close
          </Button>
        </Box>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Sign out</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to sign out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
