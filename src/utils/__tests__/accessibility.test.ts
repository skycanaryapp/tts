import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  announceToScreenReader,
  announceUrgent,
  generateId,
  getAriaLabel,
  prefersReducedMotion,
  prefersHighContrast
} from '../accessibility';

describe('accessibility utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('announceToScreenReader', () => {
    it('should create and remove announcement element', (done) => {
      const message = 'Test announcement';
      
      announceToScreenReader(message);
      
      // Check that element was created
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).not.toBeNull();
      expect(announcement?.textContent).toBe(message);
      expect(announcement?.getAttribute('aria-atomic')).toBe('true');
      expect(announcement?.classList.contains('sr-only')).toBe(true);
      
      // Check that element is removed after timeout
      setTimeout(() => {
        const announcementAfter = document.querySelector('[aria-live="polite"]');
        expect(announcementAfter).toBeNull();
        done();
      }, 1100);
    });
  });

  describe('announceUrgent', () => {
    it('should create urgent announcement element', () => {
      const message = 'Urgent message';
      
      announceUrgent(message);
      
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).not.toBeNull();
      expect(announcement?.textContent).toBe(message);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs with default prefix', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toMatch(/^mandaleen-[a-z0-9]+$/);
      expect(id2).toMatch(/^mandaleen-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate unique IDs with custom prefix', () => {
      const id1 = generateId('custom');
      const id2 = generateId('custom');
      
      expect(id1).toMatch(/^custom-[a-z0-9]+$/);
      expect(id2).toMatch(/^custom-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('getAriaLabel', () => {
    it('should return correct labels for buttons', () => {
      expect(getAriaLabel('button', { action: 'chat', agent: 'Test Agent' }))
        .toBe('بدء محادثة مع Test Agent');
      
      expect(getAriaLabel('button', { action: 'call', agent: 'Test Agent' }))
        .toBe('إجراء مكالمة مع Test Agent');
      
      expect(getAriaLabel('button', { action: 'close' }))
        .toBe('إغلاق');
    });

    it('should return correct labels for inputs', () => {
      expect(getAriaLabel('input', { action: 'email' }))
        .toBe('عنوان البريد الإلكتروني');
      
      expect(getAriaLabel('input', { action: 'password' }))
        .toBe('كلمة المرور');
      
      expect(getAriaLabel('input', { action: 'search' }))
        .toBe('البحث في الخدمات');
    });

    it('should return correct labels for links', () => {
      expect(getAriaLabel('link', { action: 'category', category: 'Government' }))
        .toBe('عرض فئة Government');
      
      expect(getAriaLabel('link', { action: 'home' }))
        .toBe('الانتقال للصفحة الرئيسية');
    });

    it('should return empty string for unknown actions', () => {
      expect(getAriaLabel('button', { action: 'unknown' }))
        .toBe('');
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return false when no preference is set', () => {
      // Mock matchMedia to return non-matching
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }));

      expect(prefersReducedMotion()).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should return true when reduced motion is preferred', () => {
      // Mock matchMedia to return matching
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
      }));

      expect(prefersReducedMotion()).toBe(true);
    });
  });

  describe('prefersHighContrast', () => {
    it('should return false when no preference is set', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }));

      expect(prefersHighContrast()).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
    });

    it('should return true when high contrast is preferred', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
      }));

      expect(prefersHighContrast()).toBe(true);
    });
  });
});