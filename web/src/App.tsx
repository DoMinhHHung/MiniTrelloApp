import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Signin from "./pages/auth/Signin";
import Verify from "./pages/auth/Verify";
import BoardManagement from "./pages/boards/BoardManagement";
import { AuthProvider } from "./contexts/AuthContext";
import GithubCallback from "./pages/auth/GithubCallback";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/signin" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/signin" element={<Signin />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/auth/github/callback" element={<GithubCallback />} />
            <Route
              path="/boards"
              element={
                <PrivateRoute>
                  <BoardManagement />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/boards" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
