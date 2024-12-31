import React, { useContext, useState } from "react";
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";
import { AiOutlineFileAdd, AiOutlineFolderAdd } from "react-icons/ai";
import axios from "axios";
import FileIcons from "./FileIcons";
import AppContext from "../context/Context";
const FileBar = ({ props }) => {
  
  const {
    selectedFile,
    setSelectedFile,
    setSelectedFileContent,
    id,
    repo,
    fetchRepo,
    setLanguage,
    extensionMap
  } = props;

  const [mainRepo, setMainRepo] = useState(false);
  const {apiUrl} = useContext(AppContext);
  const token = localStorage.getItem('token');
  const handleAddFile = (e) => {
    e.stopPropagation();
    setNewFileWindow(true);
    console.log("Adding file");
    // Add logic for file creation
  };
  const addFile = async() => {
    const file = fileName.split(".");
    const fileExtension = file[file.length -1];
    console.log(fileExtension);
    axios.post(`${apiUrl}/file/new`,{name:fileName,parent:id,type:fileExtension},{
      headers:{
        Authorization:`Bearer ${token}`
      }
    }).then(res=>{
      console.log(res);
      if(res.status === 200){
        fetchRepo();
      }
    }).catch(e=> console.log(e));
    setNewFileWindow(false);
    setFileName("");
  };
  const handleFileClick = (file) => {
    setSelectedFile(file);
    console.log("File:",file);
    setLanguage(extensionMap[file.type]);
    setSelectedFileContent(file.content);
    console.log(`File selected: ${file.name}`);
  };

  const [fileName, setFileName] = useState("");
  const [newFileWindow, setNewFileWindow] = useState(false);
  return (
    <div className="w-[15vw] flex flex-col">
      <div
        onClick={() => setMainRepo(!mainRepo)}
        className="flex justify-between p-[1vw]">
        <div>{repo.name}</div>
        <button onClick={handleAddFile} className="border">
          Add file
        </button>
      </div>
      {repo &&
        repo.map((file) => (
          <div key={file._id} onClick={()=>handleFileClick(file)} className="border border-gray-100 hover:bg-slate-400 hover:cursor-pointer transition flex items-center">
            <FileIcons extension = {`.${file.type}`}/>{file.name}
          </div>
        ))}
        {
      newFileWindow && <div className="absolute top-[30vh]">
        
        <input
          type="text"
          value={fileName}
          name="name"
          onChange={(e) => {
            setFileName(e.target.value);
          }}
          className="bg-slate-600"
        />
        <br />
        <button onClick={() => setNewFileWindow(false)}>Cancel</button>
        <button onClick={addFile}>Create</button>
      </div>
}
    </div>
  );
};

export default FileBar;
