import { createContext, useContext, ReactNode } from 'react';

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

// Mock user data - in a real app, this would come from authentication
const mockUser: User = {
  id: '1',
  name: 'Sarah Chen',
  email: 'sarah.chen@company.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  role: 'Product Manager',
  joinedDate: '2024-01-15',
};

export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <UserContext.Provider value={{ user: mockUser }}>
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
