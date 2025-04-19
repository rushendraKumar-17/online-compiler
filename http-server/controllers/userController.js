import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
const registerUser = async (req, res) => {
    const { name,email, password } = req.body;
    try {
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await userModel.create({ name,email, password,teammates:[],repos:[] });
        const token = jwt.sign({ id: user._id,email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ token,user:{name,email,id:user._id},teammates:[] });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (user && password === user.password) {
            
            const token = jwt.sign({ id: user._id,email }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({ token,user:{email,name:user.name,id:user._id,teammates:user.teammates} });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const addTeamMate = async(req,res)=>{
    const {email} = req.body;
    console.log(email);
    console.log(req.user);
    if(email === req.user.email) return res.status(400).json({message:"Cannot send request to yourself"});
    const user = await userModel.findOne({email:req.user.email});
    // if(!user.teammates[email]){
    //     return res.status(400).json({message:"This user is already your teammates"});
    // }
    const teammate =await  userModel.findOne({email});
    if(!teammate){
        return res.status(404).json({message:"User not found"});
    }
    else{
        console.log(user);
        const teamMateDetails = {
            name:teammate.name,
            email,
           isAccepted:false
        }
        user.teammates.push(teamMateDetails);
        teammate.invitations.push(user.email);
        await teammate.save();
        await user.save();
        return res.status(200).json({message:"Team mate added"});
    }
}
const getUser = async(req,res)=>{
    const token = req.headers?.authorization?.split(" ")[1];
    if(!token){
        return res.status(400).json({message:"Token not found"});
    }
    let decoded;
    try{
    decoded =await jwt.verify(token,process.env.JWT_SECRET);
    }
    catch(e){
        return res.status(400).json({message:"Invalid signature"});
    }
    const user = await userModel.findOne({email:decoded.email});
    if(!user){
        return res.status(404).json("Invalid token");
    }
    else{
        return res.status(200).json({user:{name:user.name,email:user.email,id:user._id}})
    }
}   
const getTeammates = async(req,res)=>{
    const user = await userModel.findOne({email:req.user.email});
    const teamMatesId = user.teammates;
    console.log(user.teammates);
    // const teamMates = await Promise.all(teamMatesId.map(async(id)=>{
    //     const user = await userModel.findById(id);
    //     return {name:user.name,email:user.email};
    // }));
    
    return res.status(200).json({teamMates:teamMatesId});
}
const getUserInvitations = async(req,res)=>{
    const user = await userModel.findOne({email:req.user.email});
    const invitations = user.invitations;
    return res.status(200).json({invitations});
}
const acceptInvite = async(req,res)=>{
    const {email} = req.body;
    const requestedUser = await userModel.findOne({email});
    // console.log(requestedUser.teammates)
    const user = await userModel.findOne({email:req.user.email});
;    requestedUser.teammates.forEach(teammate=>{
        if(teammate.email === email){
            teammate.isAccepted = true;
            console.log(teammate);
        }
    });
    console.log(user);
    requestedUser.save();
    user.invitations = user.invitations.filter(invite=>invite!==email);
    requestedUser.teammates.push({
        name:user.name,
        email:user.email,
        messages:[],
        isAccepted:true
    })
    user.save();
    console.log(user.invitations);
    return res.status(200).json({message:"Invite accepted"});
}

export default {loginUser,registerUser,addTeamMate,getUser,getTeammates,getUserInvitations,acceptInvite};