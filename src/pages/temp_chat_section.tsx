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