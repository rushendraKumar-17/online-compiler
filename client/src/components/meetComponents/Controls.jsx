import { useEffect, useState, useRef } from "react";
import React from "react";
import { Popper, Paper, Typography, Button } from "@mui/material";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Unplug,
  EllipsisVertical,
  MonitorUp,
  MonitorX,
} from "lucide-react";
const Controls = (props) => {
  const { openChatWindow, openEditor,handleShareScreen } = props;
  const manageStream = props.manageStream;
  const disconnectCall = props.disconnectCall;
  const [video, setVideo] = useState(true);
  const anchorRef = useRef(null);
  const [optionsWindow, setOptionsWindow] = useState(false);
  const [audio, setAudio] = useState(false);
  useEffect(() => {
    console.log("Changing state", audio, video);
    manageStream(audio, video);
  }, [audio, video]);
  return (
    <div
      className=""
      style={{
        position: "absolute",
        bottom: 10,
        left: "41%",
        display: "flex",
        gap: "1.4vw",
      }}
    >
      <Button
        onClick={() => setAudio(!audio)}
        style={{
          borderRadius: "4vh",
          width: "2vw",
          height: "4vw",
          backgroundColor: audio ? "transparent" : "red",
        }}
      >
        {audio ? <Mic /> : <MicOff />}
      </Button>
      <Button
        onClick={() => setVideo(!video)}
        className=""
        style={{
          borderRadius: "2vh",
          backgroundColor: video ? "transparent" : "red",
          width: "2vw",
          height: "4vw",
        }}
      >
        {video ? <Video /> : <VideoOff />}
      </Button>
      <Button
        style={{
          borderRadius: "2vh",
          width: "2vw",
          height: "4vw",
        }}
        onClick={handleShareScreen}
      >
        <MonitorUp/>
      </Button>
      <Button
        onClick={disconnectCall}
        style={{
          backgroundColor: "red",
          borderRadius: "3vh",
          width: "3.5vw",
          height: "4vw",
        }}
      >
        <Unplug />
      </Button>
      <Button
        ref={anchorRef}
        onClick={() => setOptionsWindow(!optionsWindow)}
        style={{
          borderRadius: "5vh",
          width: "4vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: optionsWindow ? "grey" : "transparent",
        }}
      >
        <EllipsisVertical />
      </Button>
      {optionsWindow && (
        <Popper
          open={true}
          anchorEl={anchorRef.current}
          placement="top"
          disablePortal={false}
          modifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 10], // moves it slightly away from the button
              },
            },
          ]}
        >
          <Paper
            elevation={3}
            style={{
              padding: "10px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* <Typography>This is a Popper</Typography> */}
            <Button
              onClick={() => {
                openChatWindow();
                setOptionsWindow(false);
              }}
            >
              In-call messages
            </Button>
            <Button
              onClick={() => {
                openEditor();
                setOptionsWindow(false);
              }}
            >
              Code Editor
            </Button>
          </Paper>
        </Popper>
      )}
    </div>
  );
};

export default Controls;
