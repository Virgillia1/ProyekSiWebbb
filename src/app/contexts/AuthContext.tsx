import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'customer' | 'courier';

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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: { [key: string]: { password: string; data: AuthUser } } = {
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
  kurir_budi: {
    password: 'budi123',
    data: {
      id: '3',
      name: 'Budi Santoso',
      email: 'budi.santoso@cargoku.com',
      role: 'courier',
      phone: '08234567890',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
  },
  kurir_joko: {
    password: 'joko123',
    data: {
      id: '4',
      name: 'Joko Widodo',
      email: 'joko.widodo@cargoku.com',
      role: 'courier',
      phone: '08345678901',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedUsername = username.toLowerCase().trim();
    const mockUser = mockUsers[normalizedUsername];

    if (mockUser && mockUser.password === password) {
      setUser(mockUser.data);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
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