import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/api';

type Status = 'online' | 'offline' | 'checking';

interface BackendStatusContextType {
  status: Status;
  isBackendDown: boolean;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('checking');

  const checkStatus = async () => {
    try {
      const response = await api.get('/');
      if (response.data.includes("Sutra API is running")) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll aggressively while not yet online, relax once connected
    const pollMs = status === 'online' ? 30000 : 5000;
    const interval = setInterval(checkStatus, pollMs);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <BackendStatusContext.Provider value={{ status, isBackendDown: status === 'offline' }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => {
  const context = useContext(BackendStatusContext);
  if (context === undefined) {
    throw new Error('useBackendStatus must be used within a BackendStatusProvider');
  }
  return context;
};
