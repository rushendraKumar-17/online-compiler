import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../../context/Context";
import FileBar from "./FileBar";
import MonacoCodeEditor from "./MonacoCodeEditor";
import TopBar from "./TopBar";
import Terminal from "./Terminal";
import extensionMap from "./extensionMap";
import {io} from "socket.io-client";
import { useSocket } from "../../context/SocketProvider";
// const socket = io("http://localhost:8000");
const SharingWindow = () => {
  const socket = useSocket();
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [terminal, setTerminal] = useState(false);
  const { apiUrl } = useContext(AppContext);
  const [fileBar, setFileBar] = useState(true);
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem("token");
  const [editorWidth, setEditorWidth] = useState("80vw");
  const [language, setLanguage] = useState();
  const [execResult, setExecResult] = useState();

  const fetchRepo = () => {
    axios
      .get(`${apiUrl}/repo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRepo(res.data);
        console.log(res);
      })
      .catch((e) => console.log(e));
  };
  useEffect(() => {
    fetchRepo();
  }, []);

  const handleFileSelection = (file)=>{
    setSelectedFile(file);
  }
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      console.log("Content:",selectedFileContent);
      console.log(selectedFile);
      console.log(selectedFile._id);
      axios
        .post(
          `${apiUrl}/code/save/${selectedFile._id}`,
          {
            code: selectedFileContent,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          console.log(res);
          fetchRepo();
        })
        .catch((e) => console.log(e));
      console.log("Saving the code");
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleCodeChange = (e) => {
    setSelectedFileContent(e);
    console.log(selectedFileContent);
    console.log(e);
    // socket.emit("code-change",{selectedFile,selectedFileContent});
  };

  const closeTerminal = () => {
    setTerminal(false);
  };
  const [progress,setProgress] = useState(true);
  const enableShare = false;
  
  const handleRun = async () => {
    setTerminal(true);
    setProgress(true);
    console.log(selectedFileContent);
    try {
      console.log(language);
      const result = await axios.post(
        `${apiUrl}/code/run`,
        {
          code: selectedFileContent,
          language: language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProgress(false);
      console.log(result.data.output);
      setExecResult({ result: result.data.output, error: false });
    } catch (e) {
      console.log(e);
      setProgress(false);
      setExecResult({ result: e.response.data.error, error: true });
    }
  };
  return (
    <div className="flex flex-col">
      <TopBar props={{ handleRun, enableShare }} />
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
              extensionMap,
              handleFileSelection
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
                handleCodeChange,
              }}
            />
          ) : (
            <div className="text-center">Online code Editor</div>
          )}
          {terminal && (
            <Terminal props={{ terminal, closeTerminal, execResult,progress }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SharingWindow;
