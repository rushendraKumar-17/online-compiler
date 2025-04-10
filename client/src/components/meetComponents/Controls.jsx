import { useEffect, useState,useRef } from "react";
import React from "react";
import { Mic, MicOff, Video, VideoOff, Unplug, EllipsisVertical } from "lucide-react";
const Controls = (props) => {
  const {openOptionsWindow} = props;
  const manageStream = props.manageStream;
  const disconnectCall = props.disconnectCall;
  const [video, setVideo] = useState(true);
  const anchorRef = useRef(null);
  const [optionsWindow,setOptionsWindow] = useState(true);
  const [audio, setAudio] = useState(true);
  useEffect(() => {
    console.log("Changing state", audio, video);
    manageStream(audio, video);
  }, [audio, video]);
  return (
    <div className="" style={{ position: "absolute", bottom: 10, left: "45%" }}>
      <button onClick={() => setAudio(!audio)} className="">
        {audio ? <Mic /> : <MicOff />}
      </button>
      <button onClick={() => setVideo(!video)} className="">
        {video ? <Video /> : <VideoOff />}
      </button>
      <button onClick={disconnectCall}>
        <Unplug />
      </button>
      <button ref={anchorRef}>
        <EllipsisVertical />
      </button>
      {
        optionsWindow && 
      (
        <Popper
        open={true}
        anchorEl={anchorRef.current}
        placement="top"
        disablePortal={false}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10], // moves it slightly away from the button
            },
          },
        ]}
      >
        <Paper elevation={3} style={{ padding: '10px' }}>
          <Typography>This is a Popper</Typography>
        </Paper>
      </Popper>
      )
    }
    </div>
  );
};

export default Controls;
