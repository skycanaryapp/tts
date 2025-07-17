import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Send, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PromptBox } from '@/components/ui/chatgpt-prompt-input';
import { MessageRenderer } from '@/components/MessageRenderer';
import { categories } from '@/data/categories';
import { config } from '@/config/environment';
import { formatArabicTime } from '@/utils/dateUtils';
import type { Agent, Message, Conversation } from '@/store/types';

export const ChatPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    conversations, 
    chatMessages, 
    currentMessage, 
    setCurrentMessage,
    addMessage,
    addConversation,
    updateConversation,
    loadConversationMessages,
    loading,
    setLoading,
    setError
  } = useAppStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agent, setAgent] = useState<Agent | null>(null);

  // Find agent by ID
  useEffect(() => {
    if (agentId) {
      const foundAgent = Object.values(categories)
        .flatMap(category => category.agents)
        .find(a => a.id === agentId);
      
      if (foundAgent) {
        setAgent(foundAgent);
        initializeConversation(foundAgent);
      } else {
        navigate('/');
      }
    }
  }, [agentId, navigate]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, agentId]);

  // Initialize conversation if it doesn't exist
  const initializeConversation = (agent: Agent) => {
    if (!user) return;
    
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
      
      addConversation(newConversation);
    }

    // Load existing conversation messages into chatMessages state
    const existingConversation = conversations[conversationId];
    if (existingConversation && existingConversation.messages.length > 0) {
      // Load messages directly from conversation
      loadConversationMessages(agent.id, existingConversation.messages);
    }
  };

  // Send message to Zoka via webhook
  const sendZokaMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch(config.zokaWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionID: `session_${user?.id}_${Date.now()}`,
          agentId: 'zoka',
          message: message,
          timestamp: new Date().toISOString(),
          userId: user?.id,
          conversationType: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.output || data.response || data.message || "أعتذر، لم أتمكن من الحصول على رد في الوقت الحالي. يرجى المحاولة مرة أخرى.";
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw new Error('أعتذر، لا يمكنني الاستجابة في الوقت الحالي. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    }
  };

  // Generate response for other agents
  const generateAgentResponse = (agentId: string): string => {
    const responses: Record<string, string[]> = {
      'prime-ministry': [
        "يمكنني مساعدتك في السياسات الحكومية والإجراءات الرسمية وربطك بالأقسام المناسبة في الوزارة. ما هي الخدمة المحددة التي تحتاجها؟",
        "بخصوص التواصل الحكومي الرسمي واستفسارات السياسات، أنا هنا لمساعدتك. يرجى إخباري بسؤالك أو استفسارك المحدد."
      ],
      'digital-economy': [
        "يمكنني مساعدتك في تراخيص الأعمال والخدمات الحكومية الإلكترونية ومبادرات التحول الرقمي. وقت المعالجة الحالي لتراخيص الأعمال هو 5-7 أيام عمل.",
        "بخصوص دعم ريادة الأعمال التقنية والخدمات الرقمية، يمكنني إرشادك عبر منصاتنا الإلكترونية. ما نوع الخدمة التي تبحث عنها؟"
      ],
      'st-regis': [
        "أهلاً وسهلاً بكم في سانت ريجيس عمان. يمكنني مساعدتكم في الحجوزات وخدمة الخادم الشخصي المميزة والمرافق الفاخرة. كيف يمكنني جعل إقامتكم استثنائية؟",
        "لحجوزات الغرف، جناحنا الملكي متوفر في نهاية الأسبوع القادم. يمكنني أيضاً ترتيب خدمات السبا والمطاعم الفاخرة أو النقل."
      ],
      'king-hussein-cancer': [
        "يمكنني مساعدتك في جدولة المواعيد مع أخصائيي الأورام لدينا. نوفر أيضاً خدمات دعم المرضى واستشارات الرأي الثاني.",
        "بخصوص خدمات رعاية السرطان، نقدم خطط علاجية شاملة. هل تود جدولة استشارة أم تحتاج معلومات حول برامجنا؟"
      ],
      'royal-jordanian': [
        "يمكنني مساعدتك في حجوزات الطيران ومزايا النادي الملكي ومتطلبات السفر. رحلتنا القادمة إلى دبي تنطلق الساعة 14:30 مع توفر مقاعد.",
        "بخصوص معلومات وحجوزات الطيران، أنا هنا لمساعدتك. هل تبحث عن سفر محلي أم دولي؟"
      ]
    };

    const agentResponses = responses[agentId] || [
      "أفهم استفسارك. دعني أساعدك في ذلك. هل يمكنك تقديم تفاصيل أكثر حول ما تحتاج مساعدة فيه؟"
    ];
    
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  // Send message
  const sendMessage = async () => {
    if (!currentMessage.trim() || !agent || !user) return;

    setLoading({ isLoading: true, operation: 'sending' });

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: currentMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // Add user message
    addMessage(agent.id, userMessage);
    
    const conversationId = `${agent.id}_${new Date().toISOString().split('T')[0]}`;
    updateConversation(conversationId, {
      messages: [...(conversations[conversationId]?.messages || []), userMessage],
      lastActive: new Date().toISOString()
    });

    const messageText = currentMessage;
    setCurrentMessage('');

    try {
      let agentResponseText: string;

      // Handle Zoka agent specially
      if (agent.id === 'zoka') {
        agentResponseText = await sendZokaMessage(messageText);
      } else {
        // Simulate network delay for other agents
        await new Promise(resolve => setTimeout(resolve, 1500));
        agentResponseText = generateAgentResponse(agent.id);
      }

      const agentMessage: Message = {
        id: Date.now() + 1,
        sender: 'agent',
        text: agentResponseText,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      addMessage(agent.id, agentMessage);
      updateConversation(conversationId, {
        messages: [...(conversations[conversationId]?.messages || []), agentMessage],
        lastActive: new Date().toISOString(),
        summary: `محادثة مع ${agent.name}`
      });

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'agent',
        text: 'أعتذر، حدث خطأ في الإرسال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      addMessage(agent.id, errorMessage);
      setError({
        id: Date.now().toString(),
        message: 'فشل في إرسال الرسالة',
        type: 'network',
        timestamp: new Date().toISOString(),
        context: { agentId: agent.id, error }
      });
    } finally {
      setLoading({ isLoading: false });
    }
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل المحادثة..." />
      </div>
    );
  }

  const messages = chatMessages[agent.id] || conversations[`${agent.id}_${new Date().toISOString().split('T')[0]}`]?.messages || [];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col font-tajawal" dir="rtl">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 px-2 py-2 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 space-x-reverse">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl-flip" />
            </button>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: agent.color }}
            >
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white arabic-text text-sm">{agent.name}</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button 
              onClick={() => navigate(`/voice/${agent.id}`)}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
              message.sender === 'user' 
                ? 'bg-orange-500 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-md'
            }`}>
              <MessageRenderer 
                text={message.text}
                isAgent={message.sender === 'agent'}
                className="text-sm"
              />
              <p className="text-xs opacity-60 mt-2 text-right">
                {formatArabicTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {loading.isLoading && loading.operation === 'sending' && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-4 py-3 shadow-md">
              <LoadingSpinner size="sm" text="يفكر..." />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-transparent p-4 sticky bottom-0 z-10">
        <div className="max-w-2xl mx-auto">
          <PromptBox 
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onSendMessage={(message, file) => {
              if (message.trim()) {
                sendMessage();
              }
            }}
            placeholder="اكتب رسالتك..."
            className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-gray-300/50 dark:border-gray-600/50"
            disabled={loading.isLoading}
          />
        </div>
      </div>
    </div>
  );
};
