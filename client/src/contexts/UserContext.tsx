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
  const { currentUser } = useAuth();

  const user = useMemo(() => {
    if (currentUser) {
      return {
        id: currentUser.uid,
        name: currentUser.displayName || 'User',
        email: currentUser.email || '',
        avatar: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
        role: 'Product Manager', // Default role, can be stored in Firestore
        joinedDate: currentUser.metadata.creationTime || new Date().toISOString(),
      };
    }
    
    // Fallback for when no user is logged in (shouldn't happen in protected routes)
    return {
      id: '1',
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      role: 'Guest',
      joinedDate: new Date().toISOString(),
    };
  }, [currentUser]);

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
