import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/ui/tooltip';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

// Create a custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock user data for testing
export const mockUser = {
  id: 'test-user-1',
  name: 'أحمد التجريبي',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  isVerified: true,
};

// Mock agent data
export const mockAgent = {
  id: 'test-agent',
  name: 'وكيل تجريبي',
  institution: 'مؤسسة تجريبية',
  description: 'وصف تجريبي للوكيل',
  color: 'hsl(24.6, 95%, 53.1%)',
  icon: '🤖',
  rating: 4.5,
  responseTime: '2 دقيقة',
  languages: ['العربية', 'English'],
  available: true,
};

// Mock conversation data
export const mockConversation = {
  id: 'test-conversation',
  agentId: 'test-agent',
  agentName: 'وكيل تجريبي',
  agentInstitution: 'مؤسسة تجريبية',
  startTime: '2024-01-01T00:00:00.000Z',
  lastActive: '2024-01-01T00:00:00.000Z',
  messages: [
    {
      id: 1,
      sender: 'agent' as const,
      text: 'مرحباً! كيف يمكنني مساعدتك؟',
      timestamp: '2024-01-01T00:00:00.000Z',
      type: 'text' as const,
    },
    {
      id: 2,
      sender: 'user' as const,
      text: 'أحتاج مساعدة في الخدمات',
      timestamp: '2024-01-01T00:01:00.000Z',
      type: 'text' as const,
    },
  ],
  summary: 'محادثة تجريبية',
  status: 'active' as const,
};

// Custom matchers for Arabic text
export const arabicTextMatchers = {
  toContainArabicText: (received: string, expected: string) => {
    const pass = received.includes(expected);
    return {
      message: () =>
        pass
          ? `Expected "${received}" not to contain Arabic text "${expected}"`
          : `Expected "${received}" to contain Arabic text "${expected}"`,
      pass,
    };
  },
};

// re-export everything
export * from '@testing-library/react';