const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const rooms = {}; // Store life totals

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join_room", ({ roomId, player }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { p1: 20, p2: 20 };
        }
        io.to(roomId).emit("initial_life", rooms[roomId]);
    });

    socket.on("update_life", ({ roomId, player, life }) => {
        if (rooms[roomId]) {
            rooms[roomId][player] = life;
            io.to(roomId).emit("update_life", rooms[roomId]);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`WebSocket Server running on port ${PORT}`));
