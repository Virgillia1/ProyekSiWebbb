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
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const authenticatedUser = await loginRequest(username, password);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((currentUser) => (currentUser ? { ...currentUser, ...updates } : currentUser));
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
