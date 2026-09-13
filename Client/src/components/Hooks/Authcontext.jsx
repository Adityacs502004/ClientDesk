import React from 'react'
import { useCallback, useEffect, useState } from 'react';
import Api from '../../Service/api';
import AuthContext from './AuthContext';

export function AuthProvider ({children}) {
  const [loading , Setloading] = useState(true);
  const [user , Setuser] = useState({
    user_id : null,
    username : null,
    user_email : null
  });

  const refreshAuth = useCallback(async () => {
    Setloading(true);
    try {
      const verify_token = await Api.get("/api/verify_token");
      const response = verify_token.data;
      if (response.success) {
        Setuser({
          user_id: response.id,
          username: response.username,
          user_email: response.email
        });
      } else {
        Setuser({ user_id: null, username: null, user_email: null });
      }
    } catch (error) {
      console.log("Error verifying the token");
      const status = error?.response?.status;
      if (status === 400 || status === 401) {
        Setuser({ user_id: null, username: null, user_email: null });
      }
    } finally {
      Setloading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshAuth();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshAuth]);

    async function logout() {
        try {
          await Api.post('/api/logout');
        } catch (error) {
          console.log('Error logging out', error);
        } finally {
          sessionStorage.removeItem('redirected');
          Setuser({ user_id: null, username: null, user_email: null });
          window.location.href = "/";
        }
    }

    return (
      <AuthContext.Provider value={{user , loading , logout , refreshAuth}}>
            {children}
        </AuthContext.Provider>
    );
}
