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
    try {
      const saved = localStorage.getItem('quickmeds_user_location');
      const area = saved && JSON.parse(saved);
      if (area?.city === 'Selected Area' || !Number.isFinite(area?.lat) || !Number.isFinite(area?.lng)) return DEFAULT_LOCATION;
      return area;
    } catch {
      localStorage.removeItem('quickmeds_user_location');
      return DEFAULT_LOCATION;
    }
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const setLocation = (newLoc) => {
    const updated = { ...newLoc, confirmed: true };
    setLocationState(updated);
    localStorage.setItem('quickmeds_user_location', JSON.stringify(updated));
  };

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return false;
    }

    setIsDetecting(true);
    setLocationError(null);

    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true })
      );
      const { latitude, longitude } = position.coords;
      return { lat: latitude, lng: longitude, address: 'Current location', city: 'Current Area' };
    } catch (error) {
      setLocationError(error.code === 1
        ? 'Location access is off. Choose a delivery area below.'
        : 'Could not get your location. Try again or choose an area below.');
      return false;
    } finally {
      setIsDetecting(false);
    }
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
