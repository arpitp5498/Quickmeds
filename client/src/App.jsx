import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { ReminderProvider } from './context/ReminderContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <LocationProvider>
              <SocketProvider>
                <CartProvider>
                  <ReminderProvider>
                    <AppRoutes />
                  </ReminderProvider>
                </CartProvider>
              </SocketProvider>
            </LocationProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

