import fileModel from "../models/fileModel.js";
import repoModel from "../models/repositoryModel.js";
const createNewFile = async (req, res) => {
  const { name, parent, type } = req.body;
  const repo = await repoModel.findById(parent);
    if(!repo){
        return res.status(404).json({message:"Repo not found"});
    }
  const newFile = {
    name,
    parent,
    type,
    content: "",
  };
  try {
    const file = await fileModel.create(newFile);
    console.log(repo);
    repo.files.push(file._id);
    repo.save();
    return res.status(200).json({ message: "File created"});
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal error" });
  }
};

export default { createNewFile };
