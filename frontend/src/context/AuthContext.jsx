import { createContext, useContext, useState, useCallback } from 'react';
import { mockPatient, mockCaretaker } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('carecall_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email, password, role) => {
    // Mock login — just set the appropriate user
    const mockUser = role === 'patient' ? { ...mockPatient } : { ...mockCaretaker };
    mockUser.email = email || mockUser.email;
    localStorage.setItem('carecall_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }, []);

  const signup = useCallback((formData, role) => {
    const newUser = {
      id: 'u_' + Date.now(),
      role,
      ...formData,
    };
    localStorage.setItem('carecall_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('carecall_user');
    setUser(null);
  }, []);

  const switchRole = useCallback((role) => {
    const mockUser = role === 'patient' ? { ...mockPatient } : { ...mockCaretaker };
    localStorage.setItem('carecall_user', JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
