import React, { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { Button, IconButton } from "@mui/material";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useNavigate, Route, useParams } from "react-router-dom";
import Meeting from "./Meeting";
import AppContext from "../../context/Context";

const MeetingLandingPage = () => {
  const { mediaOptions, setMediaOptions } = useContext(AppContext);
  const [userStream, setUserStream] = useState(null);
  const {id} = useParams();
  const [audio, setAudio] = useState(mediaOptions.audio);
  const [video, setVideo] = useState(mediaOptions.video);
  const manageStream = (a, v) => {
    setVideo(v);
    setAudio(a);
    setMediaOptions({ audio: a, video: v });
    if (userStream) {
      userStream.getAudioTracks().forEach((track) => (track.enabled = a));
      userStream.getVideoTracks().forEach((track) => (track.enabled = v));
    }
  };
  const videoRef = useRef();
  const getMediaStream = async () => {
    try {
      if (userStream) {
        userStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });

      setUserStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };
  
  const navigate = useNavigate();
  useEffect(() => {
    getMediaStream();

  }, []);
  return (
    <div>
      <div
        style={{
          display: "flex",
          padding: "5vh 10vh",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <div>
          <video ref={videoRef} autoPlay />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2vw",
              marginTop: "2vh",
            }}>
            <IconButton
              onClick={() => manageStream(!audio, video)}
              style={{ backgroundColor: audio ? "white" : "red" }}>
              {audio ? <Mic /> : <MicOff />}
            </IconButton>
            <IconButton
              onClick={() => manageStream(audio, !video)}
              style={{ backgroundColor: video ? "white" : "red" }}>
              {video ? <Video /> : <VideoOff />}
            </IconButton>
          </div>
        </div>
        <div
          style={{ width: "50vw", display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            style={{ borderRadius: "3vh", width: "10vw", height: "7vh" }}
            onClick={()=>navigate(`/meet/${id}`)}>
            Join now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingLandingPage;
