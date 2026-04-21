import { createContext, ReactNode, useContext, useState } from 'react';

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, { password: string; data: AuthUser }> = {
  andi: {
    password: 'andi123',
    data: {
      id: '1',
      name: 'Andi Wijaya',
      email: 'andi@cargoku.com',
      role: 'customer',
      phone: '08123456789',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
  },
  siti: {
    password: 'siti123',
    data: {
      id: '2',
      name: 'Siti Rahayu',
      email: 'siti@cargoku.com',
      role: 'customer',
      phone: '08198765432',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
  },
  admin_maya: {
    password: 'maya123',
    data: {
      id: '3',
      name: 'Maya Pratama',
      email: 'maya.pratama@cargoku.com',
      role: 'admin',
      phone: '081299887766',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
  },
  admin_raka: {
    password: 'raka123',
    data: {
      id: '4',
      name: 'Raka Adinata',
      email: 'raka.adinata@cargoku.com',
      role: 'admin',
      phone: '081377665544',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (username: string, password: string): Promise<AuthUser | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedUsername = username.toLowerCase().trim();
    const mockUser = mockUsers[normalizedUsername];

    if (mockUser && mockUser.password === password) {
      setUser(mockUser.data);
      return mockUser.data;
    }

    return null;
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
