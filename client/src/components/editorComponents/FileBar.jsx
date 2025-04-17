import React, { useContext, useState } from "react";
import axios from "axios";
import FileIcons from "./FileIcons";
import { Button } from "@mui/material";
import AppContext from "../../context/Context";
const FileBar = ({ props }) => {
  const {
    selectedFile,
    setSelectedFileFn,
    setSelectedFileContent,
    id,
    repo,
    fetchRepo,
    setLanguage,
    extensionMap,
    handleFileSelection,
  } = props;

  const [mainRepo, setMainRepo] = useState(false);
  const { apiUrl } = useContext(AppContext);
  const token = localStorage.getItem("token");
  const handleAddFile = (e) => {
    e.stopPropagation();
    setNewFileWindow(true);
    console.log("Adding file");
  };
  const addFile = async () => {
    const file = fileName.split(".");
    const fileExtension = file[file.length - 1];
    console.log(fileExtension);
    axios
      .post(
        `${apiUrl}/file/new`,
        { name: fileName, parent: id, type: fileExtension },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          fetchRepo();
        }
      })
      .catch((e) => console.log(e));
    setNewFileWindow(false);
    setFileName("");
  };
  const handleFileClick = async(file) => {
    handleFileSelection(file);
    setSelectedFileFn(file);
  };

  const [fileName, setFileName] = useState("");
  const [newFileWindow, setNewFileWindow] = useState(false);
  return (
    <div>
      {repo && (
        <div className="w-[15vw] flex flex-col">
          <div
            onClick={() => setMainRepo(!mainRepo)}
            className="flex justify-between p-[1vw]">
            <div>{repo.name}</div>
            <Button variant="primary" onClick={handleAddFile} className="border">
              Add file
            </Button>
          </div>
          {repo &&
            repo.map((file) => (
              <div
                key={file._id}
                onClick={() => handleFileClick(file)}
                className="border border-gray-100 hover:bg-slate-400 hover:cursor-pointer transition flex items-center">
                <FileIcons extension={`.${file.type}`} />
                {file.name}
              </div>
            ))}
          {newFileWindow && (
            <div className="absolute top-[30vh] w-[14vw] p-[1vw]" style={{ zIndex: 100,border:"1px solid white" }}>
              
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
              <Button onClick={() => setNewFileWindow(false)}>Cancel</Button>
              <Button onClick={addFile}>Create</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileBar;
