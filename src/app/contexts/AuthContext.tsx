import { createContext, ReactNode, useContext, useState } from 'react';
import { AuthUser, loginRequest } from '../lib/authApi';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('cargolite_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const authenticatedUser = await loginRequest(username, password);
    setUser(authenticatedUser);
    try {
      localStorage.setItem('cargolite_user', JSON.stringify(authenticatedUser));
    } catch (e) {
      console.error(e);
    }
    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('cargolite_user');
    } catch (e) {
      console.error(e);
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((currentUser) => {
      if (!currentUser) return null;
      const nextUser = { ...currentUser, ...updates };
      try {
        localStorage.setItem('cargolite_user', JSON.stringify(nextUser));
      } catch (e) {
        console.error(e);
      }
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
