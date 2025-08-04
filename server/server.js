

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
import sendMail from "./services/mailer.js";
import userRoutes from "./routes/userRoutes.js"
connectDb();

const app = express();
app.use(cors());
app.use(cors({
  origin:"*"
}))
app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header('Access-Control-Allow-Methods',"GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
})
const server =  http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"*"
    }
});
const rooms = {}; // key: roomId, value: [socketId1, socketId2]

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create-room",({id})=>{
    console.log(id);
    rooms[id] = [];
    rooms[id].push(socket.id);
  })
  socket.on("codeChange", ({ code, id }) => {
    console.log(`Code change in room ${id} by ${socket.id}:`, code);
    // Emit the code change to all users in the room
    // console.log(rooms);
    rooms[id].forEach((socketId)=>{
      if(socketId!=socket.id){

        io.to(socketId).emit("codeChange",code);
        console.log("Emitted change");
      }
    })
    socket.to(id).emit("codeChange", { code, userId: socket.id });
  }
  );
  
  socket.on("join-room", ({ id,name }) => {
    console.log("Logging name",id,name);
    let roomId = id;
    console.log(rooms[roomId]);
    console.log(`User ${socket.id} joined room ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);
    socket.join(roomId);

    rooms[id].forEach((socketId)=>{
      if(socketId!=socket.id){

        io.to(socketId).emit("user-joined",{newUserId:socket.id,name});
        console.log("Emitted user joined event");
      }
    })

    // socket.to(roomId).emit("user-joined", { newUserId: socket.id });

    // socket.emit("existing-users", { users: rooms[roomId].filter(id => id !== socket.id) });
  });

  socket.on("offer", ({ offer, to,name }) => {
    console.log(`Forwarding offer from ${socket.id} to ${to}`);
    io.to(to).emit("offer", { offer, from: socket.id,name });
  });

  socket.on("nego-needed",({to,offer})=>{
    io.to(to).emit("nego-needed",{from:socket.id,offer})
  })
  socket.on('nego-done',({to,answer})=>{
    io.to(to).emit("nego-final",{from:to,answer});
  })
  socket.on("answer", ({ answer, to }) => {
    console.log(`Forwarding answer from ${socket.id} to ${to}`);
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    console.log(`Forwarding ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("change-language",({language,id})=>{
    console.log("language",id,language);
    rooms[id].forEach((userId) => {
      if (userId !== socket.id) {
        io.to(userId).emit("change-language", language);
      }
    })
  })
  socket.on("message", (message, time, sender,roomId) => {
    console.log(`Message from ${sender}: ${message} at ${time}`);
    // Emit the message to all users in the room
    console.log(roomId);
    console.log(rooms);
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


app.get("/meet/:meetId",(req,res)=>{
  console.log("Got a request");
  const {meetId} = req.params;
  // console.log(rooms);
  console.log("Meeting id:",meetId);
  if(rooms[meetId] != undefined) return res.status(200).json({message:"Meeting available"});
  else return res.status(404).json({message:"Meeting not found"});
})
app.get("/",(req,res)=>{
  res.send("Server running...");
})
app.get("/test-mail",async(req,res)=>{
  const response =await sendMail("rushendra0123@gmail.com","Test","Testing nodemailer");
  return res.status(200).send(response);
})

app.use("/repo",repoRoutes);
  

app.use("/code",codeRoutes);

app.use("/file",fileRoutes);


app.use("/api/user",userRoutes);

export default server;