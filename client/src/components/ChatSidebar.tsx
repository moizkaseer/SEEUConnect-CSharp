import React, { useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';

interface ChatMessage {
  id: number;
  content: string;
  sentAt: string;
  username: string;
}

const ChatSidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isAuthenticated]);

  // Load message history and establish SignalR connection
  useEffect(() => {
    if (!isAuthenticated || !user?.token) return;

    // Load existing messages
    const loadMessages = async () => {
      try {
        const response = await fetch(`${API_CONFIG.CHAT.GET_MESSAGES}?count=50`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      }
    };

    loadMessages();

    // Build SignalR connection
    const newConnection = new HubConnectionBuilder()
      .withUrl(API_CONFIG.CHAT.HUB_URL, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    // Listen for incoming messages
    newConnection.on('ReceiveMessage', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    newConnection.onclose(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));

    // Start connection
    newConnection
      .start()
      .then(() => {
        setIsConnected(true);
        setConnection(newConnection);
      })
      .catch(err => console.error('SignalR connection failed:', err));

    return () => {
      newConnection.stop();
    };
  }, [isAuthenticated, user?.token]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !connection || !isConnected) return;

    try {
      await connection.invoke('SendMessage', newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Toggle button - shown when sidebar is closed */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-20 z-50 bg-campus-purple hover:bg-campus-lightPurple shadow-lg rounded-full h-12 w-12 p-0 flex items-center justify-center"
        >
          <MessageCircle size={22} />
        </Button>
      )}

      {/* Chat sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full z-40 bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '340px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-campus-purple to-orange-400">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} className="text-white" />
            <h2 className="text-base font-semibold text-white">Campus Chat</h2>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected && (
              <span className="inline-block w-2 h-2 rounded-full bg-green-300" title="Connected" />
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <MessageCircle size={40} className="mb-3 text-gray-300" />
              <p className="text-sm font-medium">Log in to chat</p>
              <p className="text-xs text-gray-400 mt-1">
                Sign in to start chatting with other students
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <MessageCircle size={40} className="mb-3 text-gray-300" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to say something!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.username === user?.username;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  {!isOwn && (
                    <span className="text-xs font-medium text-campus-purple mb-0.5 px-1">
                      {msg.username}
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm break-words ${
                      isOwn
                        ? 'bg-campus-purple text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                    {formatTime(msg.sentAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {isAuthenticated && (
          <div className="px-3 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-sm border-gray-200 focus:border-campus-purple"
                disabled={!isConnected}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                size="icon"
                className="bg-campus-purple hover:bg-campus-lightPurple h-9 w-9 shrink-0"
              >
                <Send size={16} />
              </Button>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-400 mt-1 text-center">Connecting to chat...</p>
            )}
          </div>
        )}
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatSidebar;
