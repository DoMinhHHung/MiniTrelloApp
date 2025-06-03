require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const authRoutes = require("./routes/authRoute");
const boardRoutes = require("./routes/boardRoute");

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Đã xảy ra lỗi!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinBoard", (boardId) => {
    socket.join(boardId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
