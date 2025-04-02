import { useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Unplug } from "lucide-react";
const Controls = (props: any) => {
  const manageStream = props.manageStream;
  const disconnectCall = props.disconnectCall;
  const [video, setVideo] = useState(true);
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
    </div>
  );
};

export default Controls;
