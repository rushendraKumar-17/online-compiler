import React, { useCallback, useContext,useState,useEffect } from 'react'
import AppContext from '../context/Context';
import {Link} from "react-router-dom";
import axios from 'axios';
import { Button } from '@mui/material';
const Invitations = () => {
  const [invitations,setInvitations] = useState([]);
  const {apiUrl} = useContext(AppContext);
  const token = localStorage.getItem('token');
  const getInvitations = useCallback(async()=>{
    const response = await axios.get(`${apiUrl}/api/user/getInvitations`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    console.log(response);
    setInvitations(response.data.invitations)
  },[])
  useEffect(()=>{
    getInvitations();
  },[])
  const handleAcceptInvite = async(email)=>{
    const response = await axios.post(`${apiUrl}/api/user/invitations/accept`,{email},{headers:{Authorization:`Bearer ${token}`}});
    console.log(response);
  }
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Invitations</h2>
      {invitations.length > 0 ? (
        <ul className="list-disc pl-5">
          {invitations.map((invitation, index) => (
            <div key={index} className="mb-2">
              <Link>{invitation}</Link>
              <Button onClick={()=>handleAcceptInvite(invitation )}>Accept</Button>
              <Button onClick={()=>handleAcceptInvite(invitation )}>Delete</Button>
            </div>
          ))}
        </ul>
      ) : (
        <p>No invitations available.</p>
      )}
    </div>
  );
}

export default Invitations
