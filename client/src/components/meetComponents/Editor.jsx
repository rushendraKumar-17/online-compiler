import React, { useContext, useEffect, useState } from "react";
import { Play, PanelRight } from "lucide-react";
import { Button, Typography } from "@mui/material";
import MonacoEditor from "react-monaco-editor";
import { useParams } from "react-router";
import { X } from "lucide-react";
import axios from "axios";
import Terminal from "./Terminal";
import AppContext from "../../context/Context";
const Editor = ({ socket, id,closeEditor,code,changeCode,language,changeLanguage }) => {
  // const [code, setCode] = useState("");
  const {apiUrl} = useContext(AppContext);
  const [terminalOpened, setTerminalOpened] = useState(false);
  const [fileBarOpen, setFileBarOpen] = useState(false);
  const [compileState, setCompileState] = useState("compiling");
  const [result, setResult] = useState("");
  const [errorOccured, setErrorOccured] = useState(false);
  const handleChangeLanguage = (e) => {
    const languageChosen = e.target.value;
    console.log(languageChosen);
    socket.emit("change-language",{language:languageChosen,id});
    changeLanguage(languageChosen);
    if (languageChosen === "java") {
      console.log("Java chosen");
      changeCode(
        "//Create a class with name Temp and then write your code\n" + code
      );
    }
  };
  const handleRunCode = async () => {
    setResult("");
    setErrorOccured(false);
    setCompileState("compiling");
    console.log(code);
    setTerminalOpened(true);

    try {
      const response = await axios.post(`${apiUrl}/code/run`, {
        code,
        language,
      });
      setCompileState("compiled");
      if (response.status == 200) {
        setErrorOccured(false);
        setResult(response.data.output);
      }
    } catch (e) {
      setCompileState("compiled");

      setErrorOccured(true);
      setResult(e.response.data.error);
      console.log(e.response.data.error);
    }
  };
  const options = {
    selectOnLineNumbers: true,
    fontSize: 14,
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    
  };

  
  return (
    <div style={{ resize: "horizontal" }}>
      <div
        style={{
          backgroundColor: "#1E1E1E",
          width: "40vw",
          display: "flex",
          justifyContent: "right",
          padding: "1vh 2vw",
          gap: "2vw",
        }}
      >
        <select name="language" id="language" onChange={handleChangeLanguage} value={language}>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
        </select>
        <Button
          style={{ color: "white", backgroundColor: "green" }}
          onClick={handleRunCode}
        >
          <Play />
          Run
        </Button>
        <Button onClick={()=>closeEditor()}><X /></Button>
      </div>
      <MonacoEditor
        height="90vh"
        width="40vw"
        language={language}
        theme="vs-dark"
        value={code}
        options={options}
        onChange={(newValue) => {
          console.log(newValue)
          changeCode(newValue);
          socket.emit("codeChange", { code:newValue, id });
          console.log("Code change detected");
        }}
      />

      {/* terminal */}
      {terminalOpened && (
        <div
          style={{
            width: "40vw",
            height: "40vh",
            position: "absolute",
            bottom: 0,
            left: 0,
            color: "white",
            backgroundColor: "black",
            padding:"2vh"
          }}
        >
          <Button style={{position:"absolute",right:0}} onClick={()=>setTerminalOpened(false)}><X /></Button>
          {compileState === "compiling" ? (
            <Typography>Compilation in progress...</Typography>
          ) : (
            <div>
              {errorOccured ? (
                <Typography>Compilation Failed</Typography>
              ) : (
                <Typography>Compilation Successful</Typography>
              )}
              <Typography>{result}</Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Editor;
