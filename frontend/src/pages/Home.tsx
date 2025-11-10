import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '../components/CodeBlock';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const chatId = localStorage.getItem('currentChatId') || `chat_${Date.now()}`;
    setCurrentChatId(chatId);
    loadChat(chatId);

    const handleNewChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      setMessages([]);
      setError(null);
      const newChatId = customEvent.detail.chatId;
      setCurrentChatId(newChatId);
      localStorage.setItem('currentChatId', newChatId);
    };

    const handleLoadChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      setMessages(customEvent.detail.messages || []);
      setError(null);
      setCurrentChatId(customEvent.detail.chatId);
      localStorage.setItem('currentChatId', customEvent.detail.chatId);
    };

    window.addEventListener('newChat', handleNewChat);
    window.addEventListener('loadChat', handleLoadChat);

    return () => {
      window.removeEventListener('newChat', handleNewChat);
      window.removeEventListener('loadChat', handleLoadChat);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const loadChat = (chatId: string) => {
    try {
      const history = localStorage.getItem('chatHistory');
      if (history) {
        const chats: ChatHistory[] = JSON.parse(history);
        const chat = chats.find((c) => c.id === chatId);
        if (chat && chat.messages) {
          setMessages(chat.messages);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const saveChatToHistory = (updatedMessages: Message[]) => {
    if (updatedMessages.length === 0) return;

    try {
      const history = localStorage.getItem('chatHistory');
      const chats: ChatHistory[] = history ? JSON.parse(history) : [];

      const existingIndex = chats.findIndex((c) => c.id === currentChatId);
      const chatData: ChatHistory = {
        id: currentChatId,
        title: updatedMessages[0]?.content.substring(0, 50) + '...' || 'New Chat',
        timestamp: new Date().toLocaleString(),
        messages: updatedMessages,
      };

      if (existingIndex >= 0) {
        chats[existingIndex] = chatData;
      } else {
        chats.unshift(chatData);
      }

      if (chats.length > 50) {
        chats.pop();
      }

      localStorage.setItem('chatHistory', JSON.stringify(chats));
      window.dispatchEvent(new Event('chatHistoryUpdated'));
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    if (!token) {
      setError('You must be logged in to send messages');
      return;
    }

    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    saveChatToHistory(updatedMessages);

    try {
      const lines = trimmedInput.split('\n').map((line) => line.trim()).filter(Boolean);

      if (lines.length > 1) {
        // Bulk generate articles
        await axios.post(
          `${API_URL}/articles/bulk-generate`,
          {
            titles: lines,
            details: '',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const assistantMessage: Message = {
          role: 'assistant',
          content: `✅ Successfully generated **${lines.length} articles**!\n\nYou can view them on the [Blog page](/blog).\n\n**Generated articles:**\n${lines.map((line, i) => `${i + 1}. ${line}`).join('\n')}`,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        saveChatToHistory(finalMessages);
      } else {
        // Single chat message
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: trimmedInput }),
        });

        if (!response.ok) {
          throw new Error(`API error with status ${response.status}`);
        }

        const data = await response.json();

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response || 'No response from server.',
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        saveChatToHistory(finalMessages);
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg =
        error.response?.data?.error || error.message || 'Error connecting to the server.';

      setError(errorMsg);

      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ **Error:** ${errorMsg}\n\nPlease check your connection and try again.`,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatToHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AIArticleGen Chat
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Gemini • Ask anything or generate articles
            </p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 bg-white dark:bg-gray-950">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl mx-auto px-4">
              <div className="mb-6">
                <SparklesIcon className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                <h2 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                  Welcome to AIArticleGen
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Your AI-powered article generation assistant
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    💬 Single Message
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Type a question or message for a conversational response
                  </p>
                </div>

                <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    📝 Generate Articles
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Enter multiple titles (one per line) to batch generate articles
                  </p>
                </div>
              </div>

              <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  💡 Tip: Press{' '}
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Shift + Enter</kbd>{' '}
                  for new line
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`group max-w-[85%] px-6 py-4 rounded-2xl relative ${
                    msg.role === 'user'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(msg.content, idx)}
                      className="absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      title="Copy message"
                    >
                      <ClipboardDocumentIcon
                        className={`w-4 h-4 ${
                          copiedIndex === idx ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                    </button>
                  )}

                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-200 dark:prose-pre:bg-gray-900 prose-code:text-pink-600 dark:prose-code:text-pink-400">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ inline, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              code={String(children).replace(/\n$/, '')}
                            />
                          ) : (
                            <code
                              className={`px-2 py-1 rounded text-sm font-mono ${
                                msg.role === 'user'
                                  ? 'bg-blue-700 dark:bg-blue-800'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  <p
                    className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message or paste article titles (one per line)..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 resize-none overflow-hidden transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '150px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors shrink-0"
              title={loading ? 'Sending...' : 'Send message'}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send •{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
