import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);
  const connectedUsers = new Set();

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
    connectedUsers.add(socket.id);
    io.emit("users-list", Array.from(connectedUsers));

    socket.on("input-change", (msg) => {
      socket.broadcast.emit("update-input", msg);
    });

    socket.on("input-focus", (id) => {
      console.log("input-focus");
      socket.broadcast.emit("update-editor", id);
    });

    socket.on("input-change", (msg) => {
      socket.broadcast.emit("update-input", msg);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);

      connectedUsers.delete(socket.id);

      io.emit("users-list", Array.from(connectedUsers));
    });
  });

  httpServer.listen(3000, () => {
    console.log("Ready on http://localhost:3000");
  });
});
