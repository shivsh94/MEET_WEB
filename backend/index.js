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
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], 
});


socketHandler(io);
  
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

connectDB();

// Routes
app.use("/auth", authRoutes);

app.listen(process.env.PORT,() => {
  console.log(`Server is running on port ${process.env.PORT}`);
}
);

server.listen(process.env.CHAT_PORT, () => {
  console.log(`Chat Server is running on port ${process.env.CHAT_PORT}`);
});

