import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teammates,setTeammates] = useState([]);
  const apiUrl = "http://localhost:8000";
  useEffect(() => {
    const token = localStorage.getItem("token");
    const response = axios
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
        console.log(res); 
      }).catch(e=>{

        console.log(e);
      })
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, apiUrl,teammates }}>
      {children}
    </AppContext.Provider>
  );
};
export default AppContext;
