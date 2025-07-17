// Store types for better type safety
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface Agent {
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

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  agents: Agent[];
}

export interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  type: 'text' | 'voice';
}

export interface Conversation {
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

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'validation' | 'auth' | 'general';
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export type ViewType = 'auth' | 'home' | 'category' | 'chat' | 'voice' | 'profile' | 'settings';
export type AuthMode = 'signin' | 'signup' | 'forgot-password';