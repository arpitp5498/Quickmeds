import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { ReminderProvider } from './context/ReminderContext';
import { EmergencyModeProvider } from './context/EmergencyModeContext';
import AIAssistantChat from './components/common/AIAssistantChat';
import ErrorBoundary from './components/common/ErrorBoundary';
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
                    <EmergencyModeProvider>
                      <ErrorBoundary>
                        <AppRoutes />
                        <AIAssistantChat />
                      </ErrorBoundary>
                    </EmergencyModeProvider>
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
