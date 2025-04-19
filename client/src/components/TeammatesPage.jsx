import React, { useContext,useEffect,useState,useCallback } from 'react'
import AppContext from '../context/Context'
import { Button } from '@mui/material';
import axios from 'axios';
const TeammatesPage = () => {
  // const [teammates,setTeammates] = useState([]);
  const {apiUrl,teammates,setTeammates} = useContext(AppContext);
  const [addTeammatePopup,setAddTeammatePopup] = useState(false);
  const [teammateEmail,setTeammateEmail] = useState("");
  const token = localStorage.getItem("token");
  const getTeammates = useCallback(async()=>{
    const response = await axios.get(`${apiUrl}/api/user/getTeammates`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    });
    console.log(response);
    setTeammates(response.data.teamMates);
  },[]);
  useEffect(()=>{
    // getTeammates();
    console.log(teammates)
  },[])
  const handleAddTeammember =async (e)=>{
    e.preventDefault();
    console.log(e);
    const email = e.target[0].value;
    console.log(e.target[0].value);
    const response = await axios.post(`${apiUrl}/api/user/add-teammate`,{
      email
    },{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    console.log(response);
    setAddTeammatePopup(false);
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Team mates</h1>
      <ul className="list-disc pl-5">
        {teammates ? (
         
          teammates.length > 0 ? (
            teammates.map((teammate, index) => (
             
              teammate.isAccepted && 
              <li key={index} className="mb-2">
                <p className="text-lg">Name: {teammate.name}</p>
                <p className="text-sm text-gray-600">Email: {teammate.email}</p>
              </li>
            ))
          ) : (
            <div className="text-red-500">No teammates found.</div>
          )
        ) : (
          <div>Loading...</div>
        )}
      </ul>
      
      <Button onClick={()=>setAddTeammatePopup(true)}>Add a teammate</Button>
      
        {addTeammatePopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white p-5 rounded shadow-lg">
              <h2 className="text-xl mb-4">Add a Team member</h2>
              <form onSubmit={handleAddTeammember}>
                <input
                  type="text"
                  placeholder="Enter their email"
                  value={teammateEmail}
                  onChange={(e) => setTeammateEmail(e.target.value)}
                  className="border p-2 mb-4 w-full"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAddTeammatePopup(false)}
                    className="border border-gray-900 px-4 py-2 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="border border-gray-900 px-4 py-2"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      
    </div>
  )
}

export default TeammatesPage
