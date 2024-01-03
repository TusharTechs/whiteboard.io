import express, { Application, NextFunction, Request, Response } from "express";
import * as http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import * as dotenv from "dotenv";

interface Users {
  [key: string]: string;
}

const app: Application = express();
const server: http.Server = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});

dotenv.config();

const PORT: number | string = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("WebSocket server is running!");
});

const users: Users = {};

io.on("connection", (socket: Socket) => {
  console.log("A user connected");

  socket.on("new-user-joined", (name: any) => {
    console.log("New user", name);
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("drawing", (data: any) => {
    socket.broadcast.emit("drawing", data);
  });

  socket.on("send", (message: string) => {
    const senderName = users[socket.id];
    socket.broadcast.emit("receive", { message, name: senderName });
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      const userName = users[socket.id];
      socket.broadcast.emit("left", userName);
      delete users[socket.id];
    }
  });
});
