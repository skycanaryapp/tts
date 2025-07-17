import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { categories } from '@/data/categories';
import AgentCard from '@/components/AgentCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Agent } from '@/store/types';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const category = categoryId ? categories[categoryId] : null;

  const handleAgentChat = (agent: Agent) => {
    navigate(`/chat/${agent.id}`);
  };

  const handleAgentCall = (agent: Agent) => {
    navigate(`/voice/${agent.id}`);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4 arabic-text">الفئة غير موجودة</h2>
          <button 
            onClick={() => navigate('/')}
            className="text-orange-600 hover:text-orange-700"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-tajawal" dir="rtl">
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 space-x-reverse">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 rtl-flip" />
            </button>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl emoji-icon"
              style={{ backgroundColor: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 arabic-text">{category.name}</h2>
              <p className="text-sm text-gray-500 arabic-text">{category.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{category.agents.length} وكيل متاح</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onChat={() => handleAgentChat(agent)}
              onCall={() => handleAgentCall(agent)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
