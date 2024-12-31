import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  repos: [mongoose.Types.ObjectId],
  teammates:[mongoose.Types.ObjectId],
  sharedRepos:[mongoose.Types.ObjectId]
});

const userModel = new mongoose.model("User", userSchema);
export default userModel;
