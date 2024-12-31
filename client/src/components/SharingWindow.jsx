import React from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {io} from "socket.io-client";
const SharingWindow = () => {
  const {id} = useParams();
  const [repo,setRepo] = useState();

  const fetchRepo = ()=>{
    axios
    .get(`http://localhost:8000/repo/${id}`)
    .then((res) => {
      setRepo(res.data);
      console.log(res);

    })
    .catch((e) => console.log(e));
  }
    useEffect(()=>{
      fetchRepo();
        socket.on("message",(msg)=>{
            console.log(msg);
        }
      )
      socket.emit("message","Hello");
    },[])
    const sendMessage = ()=>{
      socket.emit("message","Heell");
    }
  return (
    <div>
      Hey
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default SharingWindow
