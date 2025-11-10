import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  messages: any[];
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize theme
    const theme = localStorage.getItem('theme') || 'dark';
    const isDarkMode = theme === 'dark';
    setIsDark(isDarkMode);
    applyTheme(isDarkMode);

    // Load chat history
    loadChatHistory();
  }, []);

  useEffect(() => {
    // Listen for chat history updates
    const handleHistoryUpdate = () => {
      loadChatHistory();
    };

    window.addEventListener('chatHistoryUpdated', handleHistoryUpdate);

    return () => {
      window.removeEventListener('chatHistoryUpdated', handleHistoryUpdate);
    };
  }, []);

  const applyTheme = (isDarkMode: boolean) => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  const loadChatHistory = () => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out empty chats (no messages)
        const validChats = parsed.filter((chat: ChatHistory) => 
          chat.messages && chat.messages.length > 0
        );
        setChatHistory(validChats);
      } catch (error) {
        console.error('Error loading chat history:', error);
        setChatHistory([]);
      }
    } else {
      setChatHistory([]);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    // Clear chat history on logout (optional)
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('currentChatId');
    navigate('/login');
  };

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);
    localStorage.setItem('currentChatId', newChatId);

    window.dispatchEvent(new CustomEvent('newChat', { detail: { chatId: newChatId } }));

    if (location.pathname !== '/') {
      navigate('/', { replace: false });
    }
  };

  const handleChatClick = (chat: ChatHistory) => {
    setCurrentChatId(chat.id);
    localStorage.setItem('currentChatId', chat.id);

    window.dispatchEvent(
      new CustomEvent('loadChat', {
        detail: { chatId: chat.id, messages: chat.messages },
      })
    );

    if (location.pathname !== '/') {
      navigate('/', { replace: false });
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? (
          <ChevronLeftIcon className="w-5 h-5" />
        ) : (
          <ChevronRightIcon className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-300 dark:border-gray-800 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full p-2">
          {/* Logo */}
          <div className={`mb-6 mt-12 ${isOpen ? 'px-2' : 'px-0'}`}>
            {isOpen ? (
              <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white">
                AIArticleGen
              </h1>
            ) : (
              <div className="flex justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">AI</span>
              </div>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div
              className={`mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${
                isOpen ? '' : 'flex justify-center'
              }`}
            >
              {isOpen ? (
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-8 h-8 shrink-0 text-gray-700 dark:text-gray-300" />
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <UserCircleIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </div>
          )}

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className={`flex items-center gap-3 px-4 py-3 mb-4 rounded-lg bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white transition-colors ${
              isOpen ? '' : 'justify-center px-2'
            }`}
            title={!isOpen ? 'New Chat' : ''}
          >
            <PlusIcon className="w-5 h-5 shrink-0" />
            {isOpen && <span className="font-medium">New Chat</span>}
          </button>

          {/* Navigation */}
          <nav className="space-y-2 mb-6">
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              } ${isOpen ? '' : 'justify-center px-2'}`}
              title={!isOpen ? 'Chat' : ''}
            >
              <ChatBubbleLeftIcon className="w-5 h-5 shrink-0" />
              {isOpen && <span>Chat</span>}
            </Link>

            <Link
              to="/blog"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/blog'
                  ? 'bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              } ${isOpen ? '' : 'justify-center px-2'}`}
              title={!isOpen ? 'Blog' : ''}
            >
              <DocumentTextIcon className="w-5 h-5 shrink-0" />
              {isOpen && <span>Blog</span>}
            </Link>
          </nav>

          {/* Chat History */}
          {isOpen && (
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-2">
                Recent Chats
              </h3>
              <div className="space-y-1">
                {chatHistory.length === 0 ? (
                  <div className="px-2 py-4 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                      No chat history yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Start a conversation to see it here
                    </p>
                  </div>
                ) : (
                  chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatClick(chat)}
                      className={`px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                        currentChatId === chat.id 
                          ? 'bg-gray-200 dark:bg-gray-800' 
                          : ''
                      }`}
                    >
                      <p className="text-sm truncate text-gray-900 dark:text-white">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">
                        {chat.timestamp}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="border-t border-gray-300 dark:border-gray-800 pt-4 space-y-2">
            {/* Dark Mode Toggle - Only one button now */}
            

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors ${
                isOpen ? '' : 'justify-center px-2'
              }`}
              title={!isOpen ? 'Logout' : ''}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 shrink-0" />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
