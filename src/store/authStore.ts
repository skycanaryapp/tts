import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';
import type { User, AuthMode, LoadingState, AppError } from './types';

interface AuthState {
  user: User | null;
  authMode: AuthMode;
  loading: LoadingState;
  error: AppError | null;
  
  // Actions
  setAuthMode: (mode: AuthMode) => void;
  signIn: (email: string, password: string, name?: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  setLoading: (loading: LoadingState) => void;
}

const STORAGE_KEY = 'mandaleen-auth';
const ENCRYPTION_KEY = 'mandaleen-secret-key-2024';

// Hash password for basic security (in production, use proper auth service)
const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + 'mandaleen-salt').toString();
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authMode: 'signin',
      loading: { isLoading: false },
      error: null,

      setAuthMode: (mode: AuthMode) => set({ authMode: mode, error: null }),

      signIn: async (email: string, password: string, name?: string) => {
        const { setLoading } = get();
        
        try {
          setLoading({ isLoading: true, operation: 'signin' });
          
          // Validation
          if (!email || !password) {
            throw new Error('جميع الحقول مطلوبة');
          }
          
          if (!isValidEmail(email)) {
            throw new Error('البريد الإلكتروني غير صحيح');
          }
          
          if (!isValidPassword(password)) {
            throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          }

          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: `user_${email}`,
            name: name || 'مستخدم جديد',
            email,
            createdAt: new Date().toISOString(),
            isVerified: true,
          };

          set({ 
            user: newUser, 
            error: null,
            loading: { isLoading: false }
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في تسجيل الدخول';
          set({ 
            error: {
              id: Date.now().toString(),
              message: errorMessage,
              type: 'auth',
              timestamp: new Date().toISOString(),
            },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      signUp: async (name: string, email: string, password: string) => {
        const { setLoading } = get();
        
        try {
          setLoading({ isLoading: true, operation: 'signup' });
          
          // Validation
          if (!name || !email || !password) {
            throw new Error('جميع الحقول مطلوبة');
          }
          
          if (name.length < 2) {
            throw new Error('الاسم يجب أن يكون حرفين على الأقل');
          }
          
          if (!isValidEmail(email)) {
            throw new Error('البريد الإلكتروني غير صحيح');
          }
          
          if (!isValidPassword(password)) {
            throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          }

          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newUser: User = {
            id: `user_${email}`,
            name,
            email,
            createdAt: new Date().toISOString(),
            isVerified: false,
          };

          set({ 
            user: newUser, 
            error: null,
            loading: { isLoading: false }
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في إنشاء الحساب';
          set({ 
            error: {
              id: Date.now().toString(),
              message: errorMessage,
              type: 'auth',
              timestamp: new Date().toISOString(),
            },
            loading: { isLoading: false }
          });
          throw error;
        }
      },

      signOut: () => {
        set({ 
          user: null, 
          error: null,
          loading: { isLoading: false }
        });
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: LoadingState) => set({ loading }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ user: state.user }),
    }
  )
);