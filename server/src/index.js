const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const ApiResponse = require('./utils/ApiResponse');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const routingRoutes = require('./routes/routingRoutes');
const researchRoutes = require('./routes/researchRoutes');

// Initialize express app
const app = express();
const httpServer = http.createServer(app);

// Connect to Database
connectDB();

// Initialize Socket.IO
initSocket(httpServer, env.CLIENT_URL);

// Security & utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root welcome & frontend redirect
app.get('/', (req, res) => {
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QuickMeds API Server</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
          .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); text-align: center; max-width: 480px; }
          h1 { color: #0284c7; margin-bottom: 8px; }
          p { color: #64748b; font-size: 0.95rem; line-height: 1.5; }
          .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; margin-bottom: 1rem; }
          .btn { display: inline-block; background: #0284c7; color: white; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; margin-top: 1.5rem; transition: background 0.2s; }
          .btn:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Backend API Server Running</div>
          <h1>QuickMeds API</h1>
          <p>This is the backend REST API server running on port 5000.</p>
          <p>To view the full website, please open the frontend app below:</p>
          <a class="btn" href="${env.CLIENT_URL}">Open QuickMeds Frontend (Website) →</a>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'QuickMeds Backend API',
    uptime: process.uptime()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/research', researchRoutes);

// Catch-all 404 for undefined API routes
app.use('/api/*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - API endpoint not found`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(env.PORT, () => {
    console.log(
      `===============================================\n` +
      `  🚀 QUICKMEDS SERVER RUNNING ON PORT ${env.PORT}\n` +
      `  🌐 Client URL: ${env.CLIENT_URL}\n` +
      `  🩺 Mode: ${env.NODE_ENV}\n` +
      `===============================================`
    );
  });
}

module.exports = { app, httpServer };
