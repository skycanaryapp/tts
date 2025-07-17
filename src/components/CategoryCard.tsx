import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Category } from '@/store/types';
import { iconMap } from '@/lib/icon-map';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || iconMap.HelpCircle;

  return (
    <div
      onClick={onClick}
      className="relative group p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div 
        className="absolute -top-1/4 -right-1/4 w-48 h-48 rounded-full opacity-5 group-hover:opacity-10 transition-all duration-500"
        style={{ backgroundColor: category.color, filter: 'blur(40px)' }}
      />
      <div className="relative z-10">
        <div
          className="w-16 h-16 mb-4 rounded-full flex items-center justify-center text-white transition-all duration-300"
          style={{ backgroundColor: category.color }}
        >
          <IconComponent className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{category.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{category.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{category.agents.length} وكيل</span>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl-flip" />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
