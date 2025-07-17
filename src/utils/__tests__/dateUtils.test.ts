import { describe, it, expect } from 'vitest';
import {
  toArabicNumerals,
  formatArabicDate,
  formatArabicTime,
  getRelativeTimeArabic,
  formatConversationDate
} from '../dateUtils';

describe('dateUtils', () => {
  describe('toArabicNumerals', () => {
    it('should convert English numbers to Arabic numerals', () => {
      expect(toArabicNumerals('123')).toBe('١٢٣');
      expect(toArabicNumerals('0')).toBe('٠');
      expect(toArabicNumerals('9876543210')).toBe('٩٨٧٦٥٤٣٢١٠');
      expect(toArabicNumerals(42)).toBe('٤٢');
    });

    it('should handle mixed content', () => {
      expect(toArabicNumerals('ABC123XYZ')).toBe('ABC١٢٣XYZ');
      expect(toArabicNumerals('Test 2024')).toBe('Test ٢٠٢٤');
    });
  });

  describe('formatArabicDate', () => {
    const testDate = new Date('2024-03-15T10:30:00');

    it('should format date in long format by default', () => {
      const result = formatArabicDate(testDate);
      expect(result).toBe('١٥ مارس ٢٠٢٤');
    });

    it('should format date in short format when requested', () => {
      const result = formatArabicDate(testDate, { short: true });
      expect(result).toBe('١٥/٣/٢٠٢٤');
    });

    it('should include day name when requested', () => {
      const result = formatArabicDate(testDate, { includeDay: true });
      expect(result).toContain('الجمعة،'); // March 15, 2024 is a Friday
    });

    it('should include time when requested', () => {
      const result = formatArabicDate(testDate, { includeTime: true });
      expect(result).toContain('١٠:٣٠ ص');
    });

    it('should handle string dates', () => {
      const result = formatArabicDate('2024-03-15');
      expect(result).toBe('١٥ مارس ٢٠٢٤');
    });

    it('should handle invalid dates', () => {
      const result = formatArabicDate('invalid-date');
      expect(result).toBe('تاريخ غير صحيح');
    });
  });

  describe('formatArabicTime', () => {
    it('should format morning time correctly', () => {
      const testDate = new Date('2024-03-15T09:30:00');
      const result = formatArabicTime(testDate);
      expect(result).toBe('٩:٣٠ ص');
    });

    it('should format afternoon time correctly', () => {
      const testDate = new Date('2024-03-15T15:45:00');
      const result = formatArabicTime(testDate);
      expect(result).toBe('٣:٤٥ م');
    });

    it('should format midnight correctly', () => {
      const testDate = new Date('2024-03-15T00:00:00');
      const result = formatArabicTime(testDate);
      expect(result).toBe('١٢:٠٠ ص');
    });

    it('should format noon correctly', () => {
      const testDate = new Date('2024-03-15T12:00:00');
      const result = formatArabicTime(testDate);
      expect(result).toBe('١٢:٠٠ م');
    });

    it('should handle invalid time', () => {
      const result = formatArabicTime('invalid-time');
      expect(result).toBe('وقت غير صحيح');
    });
  });

  describe('getRelativeTimeArabic', () => {
    const now = new Date();

    it('should return "منذ لحظات" for recent times', () => {
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      const result = getRelativeTimeArabic(recent);
      expect(result).toBe('منذ لحظات');
    });

    it('should return minutes for minute differences', () => {
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const result = getRelativeTimeArabic(fiveMinutesAgo);
      expect(result).toBe('منذ ٥ دقائق');
    });

    it('should return hours for hour differences', () => {
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const result = getRelativeTimeArabic(twoHoursAgo);
      expect(result).toBe('منذ ٢ ساعات');
    });

    it('should return days for day differences', () => {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const result = getRelativeTimeArabic(threeDaysAgo);
      expect(result).toBe('منذ ٣ أيام');
    });
  });

  describe('formatConversationDate', () => {
    const now = new Date();

    it('should return "اليوم" for today\'s date', () => {
      const today = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const result = formatConversationDate(today);
      expect(result).toContain('اليوم');
    });

    it('should return "أمس" for yesterday\'s date', () => {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const result = formatConversationDate(yesterday);
      expect(result).toContain('أمس');
    });

    it('should return day name for recent dates', () => {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const result = formatConversationDate(threeDaysAgo);
      // Should contain one of the Arabic day names
      const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const containsArabicDay = arabicDays.some(day => result.includes(day));
      expect(containsArabicDay).toBe(true);
    });

    it('should return short date format for older dates', () => {
      const oldDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const result = formatConversationDate(oldDate);
      // Should match Arabic numerals in date format pattern
      expect(result).toMatch(/[٠-٩]+\/[٠-٩]+\/[٠-٩]+/); 
    });
  });
});