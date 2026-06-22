import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (userId) => {
  if (!userId) {
    console.warn('Socket initialization skipped: No userId provided');
    return null;
  }

  if (!socket || !socket.connected) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    
    socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      if (userId) {
        socket.emit('register', userId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      if (userId) {
        socket.emit('register', userId);
      }
    });
  } else if (userId) {
    socket.emit('register', userId);
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initializeSocket, getSocket, disconnectSocket };
