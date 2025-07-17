import type { Category } from '@/store/types';

export const categories: Record<string, Category> = {
  government: {
    id: 'government',
    name: 'الحكومة',
    icon: 'Landmark',
    color: 'hsl(24.6, 95%, 53.1%)',
    description: 'الخدمات الحكومية الرسمية والوزارات',
    agents: [{
      id: 'prime-ministry',
      name: 'رئاسة الوزراء',
      institution: 'رئاسة الوزراء الأردنية',
      description: 'السياسات الحكومية، التواصل الرسمي، تنسيق الوزارات',
      color: 'hsl(24.6, 85%, 48%)',
      icon: 'Landmark',
      rating: 4.9,
      responseTime: '3 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'digital-economy',
      name: 'وزارة الاقتصاد الرقمي',
      institution: 'وزارة الاقتصاد الرقمي وريادة الأعمال',
      description: 'الخدمات الرقمية، الحكومة الإلكترونية، تراخيص الأعمال، المبادرات التقنية',
      color: 'hsl(24.6, 95%, 53.1%)',
      icon: 'Laptop',
      rating: 4.7,
      responseTime: '2 دقيقة',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'ministry-youth',
      name: 'وزارة الشباب',
      institution: 'وزارة الشباب',
      description: 'برامج الشباب، الرياضة، الأنشطة الثقافية، المنح الدراسية',
      color: 'hsl(24.6, 95%, 58%)',
      icon: 'Star',
      rating: 4.6,
      responseTime: '4 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }]
  },
  ngos: {
    id: 'ngos',
    name: 'المنظمات غير الحكومية',
    icon: 'Handshake',
    color: 'hsl(142, 71%, 45%)',
    description: 'المنظمات غير الحكومية والمؤسسات الخيرية',
    agents: [{
      id: 'crown-prince',
      name: 'مؤسسة ولي العهد',
      institution: 'مؤسسة ولي العهد',
      description: 'تطوير الشباب، البرامج التعليمية، مبادرات القيادة',
      color: 'hsl(142, 71%, 40%)',
      icon: 'Crown',
      rating: 4.8,
      responseTime: '3 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'king-abdullah-fund',
      name: 'صندوق الملك عبدالله الثاني',
      institution: 'صندوق الملك عبدالله الثاني للتنمية',
      description: 'مشاريع التنمية، البرامج المجتمعية، فرص التمويل',
      color: 'hsl(142, 71%, 45%)',
      icon: 'Building',
      rating: 4.7,
      responseTime: '5 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'youth-jordan',
      name: 'شباب الأردن',
      institution: 'منظمة شباب الأردن',
      description: 'تمكين الشباب، فرص التطوع، البرامج الاجتماعية',
      color: 'hsl(142, 71%, 50%)',
      icon: 'Sprout',
      rating: 4.5,
      responseTime: '3 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }]
  },
  hotels: {
    id: 'hotels',
    name: 'الفنادق',
    icon: 'Hotel',
    color: 'hsl(271, 91%, 65%)',
    description: 'الفنادق الفاخرة وخدمات الضيافة',
    agents: [{
      id: 'st-regis',
      name: 'سانت ريجيس عمان',
      institution: 'فندق سانت ريجيس عمان',
      description: 'الإقامة الفاخرة، الحجوزات، خدمات الكونسيرج، الفعاليات',
      color: 'hsl(271, 91%, 60%)',
      icon: 'Star',
      rating: 4.9,
      responseTime: '1 دقيقة',
      languages: ['العربية', 'English', 'Français'],
      available: true
    }, {
      id: 'fairmont',
      name: 'فيرمونت عمان',
      institution: 'فندق فيرمونت عمان',
      description: 'خدمات الفندق المميزة، المطاعم، السبا، المرافق التجارية',
      color: 'hsl(271, 91%, 65%)',
      icon: 'Hotel',
      rating: 4.8,
      responseTime: '2 دقيقة',
      languages: ['العربية', 'English', 'Deutsch'],
      available: true
    }, {
      id: 'w-amman',
      name: 'دبليو عمان',
      institution: 'فندق دبليو عمان',
      description: 'الفخامة العصرية، الحياة الليلية، المرافق الحديثة، تجارب نمط الحياة',
      color: 'hsl(271, 91%, 70%)',
      icon: 'Moon',
      rating: 4.7,
      responseTime: '2 دقيقة',
      languages: ['العربية', 'English'],
      available: false
    }]
  },
  restaurants: {
    id: 'restaurants',
    name: 'المطاعم',
    icon: 'Utensils',
    color: 'hsl(45, 93%, 58%)',
    description: 'المطاعم والمقاهي وخدمات الطعام',
    agents: [{
      id: 'zoka',
      name: 'Zoka',
      institution: 'مطعم Zoka الذكي',
      description: 'قائمة طعام متنوعة، أطباق شرقية وغربية، خدمة توصيل، حجوزات ذكية',
      color: 'hsl(45, 85%, 55%)',
      icon: 'Pizza',
      rating: 4.8,
      responseTime: '30 ثانية',
      languages: ['العربية', 'English'],
      available: true
    }]
  },
  hospitals: {
    id: 'hospitals',
    name: 'المستشفيات',
    icon: 'Hospital',
    color: 'hsl(0, 84%, 60%)',
    description: 'الخدمات الصحية والمرافق الطبية',
    agents: [{
      id: 'king-hussein-cancer',
      name: 'مركز الحسين للسرطان',
      institution: 'مركز الحسين للسرطان',
      description: 'علاج السرطان، المواعيد، رعاية المرضى، الاستشارات الطبية',
      color: 'hsl(0, 84%, 55%)',
      icon: 'Ribbon',
      rating: 4.9,
      responseTime: '2 دقيقة',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'jordan-hospital',
      name: 'مستشفى الأردن',
      institution: 'مستشفى الأردن',
      description: 'الرعاية الصحية العامة، خدمات الطوارئ، مواعيد الأخصائيين',
      color: 'hsl(0, 84%, 60%)',
      icon: 'Hospital',
      rating: 4.6,
      responseTime: '4 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'abdali-hospital',
      name: 'مستشفى العبدلي',
      institution: 'مستشفى العبدلي',
      description: 'الرعاية الصحية الحديثة، التشخيص، الجراحة، خدمات المرضى',
      color: 'hsl(0, 84%, 65%)',
      icon: 'Stethoscope',
      rating: 4.7,
      responseTime: '3 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }]
  },
  travel: {
    id: 'travel',
    name: 'السفر',
    icon: 'Plane',
    color: 'hsl(24.6, 95%, 53.1%)',
    description: 'خدمات النقل والسياحة',
    agents: [{
      id: 'royal-jordanian',
      name: 'الملكية الأردنية',
      institution: 'الخطوط الجوية الملكية الأردنية',
      description: 'حجز الطيران، الحجوزات، الأمتعة، برنامج الولاء',
      color: 'hsl(24.6, 85%, 48%)',
      icon: 'Plane',
      rating: 4.5,
      responseTime: '3 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'jett-bus',
      name: 'شركة جت للباصات',
      institution: 'شركة جت للباصات',
      description: 'النقل بالباصات، الطرق، الجداول الزمنية، حجز التذاكر',
      color: 'hsl(24.6, 95%, 53.1%)',
      icon: 'Bus',
      rating: 4.3,
      responseTime: '4 دقائق',
      languages: ['العربية', 'English'],
      available: true
    }, {
      id: 'tourism-board',
      name: 'هيئة تنشيط السياحة',
      institution: 'هيئة تنشيط السياحة الأردنية',
      description: 'المعلومات السياحية، المعالم، أدلة السفر، التوصيات',
      color: 'hsl(24.6, 95%, 58%)',
      icon: 'Map',
      rating: 4.6,
      responseTime: '2 دقيقة',
      languages: ['العربية', 'English', 'Français'],
      available: true
    }]
  }
};
