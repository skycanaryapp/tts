// Accessibility utility functions
export const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const announceUrgent = (message: string): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Generate unique IDs for ARIA relationships
export const generateId = (prefix: string = 'mandaleen'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Keyboard navigation helpers
export const handleArrowNavigation = (
  event: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect: (index: number) => void
): void => {
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      onSelect(currentIndex);
      return;
    default:
      return;
  }
  
  event.preventDefault();
  items[newIndex]?.focus();
  onSelect(newIndex);
};

// ARIA descriptions for common UI patterns
export const getAriaLabel = (
  type: 'button' | 'link' | 'input' | 'select' | 'dialog',
  context: Record<string, string | number>
): string => {
  const labels = {
    button: {
      chat: `بدء محادثة مع ${context.agent}`,
      call: `إجراء مكالمة مع ${context.agent}`,
      close: 'إغلاق',
      menu: 'فتح القائمة',
      search: 'البحث',
      send: 'إرسال الرسالة',
      voice: 'تسجيل صوتي',
      delete: `حذف ${context.item}`,
    },
    link: {
      category: `عرض فئة ${context.category}`,
      home: 'الانتقال للصفحة الرئيسية',
      back: 'العودة للصفحة السابقة',
    },
    input: {
      email: 'عنوان البريد الإلكتروني',
      password: 'كلمة المرور',
      name: 'الاسم الكامل',
      search: 'البحث في الخدمات',
      message: 'كتابة رسالة جديدة',
    },
    select: {
      language: 'اختيار اللغة',
      category: 'اختيار الفئة',
    },
    dialog: {
      auth: 'نافذة تسجيل الدخول',
      history: 'سجل المحادثات',
      error: 'رسالة خطأ',
      confirmation: 'نافذة تأكيد',
    }
  };
  
  return labels[type][context.action as string] || '';
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// High contrast mode detection
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};