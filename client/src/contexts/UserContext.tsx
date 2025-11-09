import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedDate: string;
}

interface UserContextType {
  user: User;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();

  const user = useMemo(() => {
    if (authUser) {
      return {
        id: authUser._id,
        name: authUser.name,
        email: authUser.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser._id}`,
        role: 'Product Manager',
        joinedDate: authUser.createdAt,
      };
    }

    // Fallback for when no user is logged in
    return {
      id: '1',
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      role: 'Guest',
      joinedDate: new Date().toISOString(),
    };
  }, [authUser]);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
