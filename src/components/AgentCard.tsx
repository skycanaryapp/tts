import React from 'react';
import { MessageCircle, Phone, Star } from 'lucide-react';
import type { Agent } from '@/store/types';
import { iconMap } from '@/lib/icon-map';

interface AgentCardProps {
  agent: Agent;
  onChat: () => void;
  onCall: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onChat, onCall }) => {
  const IconComponent = iconMap[agent.icon as keyof typeof iconMap] || iconMap.HelpCircle;

  return (
    <div className="relative group p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
      <div 
        className="absolute -top-1/4 -right-1/4 w-48 h-48 rounded-full opacity-5 group-hover:opacity-10 transition-all duration-500"
        style={{ backgroundColor: agent.color, filter: 'blur(40px)' }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all duration-300"
              style={{ backgroundColor: agent.color }}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white arabic-text">{agent.name}</h3>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {agent.available ? 'متاح' : 'غير متصل'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 arabic-text">{agent.description}</p>
        <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span>{agent.rating}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {agent.languages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {lang}
            </span>
          ))}
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={onChat}
            disabled={!agent.available}
            className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse py-2 px-4 rounded-lg font-medium transition-colors ${agent.available ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>محادثة</span>
          </button>
          <button
            onClick={onCall}
            disabled={!agent.available}
            className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse py-2 px-4 rounded-lg font-medium transition-colors ${agent.available ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Phone className="w-4 h-4" />
            <span>مكالمة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
