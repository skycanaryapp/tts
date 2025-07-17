import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().signOut();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.authMode).toBe('signin');
    expect(state.loading.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should change auth mode', () => {
    const { setAuthMode } = useAuthStore.getState();
    
    setAuthMode('signup');
    
    expect(useAuthStore.getState().authMode).toBe('signup');
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('should sign in user with valid credentials', async () => {
    const { signIn } = useAuthStore.getState();
    
    await signIn('test@example.com', 'password123', 'أحمد التجريبي');
    
    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('test@example.com');
    expect(state.user?.name).toBe('أحمد التجريبي');
    expect(state.error).toBeNull();
    expect(state.loading.isLoading).toBe(false);
  });

  it('should fail sign in with empty credentials', async () => {
    const { signIn } = useAuthStore.getState();
    
    await expect(signIn('', '')).rejects.toThrow('جميع الحقول مطلوبة');
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error?.type).toBe('auth');
    expect(state.loading.isLoading).toBe(false);
  });

  it('should fail sign in with invalid email', async () => {
    const { signIn } = useAuthStore.getState();
    
    await expect(signIn('invalid-email', 'password123')).rejects.toThrow('البريد الإلكتروني غير صحيح');
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error?.type).toBe('auth');
  });

  it('should fail sign in with short password', async () => {
    const { signIn } = useAuthStore.getState();
    
    await expect(signIn('test@example.com', '123')).rejects.toThrow('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error?.type).toBe('auth');
  });

  it('should sign up user with valid data', async () => {
    const { signUp } = useAuthStore.getState();
    
    await signUp('أحمد الجديد', 'new@example.com', 'password123');
    
    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('new@example.com');
    expect(state.user?.name).toBe('أحمد الجديد');
    expect(state.user?.isVerified).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fail sign up with short name', async () => {
    const { signUp } = useAuthStore.getState();
    
    await expect(signUp('أ', 'test@example.com', 'password123')).rejects.toThrow('الاسم يجب أن يكون حرفين على الأقل');
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error?.type).toBe('auth');
  });

  it('should sign out user', () => {
    const { signOut } = useAuthStore.getState();
    
    // First set a user
    useAuthStore.setState({
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      }
    });
    
    expect(useAuthStore.getState().user).not.toBeNull();
    
    signOut();
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
    expect(state.loading.isLoading).toBe(false);
  });

  it('should clear error', () => {
    const { clearError } = useAuthStore.getState();
    
    // Set an error first
    useAuthStore.setState({
      error: {
        id: 'test-error',
        message: 'Test error',
        type: 'auth',
        timestamp: new Date().toISOString(),
      }
    });
    
    expect(useAuthStore.getState().error).not.toBeNull();
    
    clearError();
    
    expect(useAuthStore.getState().error).toBeNull();
  });
});