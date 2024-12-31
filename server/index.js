import express from 'express';
// import {Server} from 'socket.io';
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
// const io = new Server(server,{
//     cors:{
//         origin:"*"
//     }
// });
// io.on("connection", (socket) => {
//     console.log("User connected");
//     socket.on("message",(msg)=>{
//         io.emit("message",msg);
//         console.log(msg);
//     })
//     socket.on("disconnect",()=>{
//         console.log("User disconnected");
//     })
// });
// io.on('connect_error', (error) => {
//     console.log('Connection error:', error);
//   });
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use("/repo",repoRoutes);
  

app.use("/code",codeRoutes);

app.use("/file",fileRoutes);


app.use("/api/user",userRoutes);

server.listen(8000,()=>{
    console.log('Server is running on port 8000');
})