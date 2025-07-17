import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Phone, Search, User, ArrowLeft, Send, Mic, MicOff, PhoneOff, History, Trash2, Star, Clock, ChevronRight, Menu, X } from 'lucide-react';
import { PromptBox } from '../components/ui/chatgpt-prompt-input';
import { MessageRenderer } from '../components/MessageRenderer';
import CategoryCard from '../components/CategoryCard';
import AgentCard from '../components/AgentCard';
import { EnhancedAudioService, AudioServiceConfig } from '../services/EnhancedAudioService';
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
interface Agent {
  id: string;
  name: string;
  institution: string;
  description: string;
  color: string;
  icon: string;
  rating: number;
  responseTime: string;
  languages: string[];
  available: boolean;
}
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  agents: Agent[];
}
interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  type: 'text' | 'voice';
}
interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  agentInstitution: string;
  startTime: string;
  lastActive: string;
  messages: Message[];
  summary: string;
  status: 'active' | 'completed';
}
const Index = () => {
  const [currentView, setCurrentView] = useState<'auth' | 'home' | 'category' | 'chat' | 'voice'>('auth');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<{
    [key: string]: Message[];
  }>({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [conversations, setConversations] = useState<{
    [key: string]: Conversation;
  }>({});
  const recognition = useRef<any>(null);
  const synthesis = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const enhancedAudioService = useRef<EnhancedAudioService | null>(null);
  const [geminiConnectionStatus, setGeminiConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // بيانات الفئات والوكلاء
  const categories: {
    [key: string]: Category;
  } = {
    government: {
      id: 'government',
      name: 'الحكومة',
      icon: '🏛️',
      color: 'hsl(24.6, 95%, 53.1%)',
      description: 'الخدمات الحكومية الرسمية والوزارات',
      agents: [{
        id: 'prime-ministry',
        name: 'رئاسة الوزراء',
        institution: 'رئاسة الوزراء الأردنية',
        description: 'السياسات الحكومية، التواصل الرسمي، تنسيق الوزارات',
        color: 'hsl(24.6, 85%, 48%)',
        icon: '🏛️',
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
        icon: '💻',
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
        icon: '🌟',
        rating: 4.6,
        responseTime: '4 دقائق',
        languages: ['العربية', 'English'],
        available: true
      }]
    },
    ngos: {
      id: 'ngos',
      name: 'المنظمات غير الحكومية',
      icon: '🤝',
      color: 'hsl(142, 71%, 45%)',
      description: 'المنظمات غير الحكومية والمؤسسات الخيرية',
      agents: [{
        id: 'crown-prince',
        name: 'مؤسسة ولي العهد',
        institution: 'مؤسسة ولي العهد',
        description: 'تطوير الشباب، البرامج التعليمية، مبادرات القيادة',
        color: 'hsl(142, 71%, 40%)',
        icon: '👑',
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
        icon: '🏗️',
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
        icon: '🌱',
        rating: 4.5,
        responseTime: '3 دقائق',
        languages: ['العربية', 'English'],
        available: true
      }]
    },
    hotels: {
      id: 'hotels',
      name: 'الفنادق',
      icon: '🏨',
      color: 'hsl(271, 91%, 65%)',
      description: 'الفنادق الفاخرة وخدمات الضيافة',
      agents: [{
        id: 'st-regis',
        name: 'سانت ريجيس عمان',
        institution: 'فندق سانت ريجيس عمان',
        description: 'الإقامة الفاخرة، الحجوزات، خدمات الكونسيرج، الفعاليات',
        color: 'hsl(271, 91%, 60%)',
        icon: '⭐',
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
        icon: '🏨',
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
        icon: '🌃',
        rating: 4.7,
        responseTime: '2 دقيقة',
        languages: ['العربية', 'English'],
        available: false
      }]
    },
    restaurants: {
      id: 'restaurants',
      name: 'المطاعم',
      icon: '🍽️',
      color: 'hsl(45, 93%, 58%)',
      description: 'المطاعم والمقاهي وخدمات الطعام',
      agents: [{
        id: 'zoka',
        name: 'Zoka',
        institution: 'مطعم Zoka الذكي',
        description: 'قائمة طعام متنوعة، أطباق شرقية وغربية، خدمة توصيل، حجوزات ذكية',
        color: 'hsl(45, 85%, 55%)',
        icon: '🍕',
        rating: 4.8,
        responseTime: '30 ثانية',
        languages: ['العربية', 'English'],
        available: true
      }]
    },
    hospitals: {
      id: 'hospitals',
      name: 'المستشفيات',
      icon: '🏥',
      color: 'hsl(0, 84%, 60%)',
      description: 'الخدمات الصحية والمرافق الطبية',
      agents: [{
        id: 'king-hussein-cancer',
        name: 'مركز الحسين للسرطان',
        institution: 'مركز الحسين للسرطان',
        description: 'علاج السرطان، المواعيد، رعاية المرضى، الاستشارات الطبية',
        color: 'hsl(0, 84%, 55%)',
        icon: '🎗️',
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
        icon: '🏥',
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
        icon: '🩺',
        rating: 4.7,
        responseTime: '3 دقائق',
        languages: ['العربية', 'English'],
        available: true
      }]
    },
    travel: {
      id: 'travel',
      name: 'السفر',
      icon: '✈️',
      color: 'hsl(24.6, 95%, 53.1%)',
      description: 'خدمات النقل والسياحة',
      agents: [{
        id: 'royal-jordanian',
        name: 'الملكية الأردنية',
        institution: 'الخطوط الجوية الملكية الأردنية',
        description: 'حجز الطيران، الحجوزات، الأمتعة، برنامج الولاء',
        color: 'hsl(24.6, 85%, 48%)',
        icon: '✈️',
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
        icon: '🚌',
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
        icon: '🗺️',
        rating: 4.6,
        responseTime: '2 دقيقة',
        languages: ['العربية', 'English', 'Français'],
        available: true
      }]
    }
  };

  // تهيئة التعرف على الصوت والتحويل للكلام
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'ar-SA';
      recognition.current.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
        setCurrentMessage(transcript);
      };
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }

    // Initialize Enhanced Audio Service for Gemini Live
    initializeGeminiAudioService();
  }, []);

  // Initialize Gemini Live Audio Service
  const initializeGeminiAudioService = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not found. Zoka agent will use fallback responses.');
      return;
    }

    const audioConfig: AudioServiceConfig = {
      apiKey: apiKey,
      onTextReceived: (text: string) => {
        // Add text response to chat if needed
        if (selectedAgent?.id === 'zoka') {
          addGeminiResponseToChat(text);
        }
      },
      onConnectionChange: (status) => {
        setGeminiConnectionStatus(status);
        console.log('Gemini connection status:', status);
      },
      onError: (error: string) => {
        console.error('Gemini Audio Service error:', error);
        setGeminiConnectionStatus('disconnected');
      }
    };

    enhancedAudioService.current = new EnhancedAudioService(audioConfig);
  };

  // Add Gemini response to chat
  const addGeminiResponseToChat = (text: string) => {
    if (!selectedAgent || !user) return;

    const agentMessage: Message = {
      id: Date.now(),
      sender: 'agent',
      text: text,
      timestamp: new Date().toISOString(),
      type: isVoiceCall ? 'voice' : 'text'
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), agentMessage]
    }));

    const conversationId = `${selectedAgent.id}_${new Date().toISOString().split('T')[0]}`;
    setConversations(prev => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        messages: [...(prev[conversationId]?.messages || []), agentMessage],
        lastActive: new Date().toISOString(),
        summary: `محادثة مع ${selectedAgent.name}`
      }
    }));

    setTimeout(scrollToBottom, 100);
  };

  // تحميل المحادثات المحفوظة
  useEffect(() => {
    if (user) {
      const savedConversations = localStorage.getItem(`conversations_${user.email}`);
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    }
  }, [user]);

  // حفظ المحادثات
  useEffect(() => {
    if (user && Object.keys(conversations).length > 0) {
      localStorage.setItem(`conversations_${user.email}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  // تسجيل الدخول
  const handleSignIn = () => {
    if (authForm.email && authForm.password) {
      const newUser: User = {
        id: `user_${authForm.email}`,
        name: authForm.name || 'أحمد الرشيد',
        email: authForm.email,
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
      setCurrentView('home');
    } else {
      alert('يرجى ملء جميع الحقول');
    }
  };

  // إنشاء حساب
  const handleSignUp = () => {
    if (authForm.name && authForm.email && authForm.password) {
      const newUser: User = {
        id: `user_${authForm.email}`,
        name: authForm.name,
        email: authForm.email,
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
      setCurrentView('home');
    } else {
      alert('يرجى ملء جميع الحقول');
    }
  };

  // البحث
  const searchResults = () => {
    if (!searchQuery.trim()) return [];
    const results: (Agent & {
      categoryName: string;
      categoryId: string;
    })[] = [];
    Object.values(categories).forEach(category => {
      category.agents.forEach(agent => {
        if (agent.name.includes(searchQuery) || agent.institution.includes(searchQuery) || agent.description.includes(searchQuery) || category.name.includes(searchQuery)) {
          results.push({
            ...agent,
            categoryName: category.name,
            categoryId: category.id
          });
        }
      });
    });
    return results;
  };

  // بدء المحادثة
  const startChat = (agent: Agent) => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    setSelectedAgent(agent);
    setCurrentView('chat');
    setIsVoiceCall(false);
    const conversationId = `${agent.id}_${new Date().toISOString().split('T')[0]}`;
    if (!conversations[conversationId]) {
      const newConversation: Conversation = {
        id: conversationId,
        agentId: agent.id,
        agentName: agent.name,
        agentInstitution: agent.institution,
        startTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        messages: [{
          id: 1,
          sender: 'agent',
          text: `أهلاً وسهلاً! مرحباً بك في ${agent.institution}. كيف يمكنني مساعدتك اليوم؟`,
          timestamp: new Date().toISOString(),
          type: 'text'
        }],
        summary: '',
        status: 'active'
      };
      setConversations(prev => ({
        ...prev,
        [conversationId]: newConversation
      }));
    }
    setChatMessages({
      [agent.id]: conversations[conversationId]?.messages || []
    });
  };

  // بدء المكالمة الصوتية
  const startVoiceCall = async (agent: Agent) => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    setSelectedAgent(agent);
    setCurrentView('voice');
    setIsVoiceCall(true);
    
    // Enhanced voice call for Zoka agent using Gemini Live
    if (agent.id === 'zoka' && enhancedAudioService.current) {
      try {
        console.log('Initializing Gemini Live for Zoka voice call...');
        await enhancedAudioService.current.initialize();
        await enhancedAudioService.current.connect();
        console.log('Gemini Live connected successfully for Zoka');
      } catch (error) {
        console.error('Failed to connect to Gemini Live for Zoka:', error);
        // Fallback to regular voice call
        setTimeout(() => {
          speak(`أهلاً وسهلاً! تم الاتصال بـ ${agent.institution}. كيف يمكنني مساعدتك؟`);
        }, 2000);
      }
    } else {
      // Regular voice call for other agents
      setTimeout(() => {
        speak(`أهلاً وسهلاً! تم الاتصال بـ ${agent.institution}. كيف يمكنني مساعدتك؟`);
      }, 2000);
    }
  };

  // Enhanced Zoka communication via Gemini Live API
  const sendZokaMessage = async (message: string) => {
    try {
      // Check if Gemini Live service is available and connected
      if (enhancedAudioService.current && enhancedAudioService.current.isConnected()) {
        console.log('Sending message via Gemini Live:', message);
        await enhancedAudioService.current.sendTextMessage(message);
        return; // Gemini will handle the response via callbacks
      } else {
        console.log('Gemini Live not connected, using webhook fallback');
        return await sendWebhookMessage(message, `session_${user?.id}_${Date.now()}`);
      }
    } catch (error) {
      console.error('Error sending message via Gemini Live, falling back to webhook:', error);
      return await sendWebhookMessage(message, `session_${user?.id}_${Date.now()}`);
    }
  };

  // إرسال رسالة عبر Webhook لـ Zoka (restored temporarily)
  const sendWebhookMessage = async (message: string, sessionId: string) => {
    try {
      const webhookUrl = 'https://0zr8zljh.rpcld.cc/webhook/zoka';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionID: sessionId,
          agentId: 'zoka',
          message: message,
          timestamp: new Date().toISOString(),
          userId: user?.id,
          conversationType: isVoiceCall ? 'voice' : 'text'
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.output || data.response || data.message || "أعتذر، لم أتمكن من الحصول على رد في الوقت الحالي. يرجى المحاولة مرة أخرى.";
      } else {
        console.error('Webhook response error:', response.status);
        return "أعتذر، هناك مشكلة في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.";
      }
    } catch (error) {
      console.error('Webhook error:', error);
      return "أعتذر، لا يمكنني الاستجابة في الوقت الحالي. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.";
    }
  };

  // إرسال رسالة
  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedAgent || !user) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: currentMessage,
      timestamp: new Date().toISOString(),
      type: isVoiceCall ? 'voice' : 'text'
    };
    setChatMessages(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), newMessage]
    }));

    // Auto-scroll to bottom after user message
    setTimeout(scrollToBottom, 50);

    // تحديث المحادثة
    const conversationId = `${selectedAgent.id}_${new Date().toISOString().split('T')[0]}`;
    setConversations(prev => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        messages: [...(prev[conversationId]?.messages || []), newMessage],
        lastActive: new Date().toISOString()
      }
    }));

    // معالجة خاصة لوكيل Zoka - إرسال عبر Webhook (temporarily restored)
    if (selectedAgent.id === 'zoka') {
      try {
        const webhookResponse = await sendZokaMessage(currentMessage);
        const agentMessage: Message = {
          id: Date.now() + 1,
          sender: 'agent',
          text: webhookResponse,
          timestamp: new Date().toISOString(),
          type: isVoiceCall ? 'voice' : 'text'
        };
        setChatMessages(prev => ({
          ...prev,
          [selectedAgent.id]: [...(prev[selectedAgent.id] || []), agentMessage]
        }));
        setConversations(prev => ({
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            messages: [...(prev[conversationId]?.messages || []), agentMessage],
            lastActive: new Date().toISOString(),
            summary: `محادثة مع ${selectedAgent.name}`
          }
        }));
        setTimeout(scrollToBottom, 100);
        if (isVoiceCall) {
          speak(webhookResponse);
        }
      } catch (error) {
        console.error('Error with Zoka webhook:', error);
      }
    } else {
      // معالجة الوكلاء الآخرين - محاكاة الردود
      setTimeout(() => {
        const responses: {
          [key: string]: string[];
        } = {
          'prime-ministry': ["يمكنني مساعدتك في السياسات الحكومية والإجراءات الرسمية وربطك بالأقسام المناسبة في الوزارة. ما هي الخدمة المحددة التي تحتاجها؟", "بخصوص التواصل الحكومي الرسمي واستفسارات السياسات، أنا هنا لمساعدتك. يرجى إخباري بسؤالك أو استفسارك المحدد."],
          'digital-economy': ["يمكنني مساعدتك في تراخيص الأعمال والخدمات الحكومية الإلكترونية ومبادرات التحول الرقمي. وقت المعالجة الحالي لتراخيص الأعمال هو 5-7 أيام عمل.", "بخصوص دعم ريادة الأعمال التقنية والخدمات الرقمية، يمكنني إرشادك عبر منصاتنا الإلكترونية. ما نوع الخدمة التي تبحث عنها؟"],
          'st-regis': ["أهلاً وسهلاً بكم في سانت ريجيس عمان. يمكنني مساعدتكم في الحجوزات وخدمة الخادم الشخصي المميزة والمرافق الفاخرة. كيف يمكنني جعل إقامتكم استثنائية؟", "لحجوزات الغرف، جناحنا الملكي متوفر في نهاية الأسبوع القادم. يمكنني أيضاً ترتيب خدمات السبا والمطاعم الفاخرة أو النقل."],
          'king-hussein-cancer': ["يمكنني مساعدتك في جدولة المواعيد مع أخصائيي الأورام لدينا. نوفر أيضاً خدمات دعم المرضى واستشارات الرأي الثاني.", "بخصوص خدمات رعاية السرطان، نقدم خطط علاجية شاملة. هل تود جدولة استشارة أم تحتاج معلومات حول برامجنا؟"],
          'royal-jordanian': ["يمكنني مساعدتك في حجوزات الطيران ومزايا النادي الملكي ومتطلبات السفر. رحلتنا القادمة إلى دبي تنطلق الساعة 14:30 مع توفر مقاعد.", "بخصوص معلومات وحجوزات الطيران، أنا هنا لمساعدتك. هل تبحث عن سفر محلي أم دولي؟"]
        };
        const agentResponses = responses[selectedAgent.id] || ["أفهم استفسارك. دعني أساعدك في ذلك. هل يمكنك تقديم تفاصيل أكثر حول ما تحتاج مساعدة فيه؟"];
        const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
        const agentMessage: Message = {
          id: Date.now() + 1,
          sender: 'agent',
          text: randomResponse,
          timestamp: new Date().toISOString(),
          type: isVoiceCall ? 'voice' : 'text'
        };
        setChatMessages(prev => ({
          ...prev,
          [selectedAgent.id]: [...(prev[selectedAgent.id] || []), agentMessage]
        }));
        setConversations(prev => ({
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            messages: [...(prev[conversationId]?.messages || []), agentMessage],
            lastActive: new Date().toISOString(),
            summary: `محادثة مع ${selectedAgent.name}`
          }
        }));
        // Auto-scroll to bottom after agent response
        setTimeout(scrollToBottom, 100);
        if (isVoiceCall) {
          speak(randomResponse);
        }
      }, 1500);
    }
    setCurrentMessage('');
  };

  // تبديل الاستماع
  const toggleListening = () => {
    // Enhanced voice functionality for Zoka with Gemini Live
    if (selectedAgent?.id === 'zoka' && enhancedAudioService.current?.isConnected()) {
      if (isListening) {
        enhancedAudioService.current.stopRecording();
        setIsListening(false);
        console.log('Stopped Gemini Live recording for Zoka');
      } else {
        enhancedAudioService.current.startRecording();
        setIsListening(true);
        console.log('Started Gemini Live recording for Zoka');
      }
    } else {
      // Regular voice recognition for other agents
      if (!recognition.current) return;
      if (isListening) {
        recognition.current.stop();
        setIsListening(false);
      } else {
        recognition.current.start();
        setIsListening(true);
      }
    }
  };

  // تحويل النص لكلام
  const speak = (text: string) => {
    if (!synthesis.current) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    utterance.lang = 'ar-SA';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthesis.current.speak(utterance);
  };

  // إنهاء المكالمة الصوتية
  const endVoiceCall = () => {
    // Stop regular synthesis and recognition
    if (synthesis.current) {
      synthesis.current.cancel();
    }
    if (recognition.current && isListening) {
      recognition.current.stop();
    }

    setIsVoiceCall(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentView('home');
  };

  // حذف محادثة
  const deleteConversation = (conversationId: string) => {
    setConversations(prev => {
      const newConversations = {
        ...prev
      };
      delete newConversations[conversationId];
      return newConversations;
    });
  };

  // صفحة التسجيل
  if (!user || currentView === 'auth') {
    return <div className="min-h-screen bg-white font-tajawal" dir="rtl">
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
              <button onClick={() => setAuthMode('signin')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${authMode === 'signin' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'}`}>
                تسجيل الدخول
              </button>
              <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${authMode === 'signup' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'}`}>
                إنشاء حساب
              </button>
            </div>

            <div className="space-y-4">
              {authMode === 'signup' && <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  <input type="text" value={authForm.name} onChange={e => setAuthForm(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="أحمد الرشيد" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 arabic-text" />
                </div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <input type="email" value={authForm.email} onChange={e => setAuthForm(prev => ({
                ...prev,
                email: e.target.value
              }))} placeholder="ahmed@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" dir="ltr" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                <input type="password" value={authForm.password} onChange={e => setAuthForm(prev => ({
                ...prev,
                password: e.target.value
              }))} placeholder="••••••••" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" dir="ltr" />
              </div>

              <button onClick={authMode === 'signin' ? handleSignIn : handleSignUp} disabled={!authForm.email || !authForm.password || authMode === 'signup' && !authForm.name} className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
                {authMode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>

              <p className="text-xs text-gray-500 text-center arabic-text">
                {authMode === 'signin' ? 'للتجربة: استخدم أي بريد إلكتروني وكلمة مرور صالحة' : 'ستتمكن من الوصول إلى جميع الخدمات فور إنشاء الحساب'}
              </p>
            </div>
          </div>
        </div>
      </div>;
  }

  // الصفحة الرئيسية
  if (currentView === 'home') {
    const searchResultsList = searchResults();
    return <div className="min-h-screen bg-gray-50 font-tajawal" dir="rtl">
        {/* الهيدر */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/favicon.png" alt="Mandaleen Logo" className="w-8 h-8 logo-icon" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">مندلين</h1>
                </div>
                <span className="text-sm text-gray-500 arabic-text">منصة الخدمات الموحدة للمواطن</span>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <History className="w-5 h-5" />
                  {Object.keys(conversations).length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full"></span>}
                </button>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="arabic-text">{user.name}</span>
                  <button onClick={() => {
                  setUser(null);
                  setAuthForm({
                    name: '',
                    email: '',
                    password: ''
                  });
                  setConversations({});
                  setCurrentView('auth');
                }} className="text-xs text-gray-400 hover:text-red-600 transition-colors mr-2">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* سايدبار سجل المحادثات */}
        {showHistory && <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg animate-slide-in-right">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold arabic-text">سجل المحادثات</h2>
                  <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg text-xl">
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-2 max-h-full overflow-y-auto">
                {Object.entries(conversations).length === 0 ? <p className="text-gray-500 text-center py-8 arabic-text">لا توجد محادثات بعد</p> : Object.entries(conversations).map(([id, conversation]) => <div key={id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm arabic-text">{conversation.agentName}</h3>
                        <button onClick={() => deleteConversation(id)} className="p-1 hover:bg-red-100 rounded text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-1 arabic-text">{conversation.agentInstitution}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(conversation.lastActive).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 arabic-text">
                        {conversation.messages.length} رسالة
                      </p>
                    </div>)}
              </div>
            </div>
          </div>}

        {/* قسم البطل */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 arabic-text">
                منصة واحدة، جميع الخدمات
              </h2>
              <p className="text-xl mb-8 text-orange-100 arabic-text">
                تحدث أو اتصل بوكلاء ذكيين من الحكومة والمنظمات والفنادق والمستشفيات وخدمات السفر
              </p>
              
              <div className="max-w-md mx-auto relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="ابحث عن المؤسسات أو الخدمات..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 arabic-text" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* نتائج البحث */}
          {searchQuery.trim() && <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 arabic-text">
                نتائج البحث ({searchResultsList.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {searchResultsList.map(agent => <div key={agent.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg emoji-icon" style={{
                      backgroundColor: agent.color
                    }}>
                            {agent.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm arabic-text">{agent.name}</h4>
                            <p className="text-xs text-gray-500 arabic-text">{agent.categoryName}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {agent.available ? 'متاح' : 'غير متصل'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-xs mb-3 arabic-text">{agent.description}</p>
                      
                      <div className="flex space-x-2 space-x-reverse">
                        <button onClick={() => startChat(agent)} disabled={!agent.available} className={`flex-1 flex items-center justify-center space-x-1 space-x-reverse py-2 px-3 rounded-lg text-sm font-medium transition-colors ${agent.available ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                          <MessageCircle className="w-3 h-3" />
                          <span>محادثة</span>
                        </button>
                        <button onClick={() => startVoiceCall(agent)} disabled={!agent.available} className={`flex-1 flex items-center justify-center space-x-1 space-x-reverse py-2 px-3 rounded-lg text-sm font-medium transition-colors ${agent.available ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                          <Phone className="w-3 h-3" />
                          <span>مكالمة</span>
                        </button>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>}

          {/* شبكة الفئات */}
          {!searchQuery.trim() && <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center arabic-text">فئات الخدمات</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {Object.values(categories).map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentView('category');
                    }}
                  />
                ))}
              </div>
            </div>}
        </div>
      </div>;
  }

  // صفحة الفئة
  if (currentView === 'category' && selectedCategory) {
    return <div className="min-h-screen bg-gray-50 font-tajawal" dir="rtl">
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <button onClick={() => setCurrentView('home')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 rtl-flip" />
              </button>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl emoji-icon" style={{
              backgroundColor: selectedCategory.color
            }}>
                {selectedCategory.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 arabic-text">{selectedCategory.name}</h2>
                <p className="text-sm text-gray-500 arabic-text">{selectedCategory.description}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCategory.agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onChat={() => startChat(agent)}
                onCall={() => startVoiceCall(agent)}
              />
            ))}
          </div>
        </div>
      </div>;
  }

  // واجهة المحادثة
  if (currentView === 'chat' && selectedAgent) {
    const messages = chatMessages[selectedAgent.id] || [];
    const currentConversations = Object.entries(conversations).filter(([id, conv]) => 
      conv.agentId === selectedAgent.id || Object.keys(conversations).length <= 10
    );
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex font-tajawal" dir="rtl">
        {/* Sidebar Overlay */}
        {showChatSidebar && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 transition-all duration-300"
            onClick={() => setShowChatSidebar(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transition-all duration-300 z-30 ${
          showChatSidebar ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 arabic-text">سجل المحادثات</h3>
                <button 
                  onClick={() => setShowChatSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {currentConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm arabic-text">لا توجد محادثات بعد</p>
                </div>
              ) : (
                currentConversations.map(([id, conversation]) => {
                  const category = Object.values(categories).find(cat => 
                    cat.agents.some(agent => agent.id === conversation.agentId)
                  );
                  const agent = category?.agents.find(agent => agent.id === conversation.agentId);
                  const isActive = conversation.agentId === selectedAgent?.id;
                  
                  return (
                    <div 
                      key={id} 
                      className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isActive 
                          ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200' 
                          : 'bg-white hover:bg-gray-50 border border-gray-100'
                      }`}
                      onClick={() => {
                        if (agent) {
                          startChat(agent);
                          setShowChatSidebar(false);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                          style={{ backgroundColor: agent?.color || '#6B7280' }}
                        >
                          {agent?.icon || '💬'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 text-sm arabic-text truncate">
                              {conversation.agentName}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {new Date(conversation.lastActive).toLocaleDateString('ar-SA', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 arabic-text truncate mb-1">
                            {conversation.agentInstitution}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 arabic-text">
                              {conversation.messages.length} رسالة
                            </span>
                            {conversation.messages.length > 0 && (
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <div className={`w-2 h-2 rounded-full ${
                                  conversation.status === 'active' ? 'bg-green-400' : 'bg-gray-300'
                                }`}></div>
                                <span className="text-xs text-gray-400">
                                  {conversation.status === 'active' ? 'نشط' : 'منتهي'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200/50">
              <button 
                onClick={() => {
                  setCurrentView('home');
                  setShowChatSidebar(false);
                }}
                className="w-full p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-medium text-sm transition-all duration-200 hover:shadow-lg"
              >
                بدء محادثة جديدة
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-white/20 px-6 py-4 sticky top-0 z-20">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center space-x-3 space-x-reverse">
                <button onClick={() => setCurrentView('home')} className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105">
                  <ArrowLeft className="w-5 h-5 rtl-flip text-gray-600" />
                </button>
                <button 
                  onClick={() => setShowChatSidebar(!showChatSidebar)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105 relative"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                  {Object.keys(conversations).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center">
                      {Object.keys(conversations).length > 9 ? '9+' : Object.keys(conversations).length}
                    </span>
                  )}
                </button>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg" style={{
                  backgroundColor: selectedAgent.color,
                  boxShadow: `0 4px 20px ${selectedAgent.color}40`
                }}>
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 arabic-text text-lg">{selectedAgent.name}</h2>
                  <p className="text-sm text-gray-500 arabic-text">{selectedAgent.institution}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse px-3 py-1 bg-green-50 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">متصل</span>
                </div>
                <button onClick={() => startVoiceCall(selectedAgent)} className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full transition-all duration-200 hover:scale-105 shadow-lg">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map(message => (
                <div key={message.id} className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'agent' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm mb-6" style={{
                      backgroundColor: selectedAgent.color
                    }}>
                      {selectedAgent.icon}
                    </div>
                  )}
                  <div className={`max-w-md lg:max-w-2xl px-5 py-4 rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-lg' 
                      : 'bg-white text-gray-800 rounded-bl-lg border border-gray-100'
                  }`}>
                    <MessageRenderer 
                      text={message.text}
                      isAgent={message.sender === 'agent'}
                      className="text-sm leading-relaxed"
                    />
                    <p className={`text-xs mt-3 text-right ${
                      message.sender === 'user' ? 'text-orange-100' : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="bg-gradient-to-t from-white/90 to-transparent backdrop-blur-sm p-4 sticky bottom-0 z-10">
            <div className="max-w-2xl mx-auto">
              <PromptBox 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onSendMessage={(message, file) => {
                  if (message.trim()) {
                    sendMessage();
                  }
                }}
                onVoiceToggle={toggleListening}
                isListening={isListening}
                placeholder="اكتب رسالتك..."
                className="w-full bg-white/95 shadow-xl border-0 rounded-full max-w-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // واجهة المكالمة الصوتية
  if (currentView === 'voice' && selectedAgent) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 flex items-center justify-center font-tajawal relative overflow-hidden" dir="rtl">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="text-center text-white relative z-10">
          <div className={`w-40 h-40 rounded-full flex items-center justify-center text-7xl mx-auto mb-8 shadow-2xl relative ${isSpeaking ? 'animate-pulse' : ''}`} style={{
          backgroundColor: selectedAgent.color,
          boxShadow: `0 0 60px ${selectedAgent.color}60, 0 0 120px ${selectedAgent.color}30`
        }}>
            {selectedAgent.icon}
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
            )}
          </div>
          
          <h2 className="text-3xl font-bold mb-3 arabic-text">{selectedAgent.name}</h2>
          <p className="text-orange-100 mb-6 arabic-text text-lg">{selectedAgent.institution}</p>
          
          <div className="flex items-center justify-center space-x-4 space-x-reverse mb-10">
            <div className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white/10 rounded-full backdrop-blur-md">
              <div className={`w-3 h-3 rounded-full ${isVoiceCall ? 'bg-green-400 animate-ping' : 'bg-gray-400'}`}></div>
              <span className="text-sm arabic-text font-medium">{isVoiceCall ? 'متصل' : 'غير متصل'}</span>
            </div>
          </div>
          
          {/* أدوات التحكم في المكالمة */}
          <div className="flex items-center justify-center space-x-8 space-x-reverse mb-10">
            <button onClick={toggleListening} className={`p-5 rounded-full transition-all duration-300 shadow-xl hover:scale-110 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
            }`}>
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            
            <button onClick={() => setCurrentView('chat')} className="p-5 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 backdrop-blur-md shadow-xl hover:scale-110">
              <MessageCircle className="w-7 h-7" />
            </button>
            
            <button onClick={endVoiceCall} className="p-5 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-300 shadow-xl hover:scale-110 shadow-red-500/50">
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
          
          {/* منطقة إدخال النص للمكالمة الصوتية */}
          <div className="max-w-xl mx-auto">
            <div className="bg-white/10 rounded-full p-3 backdrop-blur-md border border-white/20">
              <PromptBox 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onSendMessage={(message, file) => {
                  if (message.trim()) {
                    sendMessage();
                  }
                }}
                onVoiceToggle={toggleListening}
                isListening={isListening}
                placeholder="اكتب أو تحدث..."
                className="w-full bg-white/10 text-white placeholder-white/70 border-white/20 rounded-full"
              />
            </div>
          </div>
          
          {isSpeaking && (
            <div className="mt-6 flex items-center justify-center space-x-2 space-x-reverse">
              <div className="flex space-x-1 space-x-reverse">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-sm text-green-200 arabic-text font-medium">الوكيل يتحدث...</p>
            </div>
          )}
          
          {isListening && (
            <div className="mt-6 flex items-center justify-center space-x-2 space-x-reverse">
              <div className="flex space-x-1 space-x-reverse">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-400"></div>
              </div>
              <p className="text-sm text-yellow-200 arabic-text font-medium">الاستماع...</p>
            </div>
          )}
        </div>
      </div>;
  }
  return null;
};
export default Index;
