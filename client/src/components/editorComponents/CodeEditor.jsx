import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";
import FileBar from "./FileBar";
import MonacoCodeEditor from "./MonacoCodeEditor";
import TopBar from "./TopBar";
import Terminal from "./Terminal";
import AppContext from "../../context/Context.jsx";
import ShareWindow from "./ShareWindow";
import { File, X } from "lucide-react";
const CodeEditor = () => {
  const token = localStorage.getItem("token");
  const extensionMap = {
    "py":"python",
    "java":"java",
    "cpp":"cpp",
    "js":"javascript",
    "txt":"text"
  }
  const {apiUrl} = useContext(AppContext);
  const [shareWindow,setShareWindow] = useState(false);
  const [editorWidth, setEditorWidth] = useState("90vw");
  const { id } = useParams();
  const [fileBar, setFileBar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [terminal, setTerminal] = useState();
  const [repo,setRepo] = useState();
  const [language, setLanguage] = useState();
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [execResult,setExecResult] = useState();
  const setSelectedFileFn = (file) => {
    console.log("select file function called");
    setSelectedFile(file);
    console.log("File selected:", file);
  };
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      console.log(selectedFile);
      axios
        .post(`${apiUrl}/code/save/${selectedFile._id}`, {
          code: selectedFileContent,
        },{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })
        .then((res) => {
          console.log(res);
        })
        .catch((e) => console.log(e));
        repo.forEach((file)=>{
          console.log(file.name)
          if(file.name === selectedFile.name){
            
            file.content = selectedFileContent;
          }
        })
      console.log("Saving the code");
    }
  };
  const handleCodeChange = (e)=>{
 
    console.log(selectedFileContent);
    console.log(e);
    console.log(repo);
    setRepo(repo.map(file=>{
      if(file.name === selectedFile.name){
        file.content = e;
        
      }
      return file;
    }))
    setSelectedFileContent(e);
    console.log(selectedFileContent)
    // socket.emit("code-change",{selectedFile,selectedFileContent});
  }
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchRepo = ()=>{
    axios
    .get(`${apiUrl}/repo/${id}`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then((res) => {
      setRepo(res.data);
      // console.log(res.data);

    })
    .catch((e) => console.log(e));
  }
  useEffect(() => {
    fetchRepo();
  }, []);

  const [progress,setProgress] = useState(false);
  const handleRun = async () => {
    // console.log(selectedFileContent);
    setProgress(true);
    try{
      // console.log(language);
    const result = await axios
    .post(`${apiUrl}/code/run`, {
      code: selectedFileContent,
      language: language,
    },{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    setProgress(false);
    // console.log(result.data.output);
    setExecResult({result:result.data.output,error:false});
  }catch(e){
    // console.log(e);
    setProgress(false);
    setExecResult({result:e.response.data.error,error:true});
  }
    
    setTerminal(true);
  };
  
  const closeTerminal = ()=>{
    setTerminal(false);
  }
  const handleFileSelection = (file)=>{
    console.log(file);
    setSelectedFile(file);
    // console.log("File:", file);
    setLanguage(extensionMap[file.type]);
    setSelectedFileContent(file.content);
    // console.log(`File selected: ${file.name}`);
  }
  
  const toggleShareWindow = () =>{
    setShareWindow(!shareWindow);
  }
  const enableShare = true;
  return (
    <div className="flex flex-col">
      
      <TopBar props = {{handleRun,toggleShareWindow,enableShare}}/>
      <div className="flex border border-black bg-black text-white">
        <div
          className={`h-[86vh] w-[3vw] bg-gray-700 transition-all duration-300`}>
          <div
            className="cursor-pointer p-2 bg-gray-600 hover:bg-gray-500"
            onClick={() => {
              setFileBar(!fileBar);
              setEditorWidth("100%");
              // console.log(editorWidth);
            }}>
            <File />
          </div>
        </div>
        {fileBar && (
          <FileBar
            props={{
              selectedFile,
              setSelectedFileFn,
              setSelectedFileContent,
              id,
              repo,
              fetchRepo,
              setLanguage,
              extensionMap,
              handleFileSelection
            }}
          />
        )}
        <div
          className={`h-[86vh] ${
            fileBar ? "w-[85vw]" : "w-[95vw]"
          } bg-gray-800`}>
          {selectedFile ? (
            <MonacoCodeEditor
              props={{
                width: editorWidth,
                language,
                selectedFileContent,
                handleCodeChange
              }}
            />
          ) : (
            <div className="text-center">Online code Editor</div>
          )}
          {
            shareWindow && <ShareWindow props={{toggleShareWindow,id}}/>
          }
          {terminal && <Terminal props={{terminal,closeTerminal,execResult,progress}}/>}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
