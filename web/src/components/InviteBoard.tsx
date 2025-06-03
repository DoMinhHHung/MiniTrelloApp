import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { boardService } from "../services/boardService";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const InviteBoard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [boardName, setBoardName] = useState("");

  const params = new URLSearchParams(location.search);
  const boardId = params.get("boardId");

  useEffect(() => {
    const handleInvite = async () => {
      if (!boardId) {
        setStatus("error");
        setMessage("Invalid invite link.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.setItem("inviteRedirect", `/invite?boardId=${boardId}`);
        navigate(`/signin?redirect=/invite?boardId=${boardId}`);
        return;
      }

      try {
        const board = await boardService.getBoard(boardId);
        setBoardName(board.name);

        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          setStatus("error");
          setMessage("Please sign in to continue.");
          return;
        }

        await boardService.acceptInvite(boardId, userEmail);
        setStatus("success");
        setMessage(
          `You have successfully joined the board "${board.name}"! Redirecting...`
        );
        setTimeout(() => {
          navigate(`/boards/${boardId}`);
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.response?.data?.error || "Failed to join board.");
      }
    };

    handleInvite();
  }, [boardId, navigate]);

  const handleSignIn = () => {
    localStorage.setItem("inviteRedirect", `/invite?boardId=${boardId}`);
    navigate(`/signin?redirect=/invite?boardId=${boardId}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          p: 4,
          borderRadius: 2,
          boxShadow: 1,
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Processing your invitation...
            </Typography>
          </>
        )}

        {status === "error" && (
          <>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              {message}
            </Typography>
            {!localStorage.getItem("token") && (
              <Button variant="contained" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
              {message}
            </Typography>
            <CircularProgress size={24} />
          </>
        )}
      </Box>
    </Box>
  );
};

export default InviteBoard;
