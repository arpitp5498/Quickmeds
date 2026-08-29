import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // Join authenticated user room
      if (user?._id) {
        socketInstance.emit('join_user', user._id);

        if (user.role === 'PHARMACY' && user.pharmacyId) {
          const pharmId = typeof user.pharmacyId === 'object' ? user.pharmacyId._id : user.pharmacyId;
          socketInstance.emit('join_pharmacy', pharmId);
        }

        if (user.role === 'DELIVERY_PARTNER' && user.deliveryPartnerId) {
          const partnerId = typeof user.deliveryPartnerId === 'object' ? user.deliveryPartnerId._id : user.deliveryPartnerId;
          socketInstance.emit('join_delivery', partnerId);
        }

        if (user.role === 'ADMIN') {
          socketInstance.emit('join_admin');
        }
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user?._id, user?.role, user?.pharmacyId, user?.deliveryPartnerId]);

  const trackOrder = (orderId) => {
    if (socket && orderId) {
      socket.emit('track_order', orderId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, trackOrder }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
