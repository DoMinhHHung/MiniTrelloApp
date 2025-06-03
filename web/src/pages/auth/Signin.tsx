import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { authService } from "../../services/authService";
import logo from "../../assets/logo.png";
import bg from "../../assets/Background.png";

const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call backend to request verification code (if needed)
      // You may want to implement a separate endpoint for requesting code
      setCodeSent(true);
    } catch (err: any) {
      setError("Đã xảy ra lỗi khi gửi mã xác thực");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.signIn(email, verificationCode);
      localStorage.setItem("token", response.token);
      localStorage.setItem("userEmail", email);

      // Check for invite redirect
      const inviteRedirect = localStorage.getItem("inviteRedirect");
      if (inviteRedirect) {
        localStorage.removeItem("inviteRedirect");
        navigate(inviteRedirect);
      } else {
        // Check for regular redirect
        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect");
        navigate(redirect || "/boards");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Box
        component="img"
        src={bg}
        alt="background left"
        sx={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: { xs: "120px", md: "320px" },
          zIndex: 0,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
      <Box
        component="img"
        src={bg}
        alt="background right"
        sx={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: { xs: "120px", md: "320px" },
          zIndex: 0,
          userSelect: "none",
          pointerEvents: "none",
          transform: "scaleX(-1)",
        }}
      />
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: 80, display: "block", margin: "0 auto" }}
            />
          </Box>
          <Typography component="h1" variant="h6" sx={{ mb: 2 }}>
            Log in to continue
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={handleGitHubLogin}
            sx={{ mb: 2 }}
          >
            Đăng nhập bằng GitHub
          </Button>
          <Divider sx={{ width: "100%", my: 2 }}>or</Divider>
          <Box
            component="form"
            onSubmit={codeSent ? handleSignIn : handleRequestCode}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Enter your email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
              helperText={error}
            />
            {codeSent && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="verificationCode"
                label="Mã xác thực"
                name="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : codeSent ? "Đăng nhập" : "Continue"}
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              display="block"
              sx={{ mb: 1 }}
            >
              Privacy Policy
              <br />
              This site is protected by reCAPTCHA and the Google Privacy Policy
              and Terms of Service apply.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signin;
