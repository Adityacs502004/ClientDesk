import React from 'react';
import { Navigate } from 'react-router';
import useAuth from '../Hooks/useAuth';

const Protected_route = ({children}) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <div>Loading</div>
  }

  if(!user?.user_id){
    return <Navigate to="/login" ></Navigate>
  }
  return children
}

export default Protected_route