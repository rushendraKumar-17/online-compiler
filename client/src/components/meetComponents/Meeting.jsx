import { useContext, useEffect, useRef, useState, useCallback } from "react";
import Controls from "./Controls";
import AppContext from "../../context/Context";
import ChatWindow from "./ChatWindow";
import Editor from "./Editor.jsx";
import { useParams } from "react-router-dom";
import peer from "../services/PeerService.jsx";
import { useSocket } from "../../context/SocketProvider.jsx";
import { Button } from "@mui/material";
// import Options from "./Options.jsx";
const App = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  const { id } = useParams();
  const { mediaOptions, setMediaOptions } = useContext(AppContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [remoteUserSocket, setRemoteUserSocket] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const changeCode = (c) => {
    setCode(c);
  };
  const changeLanguage = (l) => {
    setLanguage(l);
  };
  const addMessage = (message, time, sender) => {
    setMessages((prev) => [...prev, { message, time, sender }]);
  };
  const openEditor = () => {
    setEditorOpen(true);
  };
  const closeEditor = () => {
    setEditorOpen(false);
  };
  const openChat = () => {
    setChatOpen(true);
  };
  const closeChat = () => {
    setChatOpen(false);
  };
  const [userStream, setUserStream] = useState();
  const [remoteStream, setRemoteStream] = useState(null);

  const joinMeet = () => {
    socket.emit("join-room", { id });
    console.log("Joining room");
  };
  useEffect(() => {
    getStream();
    if (socket) {
      socket.on("codeChange", handleCodeChangeEvent);
      socket.on("change-language", handleLanguageChangeEvent);
      socket.on("message", addMessage);
    }
    return () => {
      socket.off("codeChange", handleCodeChangeEvent);
      socket.on("change-language", handleLanguageChangeEvent);
      socket.off("message", addMessage);
    };
  }, [socket]);
  const handleCodeChangeEvent = (newCode) => {
    console.log(newCode);
    console.log("Got code change event");
    changeCode(newCode.code);
  };
  const handleLanguageChangeEvent = (language) => {
    console.log("Got language change", language);
    changeLanguage(language);
  };
  useEffect(() => {
    socket.on("answer", handleAnswer);
    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("nego-needed", handleNegotiationIncoming);
    socket.on("nego-final", handleNegotiationFinal);
    // socket.on("ice-candidate",handleIceCandidateReceive);
    return () => {
      socket.off("answer", handleAnswer);
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("nego-needed", handleNegotiationIncoming);
      socket.off("nego-final", handleNegotiationFinal);

      // socket.off("ice-candidate",handleIceCandidateReceive);
    };
  }, [socket]);
  const handleNegotiationIncoming = async ({ from, offer }) => {
    console.log("Nego-incoming");
    const ans = await peer.getAnswer(offer);
    socket.emit("nego-done", { to: from, answer: ans });
  };
  const handleNegotiationFinal = useCallback(async ({ answer }) => {
    console.log("Nego-done");
    console.log(answer);
    await peer.setLocalDescription(answer);
  }, []);
  useEffect(() => {
    peer.peer.addEventListener("track", handleTrackEvent);
    peer.peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.peer.removeEventListener("track", handleTrackEvent);
      peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, []);

  const handleNegotiation = useCallback(async () => {
    console.log("Oops...nego needed");
    const offer = await peer.getOffer();
    socket.emit("nego-needed", { offer, to: remoteUserSocket });
  }, []);
  const handleTrackEvent = (e) => {
    console.log("I am getting stream", e);
    const stream = e.streams;
    console.log("Remote Stream", stream[0]);
    setRemoteStream(stream[0]);
    if (!remoteVideoRef.current.srcObject) {
      console.log("Setting srcObject");
      remoteVideoRef.current.srcObject = stream[0];
    }
  };
  const disconnectCall = () => {
    // Close all peer connections

    //

    // Stop user's media stream
    if (userStream) {
      userStream.getTracks().forEach((track) => track.stop());
      setUserStream(undefined);
    }

    // Remove remote video elements
    Object.values(remoteVideoRefs.current).forEach((videoEl) => {
      if (videoEl && videoEl.parentNode) {
        videoEl.parentNode.removeChild(videoEl);
      }
    });

    socket?.emit("leave-room", { roomId });

    socket?.disconnect();
  };
  const handleAnswer = useCallback(async ({ answer, from }) => {
    console.log("Got answer from ", from);
    await peer.setLocalDescription(answer);
    if (userStream) {
      for (const track of userStream.getTracks()) {
        console.log("sending tracks");
        peer.peer.addTrack(track, userStream);
      }
    }
  }, []);
  const handleUserJoined = useCallback(async ({ newUserId }) => {
    console.log("User joined:", newUserId);
    setRemoteUserSocket(newUserId);
    const offer = await peer.getOffer();
    console.log("Created offer", offer);
    socket.emit("offer", { offer, to: newUserId });
  }, []);
  const handleOffer = useCallback(async ({ offer, from }) => {
    console.log("Offer from ", from, offer);
    setRemoteUserSocket(from);

    const ans = await peer.getAnswer(offer);

    socket.emit("answer", { answer: ans, to: from });
  }, []);

  // Manage user media stream settings
  const manageStream = (a, v) => {
    setVideo(v);
    setAudio(a);
    setMediaOptions({ video: v, audio: a });
    if (userStream) {
      userStream.getAudioTracks().forEach((track) => (track.enabled = a));
      userStream.getVideoTracks().forEach((track) => (track.enabled = v));
    }
  };

  // Get user's media stream
  const getStream = async () => {
    try {
      if (userStream) {
        userStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setUserStream(stream);
      console.log("My stream", stream);
      // sendStream(stream);
      for (const track of stream.getTracks()) {
        console.log("sending tracks");
        peer.peer.addTrack(track, stream);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        // alignItems: "baseline",
      }}
    >
      <div>
        <Button onClick={() => joinMeet()}>Start</Button>
        {editorOpen && (
          <Editor
            socket={socket}
            id={id}
            closeEditor={closeEditor}
            changeCode={changeCode}
            changeLanguage={changeLanguage}
            code={code}
            language={language}
          />
        )}
      </div>
      <div
        style={{
          width: chatOpen ? (editorOpen ? "40vw" : "80vw") : "100vw",
          padding: "3vh",
          overflowX: "hidden",
        }}
      >
        <div style={{ width: "30vw", height: "40vh", position: "relative" }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "3vh",
            }}
          />
          <p
            style={{
              position: "absolute",
              bottom: "2vh",
              left: "2vh",
              zIndex: 100,
              color: "white",
            }}
          >
            Me
          </p>
        </div>
        <div
          id="remote-videos"
          style={{ display: "flex", flexWrap: "wrap", overflow: "hidden" }}
        ></div>
        <div style={{ width: "30vw", height: "40vh", position: "relative" }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "30vw",
              height: "20vw",
            }}
          ></video>
          <p
            style={{
              position: "absolute",
              bottom: "2vh",
              left: "2vh",
              zIndex: 100,
              color: "white",
            }}
          >
            You
          </p>
        </div>
      </div>
      <div>
        {chatOpen && (
          <ChatWindow
            closeChat={closeChat}
            socket={socket}
            roomId={id}
            messages={messages}
            addMessage={addMessage}
          />
        )}
      </div>
      <Controls
        manageStream={manageStream}
        disconnectCall={disconnectCall}
        openChatWindow={openChat}
        openEditor={openEditor}
      />
    </div>
  );
};

export default App;
