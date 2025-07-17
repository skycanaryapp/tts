import React from 'react';
import { Search, User, History, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '@/components/CategoryCard';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SEOHead } from '@/components/SEOHead';
import { categories } from '@/data/categories';
import { formatConversationDate } from '@/utils/dateUtils';
import type { Agent, Category } from '@/store/types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { 
    searchQuery, 
    setSearchQuery, 
    showHistory, 
    setShowHistory,
    conversations,
    deleteConversation,
    loading 
  } = useAppStore();

  // Search functionality
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results: (Agent & { categoryName: string; categoryId: string })[] = [];
    Object.values(categories).forEach(category => {
      category.agents.forEach(agent => {
        if (
          agent.name.includes(searchQuery) ||
          agent.institution.includes(searchQuery) ||
          agent.description.includes(searchQuery) ||
          category.name.includes(searchQuery)
        ) {
          results.push({
            ...agent,
            categoryName: category.name,
            categoryId: category.id
          });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleCategoryClick = (category: Category) => {
    navigate(`/category/${category.id}`);
  };

  const handleAgentChat = (agent: Agent) => {
    navigate(`/chat/${agent.id}`);
  };

  const handleAgentCall = (agent: Agent) => {
    navigate(`/voice/${agent.id}`);
  };

  const handleConversationClick = (conversationId: string) => {
    const conversation = conversations[conversationId];
    if (conversation) {
      navigate(`/chat/${conversation.agentId}`);
      setShowHistory(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/auth');
  };

  if (loading.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل الصفحة الرئيسية..." />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="الصفحة الرئيسية - مندلين"
        description="منصة مندلين للخدمات الذكية الموحدة. تواصل مع الحكومة والمنظمات والفنادق والمستشفيات وخدمات السفر"
        keywords="مندلين، خدمات ذكية، الأردن، حكومة، فنادق، مستشفيات، سفر"
      />
      <div className="min-h-screen bg-gray-50 font-tajawal" dir="rtl">
      {/* Header */}
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
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <History className="w-5 h-5" />
                {Object.keys(conversations).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full" />
                )}
              </button>
              
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="arabic-text">{user?.name}</span>
                <button 
                  onClick={handleSignOut}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors mr-2"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg animate-slide-in-right">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold arabic-text">سجل المحادثات</h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2 max-h-full overflow-y-auto">
              {Object.entries(conversations).length === 0 ? (
                <p className="text-gray-500 text-center py-8 arabic-text">لا توجد محادثات بعد</p>
              ) : (
                Object.entries(conversations).map(([id, conversation]) => (
                  <div 
                    key={id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleConversationClick(id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm arabic-text">{conversation.agentName}</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                        aria-label={`حذف محادثة ${conversation.agentName}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 arabic-text">{conversation.agentInstitution}</p>
                    <p className="text-xs text-gray-400 mb-1">
                      {formatConversationDate(conversation.lastActive)}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 arabic-text">
                        {conversation.messages.length} رسالة
                      </p>
                      <ChevronRight className="w-3 h-3 text-gray-400 rtl-flip" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
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
              <input
                type="text"
                placeholder="ابحث عن المؤسسات أو الخدمات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 arabic-text"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 arabic-text">
              نتائج البحث ({searchResults.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {searchResults.map((agent) => (
                <div key={agent.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg emoji-icon"
                          style={{ backgroundColor: agent.color }}
                        >
                          {agent.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm arabic-text">{agent.name}</h4>
                          <p className="text-xs text-gray-500 arabic-text">{agent.categoryName}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {agent.available ? 'متاح' : 'غير متصل'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-xs mb-3 arabic-text">{agent.description}</p>
                    
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleAgentChat(agent)}
                        disabled={!agent.available}
                        className={`flex-1 flex items-center justify-center space-x-1 space-x-reverse py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          agent.available 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span>محادثة</span>
                      </button>
                      <button 
                        onClick={() => handleAgentCall(agent)}
                        disabled={!agent.available}
                        className={`flex-1 flex items-center justify-center space-x-1 space-x-reverse py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          agent.available 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span>مكالمة</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {!searchQuery.trim() && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center arabic-text">فئات الخدمات</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {Object.values(categories).map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};
