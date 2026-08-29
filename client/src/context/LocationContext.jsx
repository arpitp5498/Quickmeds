import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

const DEFAULT_LOCATION = {
  address: 'Connaught Place, New Delhi, Delhi 110001',
  city: 'New Delhi',
  lat: 28.629,
  lng: 77.214
};

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState(() => {
    const saved = localStorage.getItem('quickmeds_user_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const setLocation = (newLoc) => {
    const updated = { ...location, ...newLoc };
    setLocationState(updated);
    localStorage.setItem('quickmeds_user_location', JSON.stringify(updated));
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = {
          lat: latitude,
          lng: longitude,
          address: `Detected GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          city: 'Current Area'
        };
        setLocation(newLoc);
        setIsDetecting(false);
      },
      (error) => {
        setIsDetecting(false);
        setLocationError(
          error.code === 1
            ? 'Location permission denied. Using manual location selection.'
            : 'Could not fetch current location.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        detectCurrentLocation,
        isDetecting,
        locationError
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
