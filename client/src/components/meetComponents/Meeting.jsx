import { useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Controls from "./Controls";
import AppContext from "../../context/Context";

const App = () => {
  
  const {mediaOptions,setMediaOptions} = useContext(AppContext);
  const videoRef = useRef(null);
  const [video, setVideo] = useState(mediaOptions.video);
  const [audio, setAudio] = useState(mediaOptions.audio);
  const roomId = "1"; 
  const [userStream, setUserStream] = useState();
  const [peers, setPeers] = useState({});
  const socketRef = useRef(null);
  const peerRefs = useRef({});
  const remoteVideoRefs = useRef({});
  useEffect(()=>{
    handleJoin();
  },[])
  const disconnectCall = () => {
    // Close all peer connections
    Object.values(peerRefs.current).forEach((peer) => {
      peer.close();
    });
  
    // Clear peer connections
    peerRefs.current = {};
    setPeers({});
  
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
  
    // Clear remote video references
    remoteVideoRefs.current = {};
  
    // Notify server about disconnection
    socketRef.current?.emit("leave-room", { roomId });
  
    // Disconnect socket
    socketRef.current?.disconnect();
    socketRef.current = null;
  
    // Update state
    setJoinedCall(false);
  };
  

  // Manage user media stream settings
  const manageStream = (a, v) => {
    setVideo(v);
    setAudio(a);
    setMediaOptions({video:v,audio:a});
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

  // Initialize WebRTC and connect to socket
  const handleJoin = async () => {
   
    socketRef.current = io("http://localhost:8000");

    socketRef.current.emit("join-room", { roomId });

    // Receive existing users when joining a room
    socketRef.current.on("existing-users", ({ users }) => {
      users.forEach((userId) => createPeerConnection(userId,true));
    });

    // When a new user joins, create a connection for them
    socketRef.current.on("user-joined", ({ newUserId }) => {
      createPeerConnection(newUserId, false);
    });

    // Handle incoming WebRTC offers
    socketRef.current.on("offer", async ({ offer, from }) => {
      if (!peerRefs.current[from]) await createPeerConnection(from, false);
      await peerRefs.current[from].setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRefs.current[from].createAnswer();
      await peerRefs.current[from].setLocalDescription(answer);
      socketRef.current?.emit("answer", { answer, to: from });
    });

    // Handle incoming WebRTC answers
    socketRef.current.on("answer", async ({ answer, from }) => {
      const pc = peerRefs.current[from];
      if (pc) {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } else {
          console.warn("Skipping setRemoteDescription(answer) - invalid state:", pc.signalingState);
        }
      }
    });
    
    

    // Handle incoming ICE candidates
    socketRef.current.on("ice-candidate", ({ candidate, from }) => {
      if (candidate) {
        peerRefs.current[from]?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Handle user disconnection
    // socketRef.current.on("user-left", ({ userId }) => {
    //   if (peerRefs.current[userId]) {
    //     peerRefs.current[userId].close();
    //     delete peerRefs.current[userId];
    //     setPeers((prev) => {
    //       const updatedPeers = { ...prev };
    //       delete updatedPeers[userId];
    //       return updatedPeers;
    //     });
    //   }
    // });
  };

  // Create a new peer connection for each user
  const createPeerConnection = (userId, isInitiator) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          candidate: event.candidate,
          to: userId,
        });
      }
    };

    // Handle incoming media streams
    peerConnection.ontrack = (event) => {
      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = document.createElement("video");
        remoteVideoRefs.current[userId].autoplay = true;
        remoteVideoRefs.current[userId].playsInline = true;
        document.getElementById("remote-videos")?.appendChild(remoteVideoRefs.current[userId]);
      }
      remoteVideoRefs.current[userId].srcObject = event.streams[0];
    };

    // Add own media tracks
    if (userStream) {
      userStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, userStream);
      });
    }

    // Store peer connection
    peerRefs.current[userId] = peerConnection;
    setPeers((prev) => ({ ...prev, [userId]: peerConnection }));

    // If this user is the initiator, send an offer
    if (isInitiator) {
      createAndSendOffer(userId);
    }
  };

  // Create and send an offer
  const createAndSendOffer = async (userId) => {
    const offer = await peerRefs.current[userId].createOffer();
    await peerRefs.current[userId].setLocalDescription(offer);
    socketRef.current?.emit("offer", { offer, to: userId });
  };

  useEffect(() => {
    getStream();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" ,overflow:"hidden",display:"flex",alignItems:"baseline"}}>

      <video ref={videoRef} autoPlay muted playsInline />
      
      
      <div id="remote-videos" style={{ display: "flex", flexWrap: "wrap" }}></div>
     
      <Controls manageStream={manageStream} disconnectCall={disconnectCall}/>
    </div>
  );
};

export default App; 
