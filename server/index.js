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
    origin: "*", // hoặc chỉ định domain FE
    methods: ["GET", "POST"],
  },
});

// Cho phép các controller truy cập io
app.set("io", io);

app.use(cors());
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

// Lắng nghe kết nối socket
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Tham gia vào room board
  socket.on("joinBoard", (boardId) => {
    socket.join(boardId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
