import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Controls from "./components/Controls";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomId = "1";
  const [userStream, setUserStream] = useState<MediaStream>();
  const [joinedCall, setJoinedCall] = useState(false);
  const [peers, setPeers] = useState<{ [key: string]: RTCPeerConnection }>({});
  const remoteVideoElementRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRefs = useRef<{ [key: string]: RTCPeerConnection }>({});
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>(
    {}
  );
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
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
      userStream.getTracks().forEach(async (track) => await track.stop());
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
  const manageStream = (a: boolean, v: boolean) => {
    setVideo(v);
    setAudio(a);
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
        console.log(stream);
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // Initialize WebRTC and connect to socket
  const handleJoin = async () => {
    await getStream();
    setJoinedCall(true);
    socketRef.current = io("http://localhost:8000");

    socketRef.current.emit("join-room", { roomId });
    console.log("Emitting i am joining room");
    // Receive existing users when joining a room
    socketRef.current.on("existing-users", ({ users }) => {
      users.forEach((userId: string) => createPeerConnection(userId, true));
    });

    // When a new user joins, create a connection for them
    socketRef.current.on("user-joined", ({ newUserId }) => {
      createPeerConnection(newUserId, false);
    });

    // Handle incoming WebRTC offers
    socketRef.current.on("offer", async ({ offer, from }) => {
      console.log("I got an offer", from, offer);
      if (!peerRefs.current[from]) createPeerConnection(from, false);
      await peerRefs.current[from].setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerRefs.current[from].createAnswer();
      await peerRefs.current[from].setLocalDescription(answer);
      socketRef.current?.emit("answer", { answer, to: from });
    });

    // Handle incoming WebRTC answers
    socketRef.current.on("answer", async ({ answer, from }) => {
      console.log("i got answer", answer, from);
      await peerRefs.current[from]?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log(peerRefs);
    });

    // Handle incoming ICE candidates
    socketRef.current.on("ice-candidate", ({ candidate, from }) => {
      if (candidate) {
        peerRefs.current[from]?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Handle user disconnection
    socketRef.current.on("user-left", ({ userId }) => {
      if (peerRefs.current[userId]) {
        peerRefs.current[userId].close();
        delete peerRefs.current[userId];
        setPeers((prev) => {
          const updatedPeers = { ...prev };
          delete updatedPeers[userId];
          return updatedPeers;
        });
      }
    });
  };

  // Create a new peer connection for each user
  const createPeerConnection = (userId: string, isInitiator: boolean) => {
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
      console.log("I got tracks", event);
      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = document.createElement("video");
        console.log("video Refs",remoteVideoRefs.current);
        remoteVideoRefs.current[userId].autoplay = true;
        remoteVideoRefs.current[userId].playsInline = true;
        remoteVideoRefs.current[userId].muted = false;
        remoteVideoRefs.current[userId].style.width = "300px";
        remoteVideoRefs.current[userId].style.height = "200px";
        remoteVideoRefs.current[userId].style.margin = "10px";
        remoteVideoRefs.current[userId].play();
        document
          .getElementById("remote-videos")
          ?.appendChild(remoteVideoRefs.current[userId]!);
      }
      remoteVideoRefs.current[userId].srcObject = event.streams[0];
      console.log("Stream = ",event.streams[0]);
      console.log("Remote videos stream",remoteVideoRefs.current[userId].srcObject);
      if(remoteVideoElementRef.current){

        remoteVideoElementRef.current.srcObject = event.streams[0];
      }
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
  const createAndSendOffer = async (userId: string) => {
    try {
      const offer = await peerRefs.current[userId].createOffer();
      await peerRefs.current[userId].setLocalDescription(offer);
      socketRef.current?.emit("offer", { offer, to: userId });
    } catch (e) {
      console.error("Error creating offer:", e);
    }
  };

  useEffect(() => {
    getStream();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "baseline",
      }}>
      <video ref={videoRef} autoPlay muted playsInline />

      <div
        id="remote-videos"
        >
       <video autoPlay muted playsInline ref={remoteVideoElementRef}/>

        </div>
      {!joinedCall && (
        <button onClick={handleJoin} style={{ width: "8vw", height: "8vh" }}>
          Join
        </button>
      )}
      <Controls manageStream={manageStream} disconnectCall={disconnectCall} />
    </div>
  );
};

export default App;
