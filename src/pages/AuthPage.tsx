import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoadingButton } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { authMode, setAuthMode, signIn, signUp, loading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (authMode === 'signin') {
        await signIn(formData.email, formData.password, formData.name);
      } else {
        await signUp(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const isFormValid = () => {
    if (authMode === 'signin') {
      return formData.email && formData.password;
    }
    return formData.name && formData.email && formData.password;
  };

  return (
    <div className="min-h-screen bg-white font-tajawal" dir="rtl">
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <img src="/favicon.png" alt="Mandaleen Logo" className="w-16 h-16 logo-icon" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">مندلين</h1>
            <p className="text-gray-600 arabic-text">منصة الخدمات الموحدة للمواطن</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'signin' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              تسجيل الدخول
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'signup' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="arabic-text">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="أحمد الرشيد"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 arabic-text"
                  required={authMode === 'signup'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="ahmed@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                dir="ltr"
                required
                minLength={6}
              />
            </div>

            <LoadingButton
              type="submit"
              loading={loading.isLoading}
              disabled={!isFormValid()}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
            >
              {authMode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </LoadingButton>

            <p className="text-xs text-gray-500 text-center arabic-text">
              {authMode === 'signin' 
                ? 'للتجربة: استخدم أي بريد إلكتروني وكلمة مرور صالحة' 
                : 'ستتمكن من الوصول إلى جميع الخدمات فور إنشاء الحساب'
              }
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
