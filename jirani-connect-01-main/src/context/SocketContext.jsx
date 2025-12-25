import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

import { toast } from 'sonner';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to socket when user is logged in
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001', {
        query: { userId: user._id },
        auth: { token: sessionStorage.getItem("token") } // Pass token for auth middleware
      });

      setSocket(newSocket);
      
      // Global User Update Listener
      newSocket.on("userUpdated", (updatedData) => {
          if (updatedData._id === user._id) {
             console.log("Socket: User updated:", updatedData);
             // Preserve existing fields that might be missing in update (though backend usually sends full object, but better safe)
             updateUser(updatedData);
             
             if (updatedData.verificationStatus && updatedData.verificationStatus !== user.verificationStatus) {
                 toast.info(`Verification Update: Your account is now ${updatedData.verificationStatus}`);
             }
          }
      });

      return () => newSocket.close();
    } else {
      // Close socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
