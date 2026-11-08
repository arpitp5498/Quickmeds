const { Server } = require('socket.io');

let io = null;


const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  const jwt = require('jsonwebtoken');
  const env = require('./env');
  const User = require('../models/User');
  const Order = require('../models/Order');
  io.use(async (socket, next) => {
    try {
      const claims = jwt.verify(socket.handshake.auth.token, env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'quickmeds', audience: 'quickmeds-web' });
      const user = await User.findOne({ _id: claims.id, isActive: true });
      if (!user || user.tokenVersion !== claims.tokenVersion) throw new Error();
      const expiry = setTimeout(() => socket.disconnect(true), Math.max(0, claims.exp * 1000 - Date.now()));
      socket.once('disconnect', () => clearTimeout(expiry));
      socket.data.user = user;
      next();
    } catch { next(new Error('Unauthorized')); }
  });
  io.on('connection', socket => {
    const user = socket.data.user;
    socket.join('user:' + user._id);
    if (user.role === 'ADMIN') socket.join('admin:room');
    for (const [role, field, prefix] of [['PHARMACY','pharmacyId','pharmacy'], ['DOCTOR','doctorId','doctor'], ['DELIVERY_PARTNER','deliveryPartnerId','delivery']]) {
      if (user.role === role && user[field]) socket.join(prefix + ':' + user[field]);
    }
    socket.on('track_order', async id => {
      try {
        if (typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) return;
        const order = await Order.findById(id).select('customerId pharmacyId deliveryPartnerId');
        if (order && (user.role === 'ADMIN' || String(order.customerId) === String(user._id) ||
          (user.role === 'PHARMACY' && user.pharmacyId && String(order.pharmacyId) === String(user.pharmacyId)) ||
          (user.role === 'DELIVERY_PARTNER' && String(order.deliveryPartnerId) === String(user._id)))) {
          socket.join('order:' + id);
        }
      } catch { socket.disconnect(true); }
    });
  });

  return io;
};

const { afterCommit } = require('../middleware/transactional');
const getIO = () => ({
  to: room => ({ emit: (event, data) => afterCommit(() => io?.to(room).emit(event, data)) }),
  emit: (event, data) => afterCommit(() => io?.emit(event, data))
});

module.exports = { initSocket, getIO };
