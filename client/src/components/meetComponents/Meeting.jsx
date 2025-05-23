import { useContext, useEffect, useRef, useState, useCallback } from "react";
import Controls from "./Controls";
import AppContext from "../../context/Context";
import ChatWindow from "./ChatWindow";
import Editor from "./Editor.jsx";
import { useNavigate, useParams } from "react-router-dom";
import peer from "../services/PeerService.jsx";
import { useSocket } from "../../context/SocketProvider.jsx";
import { Button } from "@mui/material";
// import Options from "./Options.jsx";
const App = () => {
  const socket = useSocket();
  const remoteStreamRef = useRef(new MediaStream());
  const sharingScreenRef = useRef();
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [screenShareStream, setScreenShareStream] = useState(null);
  const { mediaOptions, setMediaOptions, user } = useContext(AppContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [video, setVideo] = useState(mediaOptions.video);
  const [audio, setAudio] = useState(mediaOptions.audio);
  const [chatOpen, setChatOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [remoteUserSocket, setRemoteUserSocket] = useState(null);
  const [remoteUserName, setRemoteUserName] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [userJoined, setUserJoined] = useState(false);
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
    socket.emit("join-room", { id, name: user.name });
    setUserJoined(true);
    console.log("Joining room");
  };
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    getStream();
    if (socket) {
      socket.on("codeChange", handleCodeChangeEvent);
      socket.on("change-language", handleLanguageChangeEvent);
      socket.on("message", addMessage);
    }
    return () => {
      socket.off("codeChange", handleCodeChangeEvent);
      socket.off("change-language", handleLanguageChangeEvent);
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
    console.log("Remote Stream track", e.track);

    setRemoteStream(stream[0]);
    remoteStreamRef.current.addTrack(e.track);
    if (remoteStreamRef) console.log("Setting srcObject");
    if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
      console.log("Setting srcObject to remote stream");
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  };
  const handleShareScreen = async () => {
    if (!screenShareStream) {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      setScreenShareStream(screen);
      console.log("Sharing screen");
      sharingScreenRef.current.srcObject = screen;
      screen.getTracks().forEach((track) => {
        peer.peer.addTrack(track);
      });
      screen.getVideoTracks()[0].onended = () => {
        stopSharingScreen();
      };
    } else {
      //to be done to stop sharing screen
    }
  };
  const stopSharingScreen = async () => {
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
      setScreenShareStream(null);

      console.log("Stopped screen sharing");
      // Optionally you can renegotiate or remove tracks from peer
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
    // if (userStream) {
    //   for (const track of userStream.getTracks()) {
    //     console.log("sending tracks");
    //     peer.peer.addTrack(track, userStream);
    //   }
    // }
  }, []);
  const handleUserJoined = useCallback(async ({ newUserId, name }) => {
    console.log("User joined:", newUserId);
    setRemoteUserSocket(newUserId);
    setRemoteUserName(name);
    const offer = await peer.getOffer();
    console.log("Created offer", offer);
    socket.emit("offer", { offer, to: newUserId, name: user.name });
  }, []);
  const handleOffer = useCallback(async ({ offer, from, name }) => {
    console.log("Offer from ", from, offer);
    setRemoteUserName(name);
    setRemoteUserSocket(from);

    const ans = await peer.getAnswer(offer);

    socket.emit("answer", { answer: ans, to: from });
  }, []);

  // Manage user media stream settings
  const manageStream = (a, v) => {
    const videoToggled = v !== video;
    const audioToggled = a !== audio;

    // Update state
    setVideo(v);
    setAudio(a);
    setMediaOptions({ video: v, audio: a });

    console.log(v, a);

    if (userStream) {
        // Handle audio tracks
        if (userStream.getAudioTracks().length > 0) {
            userStream.getAudioTracks().forEach((track) => (track.enabled = a));
        }

        // Handle video tracks
        if (userStream.getVideoTracks().length > 0) {
            userStream.getVideoTracks().forEach((track) => (track.enabled = v));
        }

        if(localVideoRef.current) {
            localVideoRef.current.srcObject = userStream;
        }
        // Only replace the track if toggled
        if (videoToggled || audioToggled) {
            peer.peer.getSenders().forEach((sender) => {
                console.log("Sender track", sender.track);
                console.log("Sender track kind", sender.track.kind);

                if (sender.track.kind === "video" && videoToggled) {
                    // Replace video track if it's toggled
                    console.log("Replacing video track", userStream.getVideoTracks()[0]);
                    if (userStream.getVideoTracks().length > 0) {
                      const newVideoTrack = userStream.getVideoTracks()[0];
                        sender.replaceTrack(newVideoTrack);
                        if(localVideoRef.current && newVideoTrack) {
                          localVideoRef.current.srcObject = userStream;
                      }
                      }
                      

                }

                if (sender.track.kind === "audio" && audioToggled) {
                    // Replace audio track if it's toggled
                    if (userStream.getAudioTracks().length > 0) {
                        sender.replaceTrack(userStream.getAudioTracks()[0]);
                    }
                }
            });
        }
    }
};


  // Get user's media stream
  const getStream = async () => {
    try {
      if (userStream) {
        userStream.getTracks().forEach((track) => track.stop());
      }
      let stream = null;
      if (video || audio) {
        stream = await navigator.mediaDevices.getUserMedia({
          video,
          audio,
        });
        console.log("My stream", stream);
        if (peer.peer.getSenders().length === 0) {
          for (const track of stream.getTracks()) {
            console.log("sending tracks", track);
            peer.peer.addTrack(track, stream);
          }
        } else {
          console.log("Tracks already added...");
        }
        // sendStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        setUserStream(null);
      }

      setUserStream(stream);
      joinMeet();
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
        {/* {!userJoined && <Button onClick={() => joinMeet()}>Start</Button>} */}
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
          height: "80vh",
          overflowX: "hidden",
          overflowY: "scroll",
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
      display: video ? "block" : "none",  // Toggle visibility
    }}
    srcObject={video ? userStream : null}  // Only set srcObject if video is enabled
  />
  
  {/* Fallback UI when video is off */}
  {!video && (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        borderRadius: "3vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: "white",
          backgroundColor: "green",
          textTransform: "capitalize",
          borderRadius: "50%",
          width: "10vw",
          height: "10vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "5vw",
        }}
      >
        {user.name.charAt(0)}
      </div>
    </div>
  )}
  
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
          style={{
            width: "30vw",
            height: "40vh",
            position: "relative",
          }}
        >
         
          <video
            ref={remoteVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "3vh",
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
            {remoteUserName}
          </p>
        </div>
        <video
          autoPlay
          playsInline
          ref={sharingScreenRef}
          style={{
            width: "10vw",
            height: "10vw",
            borderRadius: "3vh",
          }}
        ></video>
      </div>
      <div>
        {chatOpen && (
          <ChatWindow
            closeChat={closeChat}
            socket={socket}
            roomId={id}
            messages={messages}
            addMessage={addMessage}
            user={user}
          />
        )}
      </div>
      <Controls
        manageStream={manageStream}
        disconnectCall={disconnectCall}
        openChatWindow={openChat}
        openEditor={openEditor}
        handleShareScreen={handleShareScreen}
      />
    </div>
  );
};

export default App;
