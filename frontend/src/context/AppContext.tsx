import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppState = {
  currentRegion: { latitude: number; longitude: number; altitude?: number } | null;
  news: string[];
  reports: string[];
  notifications: string[];
};

type AppContextType = {
  state: AppState;
  setCurrentRegion: (region: AppState['currentRegion']) => void;
};

const initialState: AppState = {
  currentRegion: null,
  news: ['Global temperature rising', 'New 3D Maps feature released'],
  reports: ['Report 1: All systems nominal', 'Report 2: High traffic in city center'],
  notifications: ['Welcome to SAKUNA!'],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);

  const setCurrentRegion = (currentRegion: AppState['currentRegion']) => {
    setState((prev) => ({ ...prev, currentRegion }));
  };

  return (
    <AppContext.Provider value={{ state, setCurrentRegion }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
