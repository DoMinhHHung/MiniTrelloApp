import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupIcon from "@mui/icons-material/Group";

interface SidebarProps {
  onClose?: () => void;
  selected?: string;
  onSelect?: (key: string) => void;
  boardId?: string;
  members?: string[];
  memberEmails?: string[];
  onNavigateBoards?: () => void;
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
}: SidebarProps) => {
  return (
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
              Members
            </Typography>
            <List dense>
              {memberEmails.length === 0 && (
                <ListItem>
                  <ListItemText primary="No members" />
                </ListItem>
              )}
              {memberEmails.map((email) => (
                <ListItem key={email}>
                  <ListItemText primary={email} />
                </ListItem>
              ))}
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
          onClick={onClose}
          sx={{ fontWeight: 600 }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
