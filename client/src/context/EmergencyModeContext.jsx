import React, { createContext, useContext, useState, useEffect } from 'react';

const EmergencyModeContext = createContext();

export const EmergencyModeProvider = ({ children }) => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(() => {
    const saved = localStorage.getItem('quickmeds_emergency_mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('quickmeds_emergency_mode', isEmergencyMode);
    if (isEmergencyMode) {
      document.body.classList.add('emergency-mode');
    } else {
      document.body.classList.remove('emergency-mode');
    }
  }, [isEmergencyMode]);

  const activateEmergencyMode = () => setIsEmergencyMode(true);
  const deactivateEmergencyMode = () => setIsEmergencyMode(false);
  const toggleEmergencyMode = () => setIsEmergencyMode(prev => !prev);

  return (
    <EmergencyModeContext.Provider
      value={{
        isEmergencyMode,
        activateEmergencyMode,
        deactivateEmergencyMode,
        toggleEmergencyMode
      }}
    >
      {children}
    </EmergencyModeContext.Provider>
  );
};

export const useEmergencyMode = () => {
  const context = useContext(EmergencyModeContext);
  if (!context) {
    throw new Error('useEmergencyMode must be used within an EmergencyModeProvider');
  }
  return context;
};
