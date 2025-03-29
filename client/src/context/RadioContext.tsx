import React, { createContext, useState, useContext, ReactNode } from 'react';

type RadioContextType = {
  isRadioOpen: boolean;
  openRadio: () => void;
  closeRadio: () => void;
  toggleRadio: () => void;
};

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider = ({ children }: { children: ReactNode }) => {
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  const openRadio = () => setIsRadioOpen(true);
  const closeRadio = () => setIsRadioOpen(false);
  const toggleRadio = () => setIsRadioOpen(prev => !prev);

  return (
    <RadioContext.Provider value={{ isRadioOpen, openRadio, closeRadio, toggleRadio }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
};