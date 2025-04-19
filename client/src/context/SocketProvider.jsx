import React, { createContext,useContext,useMemo } from "react";
import { io } from "socket.io-client";
import AppContext from "./Context";
const socketContext = createContext(null);
export const useSocket = ()=>{
    const socket = useContext(socketContext);
    return socket;
}
export const SocketProvider = (props)=>{
    const {apiUrl} = useContext(AppContext)
    const socket = useMemo(()=>io(apiUrl),[])
    return (
        <socketContext.Provider value={socket}>
            {props.children}
        </socketContext.Provider>
    )
}