import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [sharedRepos, setSharedRepos] = useState([]);
  const [repos, setRepos] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [mediaOptions, setMediaOptions] = useState({
    audio: true,
    video: true,
  });
  const logout = () => {
    setUser(null);
    setSharedRepos([]);
    setTeammates([]);
    localStorage.removeItem("token");
  };
  const apiUrl = "http://localhost:8000";
  // const apiUrl = "https://code-meet-i44j.onrender.com"
  const fetchData = async (token) => {
    try {
      const res = await axios.get(`${apiUrl}/api/user/getUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);

      const teamMatesResponse  = await axios.get(`${apiUrl}/api/user/getTeammates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTeammates(teamMatesResponse.data.teamMates);

      const sharedReposResponse = await axios.get(`${apiUrl}/repo/getSharedRepos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSharedRepos(sharedReposResponse.data.sharedRepos);

      const repoResponse =await axios.get(`${apiUrl}/repo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRepos(repoResponse.data);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setLoading(true);

      console.log("Fetching data");
      fetchData(token);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        apiUrl,
        teammates,
        sharedRepos,
        mediaOptions,
        setMediaOptions,
        setTeammates,
        logout,
        setSharedRepos,
        open,
        setOpen,
        alertMessage,
        setAlertMessage,
        alertType,
        setAlertType,
        repos,
        setRepos,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppContext;
