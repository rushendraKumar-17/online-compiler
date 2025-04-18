

import express from 'express';
import {Server} from 'socket.io';
import http from 'http';
import connectDb from "./config/connectDB.js";
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import repoRoutes from "./routes/repoRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import mongoose from 'mongoose';

import userRoutes from "./routes/userRoutes.js"
connectDb();

const app = express();
app.use(cors());
const server =  http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"*"
    }
});
const rooms = {}; // key: roomId, value: [socketId1, socketId2]

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("codeChange")
  socket.on("join-room", ({ roomId }) => {
    console.log(`User ${socket.id} joined room ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    
    rooms[roomId].push(socket.id);
    socket.join(roomId);

    // Notify existing users that a new user joined
    socket.to(roomId).emit("user-joined", { newUserId: socket.id });

    // Send existing users' IDs to the new user
    socket.emit("existing-users", { users: rooms[roomId].filter(id => id !== socket.id) });
  });

  socket.on("offer", ({ offer, to }) => {
    console.log(`Forwarding offer from ${socket.id} to ${to}`);
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    console.log(`Forwarding answer from ${socket.id} to ${to}`);
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    console.log(`Forwarding ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("message", (message, time, sender,roomId) => {
    console.log(`Message from ${sender}: ${message} at ${time}`);
    // Emit the message to all users in the room
    console.log(rooms[roomId]);
    rooms[roomId].forEach((userId) => {
      if (userId !== socket.id) {
        io.to(userId).emit("message", message, time, sender);
      }
    } 
    );
  }
  );
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);

      // Notify remaining users that someone left
      socket.to(roomId).emit("user-left", { userId: socket.id });

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

io.on("connect_error", (error) => {
  console.log("Connection error:", error);
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get("/",(req,res)=>{
  res.send("Server running...");
})

app.use("/repo",repoRoutes);
  

app.use("/code",codeRoutes);

app.use("/file",fileRoutes);


app.use("/api/user",userRoutes);

export default server;