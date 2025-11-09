import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, name: string) {
    // Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name in Firebase
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Sync user data to MongoDB
      try {
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`;
        
        await apiService.createFirebaseUser({
          firebaseUid: userCredential.user.uid,
          email: userCredential.user.email || email,
          name: name,
          avatar: avatar,
        });

        console.log('✅ User synced to MongoDB');
      } catch (error) {
        console.error('❌ Failed to sync user to MongoDB:', error);
        // Don't throw error - user is created in Firebase, we can retry sync later
      }
    }
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user just logged in, ensure they exist in MongoDB
      if (user) {
        try {
          const response = await apiService.getFirebaseUser(user.uid);
          if (!response.success) {
            // User doesn't exist in MongoDB, create them
            console.log('User not found in MongoDB, creating...');
            await apiService.createFirebaseUser({
              firebaseUid: user.uid,
              email: user.email || '',
              name: user.displayName || 'User',
              avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            });
          }
        } catch (error) {
          console.error('Error syncing user on login:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
