import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on('input-change', msg => {
        console.log('input-change')
        socket.broadcast.emit('update-input', msg)
    })
  });

  httpServer.listen(3000, () => {
    console.log("Ready on http://localhost:3000");
  });
});
