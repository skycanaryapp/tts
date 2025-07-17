// Date utility functions for Arabic formatting

// Convert English numbers to Arabic-Indic numerals
export const toArabicNumerals = (str: string | number): string => {
  const englishToArabic: { [key: string]: string } = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩'
  };

  return str.toString().replace(/[0-9]/g, (digit) => englishToArabic[digit] || digit);
};

// Arabic month names
const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Arabic day names
const arabicDays = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

// Format date in Arabic with Gregorian calendar
export const formatArabicDate = (date: string | Date, options: {
  includeTime?: boolean;
  includeDay?: boolean;
  short?: boolean;
} = {}): string => {
  const { includeTime = false, includeDay = false, short = false } = options;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'تاريخ غير صحيح';
  }

  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const dayName = arabicDays[dateObj.getDay()];
  
  let result = '';
  
  // Add day name if requested
  if (includeDay) {
    result += `${dayName}، `;
  }
  
  // Format the date
  if (short) {
    // Short format: ١٥/٣/٢٠٢٤
    result += `${toArabicNumerals(day)}/${toArabicNumerals(month + 1)}/${toArabicNumerals(year)}`;
  } else {
    // Long format: ١٥ مارس ٢٠٢٤
    result += `${toArabicNumerals(day)} ${arabicMonths[month]} ${toArabicNumerals(year)}`;
  }
  
  // Add time if requested
  if (includeTime) {
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    
    result += ` - ${toArabicNumerals(displayHours)}:${toArabicNumerals(minutes.toString().padStart(2, '0'))} ${period}`;
  }
  
  return result;
};

// Format time only in Arabic
export const formatArabicTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'وقت غير صحيح';
  }

  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  return `${toArabicNumerals(displayHours)}:${toArabicNumerals(minutes.toString().padStart(2, '0'))} ${period}`;
};

// Get relative time in Arabic (e.g., "منذ ٥ دقائق")
export const getRelativeTimeArabic = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'منذ لحظات';
  } else if (diffMinutes < 60) {
    return `منذ ${toArabicNumerals(diffMinutes)} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
  } else if (diffHours < 24) {
    return `منذ ${toArabicNumerals(diffHours)} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
  } else if (diffDays < 7) {
    return `منذ ${toArabicNumerals(diffDays)} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
  } else if (diffWeeks < 4) {
    return `منذ ${toArabicNumerals(diffWeeks)} ${diffWeeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  } else if (diffMonths < 12) {
    return `منذ ${toArabicNumerals(diffMonths)} ${diffMonths === 1 ? 'شهر' : 'شهور'}`;
  } else {
    return `منذ ${toArabicNumerals(diffYears)} ${diffYears === 1 ? 'سنة' : 'سنوات'}`;
  }
};

// Format conversation date for display
export const formatConversationDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `اليوم - ${formatArabicTime(dateObj)}`;
  } else if (diffDays === 1) {
    return `أمس - ${formatArabicTime(dateObj)}`;
  } else if (diffDays < 7) {
    return `${arabicDays[dateObj.getDay()]} - ${formatArabicTime(dateObj)}`;
  } else {
    return formatArabicDate(dateObj, { short: true });
  }
};