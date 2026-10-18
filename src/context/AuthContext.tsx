import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  loginAsDemoUser: (role: UserRole) => void;
  logout: () => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('fasalsetu_active_role');
    return (saved as UserRole) || 'farmer';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const profiles = dataService.getProfiles();
    const user = profiles.find(p => p.role === role) || profiles[0];
    setCurrentUser(user);
    localStorage.setItem('fasalsetu_active_role', role);
  }, [role]);

  const switchRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const loginAsDemoUser = (targetRole: UserRole) => {
    setRoleState(targetRole);
  };

  const logout = () => {
    setRoleState('farmer');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        switchRole,
        loginAsDemoUser,
        logout,
        isDemoMode: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
