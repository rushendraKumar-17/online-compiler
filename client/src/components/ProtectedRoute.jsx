import React, { useContext } from 'react'
import AppContext from '../context/Context'
import LoginRequired from './LoginRequired';

const ProtectedRoute = ({children}) => {
    const {user} = useContext(AppContext);
    if(!user){
        return <LoginRequired />
    }
    return children;
}

export default ProtectedRoute