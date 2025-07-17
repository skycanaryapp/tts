import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PromptBox } from '@/components/ui/chatgpt-prompt-input';
import { categories } from '@/data/categories';
import { config } from '@/config/environment';
import type { Agent, Message } from '@/store/types';

export const VoicePage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentMessage, 
    setCurrentMessage,
    isListening,
    setListening,
    isSpeaking,
    setSpeaking,
    addMessage,
    updateConversation,
    loading,
    setLoading,
    setError
  } = useAppStore();

  const [agent, setAgent] = useState<Agent | null>(null);
  const recognition = useRef<any>(null);
  const synthesis = useRef<any>(null);

  // Find agent by ID
  useEffect(() => {
    if (agentId) {
      const foundAgent = Object.values(categories)
        .flatMap(category => category.agents)
        .find(a => a.id === agentId);
      
      if (foundAgent) {
        setAgent(foundAgent);
        initializeVoiceCall(foundAgent);
      } else {
        navigate('/');
      }
    }
  }, [agentId, navigate]);

  // Initialize voice recognition and synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'ar-SA';
      
      recognition.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setCurrentMessage(transcript);
      };
      
      recognition.current.onend = () => {
        setListening(false);
      };
      
      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        setError({
          id: Date.now().toString(),
          message: 'خطأ في التعرف على الصوت',
          type: 'general',
          timestamp: new Date().toISOString(),
          context: { error: event.error }
        });
      };
    }

    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, [setCurrentMessage, setListening, setError]);

  // Initialize voice call
  const initializeVoiceCall = (agent: Agent) => {
    if (!user) return;
    
    setTimeout(() => {
      speak(`أهلاً وسهلاً! تم الاتصال بـ ${agent.institution}. كيف يمكنني مساعدتك؟`);
    }, 2000);
  };

  // Text to speech
  const speak = (text: string) => {
    if (!synthesis.current) return;
    
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    utterance.lang = 'ar-SA';
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    synthesis.current.speak(utterance);
  };

  // Toggle listening
  const toggleListening = () => {
    if (!recognition.current) {
      setError({
        id: Date.now().toString(),
        message: 'التعرف على الصوت غير مدعوم في هذا المتصفح',
        type: 'general',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setListening(false);
    } else {
      recognition.current.start();
      setListening(true);
    }
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!currentMessage.trim() || !agent || !user) return;

    setLoading({ isLoading: true, operation: 'sending' });

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: currentMessage,
      timestamp: new Date().toISOString(),
      type: 'voice'
    };

    addMessage(agent.id, userMessage);
    
    const conversationId = `${agent.id}_${new Date().toISOString().split('T')[0]}`;
    updateConversation(conversationId, {
      lastActive: new Date().toISOString()
    });

    const messageText = currentMessage;
    setCurrentMessage('');

    try {
      let agentResponseText: string;

      // Handle Zoka agent specially
      if (agent.id === 'zoka') {
        const response = await fetch(config.zokaWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionID: `session_${user.id}_${Date.now()}`,
            agentId: 'zoka',
            message: messageText,
            timestamp: new Date().toISOString(),
            userId: user.id,
            conversationType: 'voice'
          })
        });

        if (response.ok) {
          const data = await response.json();
          agentResponseText = data.output || data.response || data.message || "أعتذر، لم أتمكن من الحصول على رد في الوقت الحالي.";
        } else {
          throw new Error('Webhook response error');
        }
      } else {
        // Simulate response for other agents
        await new Promise(resolve => setTimeout(resolve, 1500));
        agentResponseText = "شكراً لك على المكالمة. تم تسجيل طلبك وسنقوم بالرد عليك قريباً.";
      }

      const agentMessage: Message = {
        id: Date.now() + 1,
        sender: 'agent',
        text: agentResponseText,
        timestamp: new Date().toISOString(),
        type: 'voice'
      };

      addMessage(agent.id, agentMessage);
      updateConversation(conversationId, {
        lastActive: new Date().toISOString(),
        summary: `مكالمة صوتية مع ${agent.name}`
      });

      // Speak the response
      speak(agentResponseText);

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'agent',
        text: 'أعتذر، حدث خطأ في المكالمة. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toISOString(),
        type: 'voice'
      };
      
      addMessage(agent.id, errorMessage);
      speak(errorMessage.text);
      
      setError({
        id: Date.now().toString(),
        message: 'فشل في إرسال الرسالة الصوتية',
        type: 'network',
        timestamp: new Date().toISOString(),
        context: { agentId: agent.id, error }
      });
    } finally {
      setLoading({ isLoading: false });
    }
  };

  // End voice call
  const endVoiceCall = () => {
    if (synthesis.current) {
      synthesis.current.cancel();
    }
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
    
    setListening(false);
    setSpeaking(false);
    navigate('/');
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل المكالمة..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center font-tajawal" dir="rtl">
      <div className="text-center text-white">
        <div 
          className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 emoji-icon ${
            isSpeaking ? 'animate-pulse-orange' : ''
          }`}
          style={{ backgroundColor: agent.color }}
        >
          {agent.icon}
        </div>
        
        <h2 className="text-2xl font-bold mb-2 arabic-text">{agent.name}</h2>
        <p className="text-green-100 mb-8 arabic-text">{agent.institution}</p>
        
        <div className="flex items-center justify-center space-x-4 space-x-reverse mb-8">
          <div className="w-3 h-3 rounded-full bg-green-300 animate-ping"></div>
          <span className="text-sm arabic-text">متصل</span>
        </div>
        
        {/* Call controls */}
        <div className="flex items-center justify-center space-x-6 space-x-reverse mb-8">
          <button 
            onClick={toggleListening}
            disabled={loading.isLoading}
            className={`p-4 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => navigate(`/chat/${agent.id}`)}
            className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          
          <button 
            onClick={endVoiceCall}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
        
        {/* Voice input area */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white/10 rounded-lg p-2">
            <PromptBox 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onSendMessage={(message, file) => {
                if (message.trim()) {
                  sendVoiceMessage();
                }
              }}
              onVoiceToggle={toggleListening}
              isListening={isListening}
              placeholder="اكتب أو تحدث..."
              className="w-full bg-transparent text-white placeholder-white/70"
              style={{
                backgroundColor: 'transparent',
                color: 'white'
              }}
              disabled={loading.isLoading}
            />
          </div>
        </div>
        
        {/* Status indicators */}
        {loading.isLoading && (
          <div className="mt-4">
            <LoadingSpinner size="sm" text="جاري الإرسال..." />
          </div>
        )}
        
        {isSpeaking && (
          <p className="mt-4 text-sm text-green-100 arabic-text">الوكيل يتحدث...</p>
        )}
        
        {isListening && (
          <p className="mt-4 text-sm text-yellow-100 arabic-text">الاستماع...</p>
        )}
      </div>
    </div>
  );
};