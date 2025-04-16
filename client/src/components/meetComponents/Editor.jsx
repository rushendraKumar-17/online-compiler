import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@mui/material";
import MonacoEditor from "react-monaco-editor";
import {} from 'react-router'
const Editor = ({socket}) => {
  const [code,setCode] = useState("");
  const {id} = useParams();
  const [language,setLanguage] = useState("python");
  const [terminalOpened,setTerminalOpend] = useState(false);
  const options = {
    selectOnLineNumbers: true,
    fontSize: 14,
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
    scrollBeyondLastLine: false,
  }
  useEffect(()=>{
    socket?.on("codeChange",(newCode)=>{
      console.log("Got code change event");
      setCode(newCode);
    });
    return () => {
      socket?.off("codeChange");
    }
  },[socket]);
  return (
    <div style={{ resize: "horizontal" }}>
      <div
        style={{
          backgroundColor: "#1E1E1E",
          width: "40vw",
          display: "flex",
          justifyContent: "right",
          padding: "1vh 2vw",
        }}>
        <Button style={{ color: "white", backgroundColor: "green" }}>
          <Play />
          Run
        </Button>
      </div>
      <MonacoEditor
        height="90vh"
        width="40vw"
        language={language}
        theme="vs-dark"
        value={code}
        options={options}
        onChange={(newValue) => {
          setCode(newValue);
          socket.emit("codeChange", code);
          console.log("Code change detected");
        }
        }
      />

        {/* terminal */}
      {
        terminalOpened && {
            
        }
      }
    </div>
  );
};

export default Editor;
