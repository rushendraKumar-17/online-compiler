import fileModel from "../models/fileModel.js";
import repoModel from "../models/repositoryModel.js";
import userModel from "../models/userModel.js";


const getRepoById = async (req, res) => {
  const { id } = req.params;

  try {
    const files = await fileModel.find({parent:id});
    res.status(200).json(files);
  } catch (error) {
    console.error( error);
    res.status(500).send("Internal Server Error");
  }
};


export const createNewRepo = async(req,res)=>{
    const {name} = req.body;
    const user = await userModel.findOne({email:req.user.email});
    if(!name){
        return res.status(400).send("File name is required");
    }
    try{
    const newRepo = await repoModel.create({
        name,
        files:[],
        createdBy:req.user.id  
    });
    user.repos.push(newRepo._id);
    user.save();
    res.status(200).json({message:"New repository created"});
}catch(e){
    res.status(500).json(e);
}
}

export const getAllRepos = async(req, res) => {
  const repos = await repoModel.find({createdBy:req.user.id});
  res.status(200).json(repos);
}

export const shareRepo = async(req,res)=>{
  const { team } = req.body;
  const { id } = req.params;

  try {
    const repo = await repoModel.findById(id);
    if (!repo) {
      return res.status(404).send("Repository not found");
    }

    for (const email of team) {
      const user = await userModel.findOne({ email });
      if (user) {
        user.sharedRepos.push(id);
        await user.save();
      }
    }

    repo.sharedBy = repo.sharedBy.concat(team);
    await repo.save();

    res.status(200).json({ message: "Shared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
export default { getRepoById,createNewRepo,getAllRepos,shareRepo };
