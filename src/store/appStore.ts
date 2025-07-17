import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  ViewType, 
  Category, 
  Agent, 
  Conversation, 
  Message, 
  LoadingState, 
  AppError 
} from './types';

interface AppState {
  // UI State
  currentView: ViewType;
  selectedCategory: Category | null;
  selectedAgent: Agent | null;
  showHistory: boolean;
  
  // Chat State
  conversations: Record<string, Conversation>;
  chatMessages: Record<string, Message[]>;
  currentMessage: string;
  
  // Voice State
  isVoiceCall: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  
  // Search State
  searchQuery: string;
  
  // Loading & Error State
  loading: LoadingState;
  error: AppError | null;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setShowHistory: (show: boolean) => void;
  setCurrentMessage: (message: string) => void;
  setSearchQuery: (query: string) => void;
  setVoiceCall: (isVoice: boolean) => void;
  setListening: (isListening: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  
  // Chat Actions
  addMessage: (agentId: string, message: Message) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  deleteConversation: (conversationId: string) => void;
  clearConversations: () => void;
  loadConversationMessages: (agentId: string, messages: Message[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      currentView: 'auth',
      selectedCategory: null,
      selectedAgent: null,
      showHistory: false,
      
      // Chat State
      conversations: {},
      chatMessages: {},
      currentMessage: '',
      
      // Voice State
      isVoiceCall: false,
      isListening: false,
      isSpeaking: false,
      
      // Search State
      searchQuery: '',
      
      // Loading & Error State
      loading: { isLoading: false },
      error: null,
      
      // Actions
      setCurrentView: (view: ViewType) => set({ currentView: view }),
      
      setSelectedCategory: (category: Category | null) => set({ selectedCategory: category }),
      
      setSelectedAgent: (agent: Agent | null) => set({ selectedAgent: agent }),
      
      setShowHistory: (show: boolean) => set({ showHistory: show }),
      
      setCurrentMessage: (message: string) => set({ currentMessage: message }),
      
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      setVoiceCall: (isVoice: boolean) => set({ isVoiceCall: isVoice }),
      
      setListening: (isListening: boolean) => set({ isListening }),
      
      setSpeaking: (isSpeaking: boolean) => set({ isSpeaking }),
      
      setLoading: (loading: LoadingState) => set({ loading }),
      
      setError: (error: AppError | null) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      // Chat Actions
      addMessage: (agentId: string, message: Message) => {
        const { chatMessages } = get();
        set({
          chatMessages: {
            ...chatMessages,
            [agentId]: [...(chatMessages[agentId] || []), message]
          }
        });
      },
      
      addConversation: (conversation: Conversation) => {
        const { conversations } = get();
        set({
          conversations: {
            ...conversations,
            [conversation.id]: conversation
          }
        });
      },
      
      updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
        const { conversations } = get();
        const existing = conversations[conversationId];
        if (existing) {
          set({
            conversations: {
              ...conversations,
              [conversationId]: { ...existing, ...updates }
            }
          });
        }
      },
      
      deleteConversation: (conversationId: string) => {
        const { conversations } = get();
        const newConversations = { ...conversations };
        delete newConversations[conversationId];
        set({ conversations: newConversations });
      },
      
      clearConversations: () => set({ conversations: {}, chatMessages: {} }),
      
      loadConversationMessages: (agentId: string, messages: Message[]) => {
        set({
          chatMessages: {
            [agentId]: messages
          }
        });
      },
    }),
    {
      name: 'mandaleen-app-state',
      partialize: (state) => ({
        conversations: state.conversations,
        chatMessages: state.chatMessages,
      }),
    }
  )
);