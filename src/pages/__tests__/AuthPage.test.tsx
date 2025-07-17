import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import { AuthPage } from '../AuthPage';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign in form by default', () => {
    renderWithProviders(<AuthPage />);

    expect(screen.getByText('مندلين')).toBeInTheDocument();
    expect(screen.getByText('منصة الخدمات الموحدة للمواطن')).toBeInTheDocument();
    expect(screen.getByText('تسجيل الدخول')).toBeInTheDocument();
    expect(screen.getByText('إنشاء حساب')).toBeInTheDocument();
    expect(screen.getByLabelText('البريد الإلكتروني')).toBeInTheDocument();
    expect(screen.getByLabelText('كلمة المرور')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تسجيل الدخول' })).toBeInTheDocument();
  });

  it('should switch to sign up mode', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);

    const signUpButton = screen.getByRole('button', { name: 'إنشاء حساب' });
    await user.click(signUpButton);

    expect(screen.getByLabelText('الاسم الكامل')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إنشاء حساب' })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);

    const emailInput = screen.getByLabelText('البريد الإلكتروني');
    const passwordInput = screen.getByLabelText('كلمة المرور');
    const submitButton = screen.getByRole('button', { name: 'تسجيل الدخول' });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('البريد الإلكتروني غير صحيح')).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);

    const emailInput = screen.getByLabelText('البريد الإلكتروني');
    const passwordInput = screen.getByLabelText('كلمة المرور');
    const submitButton = screen.getByRole('button', { name: 'تسجيل الدخول' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('كلمة المرور يجب أن تكون 6 أحرف على الأقل')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);

    const emailInput = screen.getByLabelText('البريد الإلكتروني');
    const passwordInput = screen.getByLabelText('كلمة المرور');
    const submitButton = screen.getByRole('button', { name: 'تسجيل الدخول' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should show loading state briefly
    expect(submitButton).toBeDisabled();
  });

  it('should require name field in sign up mode', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);

    // Switch to sign up mode
    const signUpModeButton = screen.getByRole('button', { name: 'إنشاء حساب' });
    await user.click(signUpModeButton);

    const emailInput = screen.getByLabelText('البريد الإلكتروني');
    const passwordInput = screen.getByLabelText('كلمة المرور');
    const submitButton = screen.getByRole('button', { name: 'إنشاء حساب' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('جميع الحقول مطلوبة')).toBeInTheDocument();
    });
  });

  it('should validate name length in sign up mode', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage />);

    // Switch to sign up mode
    const signUpModeButton = screen.getByRole('button', { name: 'إنشاء حساب' });
    await user.click(signUpModeButton);

    const nameInput = screen.getByLabelText('الاسم الكامل');
    const emailInput = screen.getByLabelText('البريد الإلكتروني');
    const passwordInput = screen.getByLabelText('كلمة المرور');
    const submitButton = screen.getByRole('button', { name: 'إنشاء حساب' });

    await user.type(nameInput, 'أ');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('الاسم يجب أن يكون حرفين على الأقل')).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<AuthPage />);

    const emailInput = screen.getByLabelText('البريد الإلكتروني');
    const passwordInput = screen.getByLabelText('كلمة المرور');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });
});