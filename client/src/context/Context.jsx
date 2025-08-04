import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teammates,setTeammates] = useState([]);
  const [sharedRepos,setSharedRepos] = useState([]);
  const [repos,setRepos] = useState([]);
  const [open,setOpen] = useState(false);
  const [alertMessage,setAlertMessage] = useState("");
  const [alertType,setAlertType] = useState("success");
  const [mediaOptions,setMediaOptions] = useState({
    audio:true,
    video:true
  })
  const logout = ()=>{
    setUser(null);
    setSharedRepos([]);
    setTeammates([]);
    localStorage.removeItem("token");
    
  }
  const apiUrl = "http://localhost:8000";
  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token){
    axios
      .get(`${apiUrl}/api/user/getUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res);
        setUser(res.data.user);
      })
      .catch((e) => console.log(e));

      axios.get(`${apiUrl}/api/user/getTeammates`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res)=>{
        setTeammates(res.data.teamMates);
        console.log("Teammates:",res.data.teamMates); 
      }).catch(e=>{

        console.log(e);
      })

      axios.get(`${apiUrl}/repo/getSharedRepos`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res)=>{
        setSharedRepos(res.data.sharedRepos);
        console.log(res); 
      }).catch(e=>{
        console.log(e);
      })
    }
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, apiUrl,teammates ,sharedRepos,mediaOptions,setMediaOptions,setTeammates,logout,setSharedRepos,open,setOpen,alertMessage,setAlertMessage,alertType,setAlertType,repos,setRepos}}>
      {children}
    </AppContext.Provider>
  );
};
export default AppContext;
