import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/index.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import { createServer } from "http";
import socketHandler from "./services/chatService.js";

dotenv.config();
const app = express();

const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], 
});


socketHandler(io);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

connectDB();

// Routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running",
  });
});

// app.listen(process.env.PORT,() => {
//   console.log(`Server is running on port ${process.env.PORT}`);
// }
// );

server.listen(process.env.PORT, () => {
  console.log(`Chat Server is running on port ${process.env.PORT}`);
});

