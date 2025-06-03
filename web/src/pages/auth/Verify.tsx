import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { authService } from "../../services/authService";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    navigate("/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.signin(email, verificationCode);
      localStorage.setItem("token", response.accessToken);
      navigate("/boards");
    } catch (err: any) {
      setError(err.response?.data?.error || "Mã xác thực không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container component="main" maxWidth="xs">
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
          <Typography component="h1" variant="h5">
            Xác thực email
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Vui lòng nhập mã xác thực đã được gửi đến email {email}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="verificationCode"
              label="Mã xác thực"
              name="verificationCode"
              autoFocus
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác thực"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Verify;
