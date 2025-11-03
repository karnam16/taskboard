import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
const FEATURE_REALTIME = import.meta.env.VITE_FEATURE_REALTIME === 'true';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!FEATURE_REALTIME) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }

    const newSocket = io(WS_URL, {
      auth: { token: accessToken },
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinBoard = boardId => {
    if (socket && connected) {
      socket.emit('join_board', boardId);
    }
  };

  const leaveBoard = boardId => {
    if (socket && connected) {
      socket.emit('leave_board', boardId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinBoard, leaveBoard }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
