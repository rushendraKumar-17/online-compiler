import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  date:{
    type:Date,
    default:Date.now()
  },
  time:{
    type:String,
    default:Date.now().time
  }
})
const contactSchema = new mongoose.Schema({
  name:{
    type:String
  },
  email:{
    type:String
  },
  isAccepted:{
    type:Boolean
  },
  messages:[messageSchema]
})
const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  repos: [mongoose.Types.ObjectId],
  verificationCode:{
    type:String
  },
  verificationCodeExpiry:{
    type:Date
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  teammates:[contactSchema],
  sharedRepos:[mongoose.Types.ObjectId],
  invitations:[String]
});

const userModel = new mongoose.model("User", userSchema);
export default userModel;
