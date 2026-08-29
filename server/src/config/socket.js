const { Server } = require('socket.io');

let io = null;
const userSocketMap = new Map(); // userId -> Set of socketIds

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Client joins authenticated user room
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        if (!userSocketMap.has(userId)) {
          userSocketMap.set(userId, new Set());
        }
        userSocketMap.get(userId).add(socket.id);
      }
    });

    // Pharmacy joins pharmacy room for instant new order dispatch
    socket.on('join_pharmacy', (pharmacyId) => {
      if (pharmacyId) {
        socket.join(`pharmacy:${pharmacyId}`);
      }
    });

    // Delivery partner joins delivery room
    socket.on('join_delivery', (partnerId) => {
      if (partnerId) {
        socket.join(`delivery:${partnerId}`);
      }
    });

    // Admin joins platform monitor room
    socket.on('join_admin', () => {
      socket.join('admin:room');
    });

    // Client/Delivery joins active order tracking channel
    socket.on('track_order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    // Delivery partner emits live location updates
    socket.on('delivery_location_update', ({ orderId, coordinates }) => {
      if (orderId && coordinates) {
        io.to(`order:${orderId}`).emit('driver_moved', {
          orderId,
          coordinates,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', () => {
      userSocketMap.forEach((sockets, userId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSocketMap.delete(userId);
          }
        }
      });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    // Return dummy emitter if IO is not initialized (e.g. tests)
    return {
      to: () => ({ emit: () => {} }),
      emit: () => {}
    };
  }
  return io;
};

module.exports = { initSocket, getIO };
