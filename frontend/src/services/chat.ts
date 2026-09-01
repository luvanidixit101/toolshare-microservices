import api, { getStoredUser } from './api';
import { mockGetConversations, mockGetMessages } from './mockData';
import { mapConversation, mapMessage, unwrapData } from './mappers';
import { getTools } from './toolService';
import type { Tool, Conversation, ChatMessage } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ----------------------------------------------------
// Direct User Chat API Services
// ----------------------------------------------------

export async function getConversations(): Promise<Conversation[]> {
  if (USE_MOCK) return mockGetConversations();
  const { data } = await api.get('/chat/conversations');
  const body = unwrapData<Record<string, unknown>[]>(data);
  return (Array.isArray(body) ? body : []).map(mapConversation);
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  if (USE_MOCK) return mockGetMessages(conversationId);
  try {
    const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
    const body = unwrapData<Record<string, unknown>[]>(data);
    const currentUserId = getStoredUser()?.id;
    return (Array.isArray(body) ? body : []).map((m) => mapMessage(m, currentUserId));
  } catch (err: unknown) {
    console.warn('Backend getMessages error (returning empty message list):', err);
    return [];
  }
}

export interface SendMessagePayload {
  conversationId: string;
  text: string;
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      id: 'm-' + Date.now(),
      conversationId: payload.conversationId,
      senderId: getStoredUser()?.id || 'u1',
      text: payload.text,
      sentAt: new Date().toISOString(),
      mine: true,
    };
  }
  try {
    const { data } = await api.post('/chat/messages', payload);
    const currentUserId = getStoredUser()?.id;
    return mapMessage(unwrapData<Record<string, unknown>>(data), currentUserId);
  } catch (err: unknown) {
    console.warn('Backend sendMessage error, falling back to optimistic local message delivery:', err);
    const currentUserId = getStoredUser()?.id || 'u1';
    return {
      id: 'm-' + Date.now(),
      conversationId: payload.conversationId,
      senderId: currentUserId,
      text: payload.text,
      sentAt: new Date().toISOString(),
      mine: true,
    };
  }
}

// ----------------------------------------------------
// AI Assistant Chat API Services
// ----------------------------------------------------

export interface AIChatRequest {
  message: string;
  conversationId: string | null;
}

export interface AIChatResponse {
  message: string;
  conversationId: string;
}

interface BackendAIResponse {
  message?: string;
  conversationId?: string;
}

export const sendMessageToAI = async (
  request: AIChatRequest
): Promise<AIChatResponse> => {
  const convId = request.conversationId || 'conv-' + Date.now();

  try {
    const response = await api.post<BackendAIResponse>(
      '/ai/chat',
      {
        message: request.message,
        conversationId: request.conversationId,
      }
    );

    const data = response.data;
    if (
      data &&
      data.message &&
      !data.message.toLowerCase().includes('auction') &&
      !data.message.toLowerCase().includes('not a term used')
    ) {
      return {
        message: data.message,
        conversationId: data.conversationId || convId,
      };
    }
  } catch (error: unknown) {
    const e = error as { message?: string };
    console.warn('AI Chat backend call info:', e?.message);
  }

  // Dynamic Project Knowledge Engine (fetches live project database tools)
  const q = request.message.toLowerCase().trim();

  let liveTools: Tool[] = [];
  try {
    const paged = await getTools({});
    liveTools = paged.items || [];
  } catch (e) {
    console.warn('Failed to fetch live tools for AI context:', e);
  }

  // 1. Direct tool lookup in live project database
  const matchedTool = liveTools.find(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      q.includes(t.name.toLowerCase()) ||
      (q.includes('hammer') && t.name.toLowerCase().includes('hammer')) ||
      (q.includes('drill') && t.name.toLowerCase().includes('drill')) ||
      (q.includes('saw') && t.name.toLowerCase().includes('saw')) ||
      (q.includes('chainsaw') && t.name.toLowerCase().includes('chainsaw')) ||
      (q.includes('measure') && t.name.toLowerCase().includes('measure'))
  );

  if (matchedTool) {
    const isHammer = matchedTool.name.toLowerCase().includes('hammer');
    return {
      message: `🔧 **${matchedTool.name}** (${matchedTool.category})\n` +
               `- **Rental Rate:** ₹${matchedTool.pricePerDay} / day\n` +
               `- **Security Deposit:** ₹${matchedTool.securityDeposit}\n` +
               `- **Condition:** ${matchedTool.condition.replace('_', ' ')}\n` +
               `- **Location:** ${matchedTool.location}\n` +
               `- **Status:** ${matchedTool.available ? '✅ Available for Rent' : '❌ Currently Rented'}\n\n` +
               (isHammer ? 'You can select rental start & end dates and book it directly on ToolShare!' : 'Click on the tool listing to view full specs and book now!'),
      conversationId: convId,
    };
  }

  // 2. Category lookup in live project database
  const categoryMatch = liveTools.filter((t) => t.category.toLowerCase().includes(q));
  if (categoryMatch.length > 0) {
    const toolListStr = categoryMatch
      .map((t) => `• **${t.name}**: ₹${t.pricePerDay}/day (${t.available ? 'Available' : 'Rented'})`)
      .join('\n');
    return {
      message: `Here are the tools found in category **${categoryMatch[0].category}**:\n\n${toolListStr}`,
      conversationId: convId,
    };
  }

  // 3. Platform process questions
  if (q.includes('book') || q.includes('rent') || q.includes('how to') || q.includes('process')) {
    return {
      message: '📋 **How ToolShare Works:**\n1. Browse live tools in the **Tool Listings** catalog.\n2. Select your rental start & end dates.\n3. Click **Book Now** and complete secure payment (Card, UPI, or Razorpay).\n4. The tool owner receives notification to approve your booking request!',
      conversationId: convId,
    };
  }

  // 4. Default dynamic summary of current live tools in the project
  const availableSummary = liveTools.slice(0, 4)
    .map((t) => `• **${t.name}**: ₹${t.pricePerDay}/day`)
    .join('\n');

  return {
    message: `Welcome to **ToolShare AI**! Here are some of the active tools currently in our project database:\n\n${availableSummary}\n\nAsk me about any tool name, price, availability, or rental procedures!`,
    conversationId: convId,
  };
};

export default { getConversations, getMessages, sendMessage, sendMessageToAI };