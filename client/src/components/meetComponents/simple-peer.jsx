import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { useParams, useLocation } from "react-router-dom";

const Meeting = () => {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isInitiator = location.search.split("=")[1] === 'true' ? true : false;
  // const isInitiator = searchParams.get("isInitiator") === "true";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const getMediaAndSetup = async () => {
      try {
        console.log("Requesting media devices...");
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        console.log("Media devices acquired:", mediaStream);
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        console.log("Media devices acquired:", mediaStream);
        // Init socket connection
        socketRef.current = io("http://localhost:8000");
        console.log("Socket connected:", socketRef.current);
        // Join the room
        socketRef.current.emit("join-room", { roomId: id });

        // Create peer
        console.log("Creating peer...",isInitiator);
        console.log(mediaStream);
        peerRef.current = new Peer({
          initiator: isInitiator,
          trickle: false,
          stream: mediaStream,
        });
        console.log("Peer created:", peerRef.current);
        // When peer generates signal data
        peerRef.current.on("signal", (data) => {
          console.log("Sending signal:", data);
          socketRef.current.emit("signal", { data, to: id });
        });

        // When receiving signal from other peer
        socketRef.current.on("signal", ({ data }) => {
          console.log("Received signal:", data);
          peerRef.current.signal(data);
        });

        // When connected
        peerRef.current.on("connect", () => {
          console.log("🟢 P2P Connected");
          peerRef.current.send("Hello from peer");
        });

        // When receiving data
        peerRef.current.on("data", (data) => {
          console.log("📨 Message from peer:", data.toString());
        });

        // When receiving remote media stream
        peerRef.current.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

      } catch (err) {
        console.error("❌ Error accessing media devices:", err);
      }
    };

    getMediaAndSetup();

    // Cleanup
    return () => {
      peerRef.current?.destroy();
      socketRef.current?.disconnect();
    };
  }, [id, isInitiator]);

  return (
    <>
      <h2>Meeting Room: {id}</h2>
      <div>
        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "300px" }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
      </div>
    </>
  );
};

export default Meeting;
