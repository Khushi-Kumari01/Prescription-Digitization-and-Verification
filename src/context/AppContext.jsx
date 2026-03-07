import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const getStoredUser = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem('ms_user') ||
        localStorage.getItem('ms_user') || 'null'
      );
    } catch { return null; }
  };

  const [user, setUser]           = useState(getStoredUser);
  const [currentPage, setCurrentPage] = useState('home');
  const [scanResult, setScanResult]   = useState(null); // shared scan data
  const [toasts, setToasts]           = useState([]);

  const login = useCallback((userData, remember = false) => {
    const session = { ...userData, loginTime: Date.now() };
    sessionStorage.setItem('ms_user', JSON.stringify(session));
    if (remember) localStorage.setItem('ms_user', JSON.stringify(session));
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('ms_user');
    localStorage.removeItem('ms_user');
    setUser(null);
  }, []);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      currentPage, navigate,
      scanResult, setScanResult,
      toasts, setToasts, toast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
