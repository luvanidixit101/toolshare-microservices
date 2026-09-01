import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Paperclip, Search, ArrowLeft, MessageSquare } from 'lucide-react';
import { getConversations, getMessages, sendMessage } from '@/services/chat';
import type { Conversation, ChatMessage } from '@/types';
import { timeAgo, formatDateTime, classNames } from '@/utils';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { toast } from '@/components/common/Toast';

export default function Chat() {
  const [searchParams] = useSearchParams();
  const paramOwnerId = searchParams.get('ownerId');
  const paramOwnerName = searchParams.get('ownerName');
  const paramToolName = searchParams.get('toolName');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mobileChat, setMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getConversations()
      .then((convs) => {
        let target = convs[0] || null;
        let updatedConvs = [...convs];

        if (paramOwnerId || paramOwnerName) {
          const found = convs.find(
            (c) =>
              (paramOwnerId && c.participantId === paramOwnerId) ||
              (paramOwnerName && c.participantName.toLowerCase() === paramOwnerName.toLowerCase())
          );
          if (found) {
            target = found;
          } else {
            const newConv: Conversation = {
              id: 'conv-' + (paramOwnerId || Date.now()),
              participantId: paramOwnerId || 'u-owner',
              participantName: paramOwnerName || 'Tool Owner',
              lastMessage: paramToolName ? `Inquiring about ${paramToolName}` : 'New conversation',
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0,
              online: true,
            };
            updatedConvs = [newConv, ...convs];
            target = newConv;
          }
          setMobileChat(true);
          if (paramToolName) {
            setInput(`Hi ${paramOwnerName || 'there'}, I am interested in renting your ${paramToolName}! Is it available?`);
          }
        }

        setConversations(updatedConvs);
        setActiveConv(target);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e?.message || 'Failed to load conversations');
      })
      .finally(() => setLoading(false));
  }, [paramOwnerId, paramOwnerName, paramToolName]);

  useEffect(() => {
    if (!activeConv) return;
    setMsgLoading(true);
    getMessages(activeConv.id)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false));
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    try {
      const msg = await sendMessage({ conversationId: activeConv.id, text });
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) => c.id === activeConv.id ? { ...c, lastMessage: text, lastMessageAt: msg.sentAt, unreadCount: 0 } : c)
      );
    } catch {
      toast('error', 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <FullPageSpinner label="Loading conversations..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

      {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {!error && conversations.length === 0 && (
        <EmptyState
          title="No conversations yet"
          message="Start chatting with tool owners when you book a tool."
          icon={<MessageSquare size={28} />}
        />
      )}

      {!error && conversations.length > 0 && (
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Conversation list */}
            <div className={classNames(
              'w-full md:w-80 border-r border-gray-200 flex flex-col',
              mobileChat && 'hidden md:flex'
            )}>
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="input pl-9 text-sm py-2"
                  />
                </div>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => { setActiveConv(conv); setMobileChat(true); }}
                    className={classNames(
                      'w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left',
                      activeConv?.id === conv.id && 'bg-primary-50'
                    )}
                  >
                    <div className="relative shrink-0">
                      {conv.participantAvatar ? (
                        <img src={conv.participantAvatar} alt={conv.participantName} className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                          {conv.participantName[0]}
                        </div>
                      )}
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900 truncate">{conv.participantName}</p>
                        <span className="text-xs text-gray-400 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="badge bg-primary-600 text-white px-2 py-0.5 shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat window */}
            <div className={classNames(
              'flex-1 flex flex-col',
              !mobileChat && 'hidden md:flex'
            )}>
              {activeConv ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                    <button onClick={() => setMobileChat(false)} className="md:hidden text-gray-400">
                      <ArrowLeft size={20} />
                    </button>
                    {activeConv.participantAvatar ? (
                      <img src={activeConv.participantAvatar} alt={activeConv.participantName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                        {activeConv.participantName[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{activeConv.participantName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {activeConv.online ? (
                          <><span className="w-2 h-2 rounded-full bg-green-500" /> Online</>
                        ) : (
                          'Offline'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {msgLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello!</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={classNames('flex', msg.mine ? 'justify-end' : 'justify-start')}>
                          <div className={classNames(
                            'max-w-[75%] rounded-2xl px-4 py-2.5',
                            msg.mine
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                          )}>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p className={classNames('text-xs mt-1', msg.mine ? 'text-primary-100' : 'text-gray-400')}>
                              {formatDateTime(msg.sentAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <button className="w-10 h-10 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center shrink-0">
                        <Paperclip size={20} />
                      </button>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-400">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
