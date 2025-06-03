import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logo.png";

interface NavbarProps {
  onMenuClick?: () => void;
  userInitials?: string;
}

const Navbar = ({ onMenuClick, userInitials = "SD" }: NavbarProps) => {
  return (
    <AppBar
      position="static"
      color="default"
      sx={{ bgcolor: "#232a32", boxShadow: "none" }}
    >
      <Toolbar sx={{ minHeight: 56, px: 2, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 32, ml: 1 }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Add more icons/actions here if needed */}
          <Avatar
            sx={{ bgcolor: "#d32f2f", width: 36, height: 36, fontWeight: 600 }}
          >
            {userInitials}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
