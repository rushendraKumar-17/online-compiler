import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";
// import { io } from "socket.io-client";
import FileBar from "./FileBar";
import MonacoCodeEditor from "./MonacoCodeEditor";
import TopBar from "./TopBar";
import Terminal from "./Terminal";
import AppContext from "../context/Context";
import ShareWindow from "./ShareWindow";
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
  const [editorWidth, setEditorWidth] = useState("80vw");
  const { id } = useParams();
  const [fileBar, setFileBar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [terminal, setTerminal] = useState();
  const [repo,setRepo] = useState();
  const [language, setLanguage] = useState();
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [execResult,setExecResult] = useState();
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      console.log(selectedFile);
      console.log(selectedFile._id);
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
      console.log("Saving the code");
    }
  };
  const handleCodeChange = (e)=>{
 
    setSelectedFileContent(e);
    console.log(selectedFileContent);
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
      console.log(res);

    })
    .catch((e) => console.log(e));
  }
  useEffect(() => {
    fetchRepo();
    
  }, []);


  const handleRun = async () => {
    console.log(selectedFileContent);
    try{
      console.log(language);
    const result = await axios
    .post(`${apiUrl}/code/run`, {
      code: selectedFileContent,
      language: language,
    },{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    console.log(result.data.output);
    setExecResult({result:result.data.output,error:false});
  }catch(e){
    console.log(e);
    setExecResult({result:e.response.data.error,error:true});
  }
    
    setTerminal(true);
  };
  
  const closeTerminal = ()=>{
    setTerminal(false);
  }

  const handleShare = async()=>{
    
  }
  const toggleShareWindow = () =>{
    setShareWindow(!shareWindow);
  }
  return (
    <div className="flex flex-col">
      
      <TopBar props = {{handleRun,toggleShareWindow}}/>
      <div className="flex border border-black bg-black text-white">
        <div
          className={`h-[96vh] w-[4vw] bg-gray-700 transition-all duration-300`}>
          <div
            className="cursor-pointer p-2 bg-gray-600 hover:bg-gray-500"
            onClick={() => {
              setFileBar(!fileBar);
              setEditorWidth(fileBar ? "70vw" : "80vw");
              console.log(editorWidth);
            }}>
            Files
          </div>
        </div>
        {fileBar && (
          <FileBar
            props={{
              selectedFile,
              setSelectedFile,
              setSelectedFileContent,
              id,
              repo,
              fetchRepo,
              setLanguage,
              extensionMap
            }}
          />
        )}
        <div
          className={`h-[96vh] ${
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
          {terminal && <Terminal props={{terminal,closeTerminal,execResult}}/>}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
