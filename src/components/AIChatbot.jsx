import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, RefreshCw, Zap } from 'lucide-react';
import { CHATBOT_CONFIG, GENERAL_RESPONSES, CONTEXTUAL_RESPONSES } from './chatbot-config';

const AIChatbot = ({ userName, userRole, ROLES, SCRIPT_URL, CATEGORIES, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: GENERAL_RESPONSES.greeting(userName),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Live system state
  const [systemState, setSystemState] = useState({
    totalAssets: 0,
    batteryInventory: { AA: 0, '9V': 0 },
    pendingRequests: 0,
    myRequests: 0,
    categories: CATEGORIES,
    lastSync: null
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch live system data when chatbot opens
  useEffect(() => {
    if (isOpen && !systemState.lastSync) {
      fetchSystemState();
    }
  }, [isOpen]);

  const fetchSystemState = async () => {
    try {
      const newState = { ...systemState };

      // Fetch total assets
      try {
        const assetsResponse = await fetch(`${SCRIPT_URL}?action=getAssets`);
        const assetsData = await assetsResponse.json();
        newState.totalAssets = Array.isArray(assetsData) ? assetsData.length : 0;
      } catch (e) {
        console.log('Could not fetch assets count');
      }

      // Fetch battery inventory (if not viewer)
      if (userRole !== ROLES.VIEWER) {
        try {
          const batteryResponse = await fetch(`${SCRIPT_URL}?action=getBatteryInventory`);
          const batteryJson = await batteryResponse.json();
          if (batteryJson.inventory) {
            newState.batteryInventory = batteryJson.inventory;
          }
        } catch (e) {
          console.log('Could not fetch battery inventory');
        }
      }

      // Fetch pending requests count (if admin)
      if (userRole === ROLES.ADMIN) {
        try {
          const requestsResponse = await fetch(`${SCRIPT_URL}?action=getPendingRequests`);
          const requestsData = await requestsResponse.json();
          newState.pendingRequests = Array.isArray(requestsData) ? requestsData.length : 0;
        } catch (e) {
          console.log('Could not fetch pending requests');
        }
      }

      // Fetch my requests count (if editor)
      if (userRole === ROLES.EDITOR) {
        try {
          const myRequestsResponse = await fetch(`${SCRIPT_URL}?action=getMyRequests&userName=${encodeURIComponent(userName)}`);
          const myRequestsData = await myRequestsResponse.json();
          newState.myRequests = Array.isArray(myRequestsData) ? myRequestsData.length : 0;
        } catch (e) {
          console.log('Could not fetch my requests');
        }
      }

      newState.lastSync = new Date();
      newState.categories = CATEGORIES;

      setSystemState(newState);
    } catch (error) {
      console.error('Error fetching system state:', error);
    }
  };

  // Get features available to current user
  const getAvailableFeatures = () => {
    return Object.entries(CHATBOT_CONFIG)
      .filter(([_, feature]) => feature.roleRequired.includes(userRole))
      .map(([key, feature]) => ({ id: key, ...feature }));
  };

  // Find matching feature based on keywords
  const findFeatureByKeywords = (input) => {
    const lowerInput = input.toLowerCase();
    
    for (const [key, feature] of Object.entries(CHATBOT_CONFIG)) {
      // Check if user has access to this feature
      if (!feature.roleRequired.includes(userRole)) continue;
      
      // Check if any keyword matches
      const hasMatch = feature.keywords.some(keyword => 
        lowerInput.includes(keyword.toLowerCase())
      );
      
      if (hasMatch) {
        return { id: key, ...feature };
      }
    }
    
    return null;
  };

  // Generate response from config
  const getFeatureResponse = (feature) => {
    let response = '';
    
    // Get role-specific instructions if available
    if (typeof feature.instructions === 'object') {
      response = feature.instructions[userRole] || feature.instructions.editor || feature.instructions.admin;
    } else {
      response = feature.instructions;
    }
    
    // Add live data if enabled
    if (feature.showLiveData && feature.id === 'battery') {
      response += `\n\nStok saat ini:\n`;
      response += `• AA: ${systemState.batteryInventory.AA} pcs\n`;
      response += `• 9V: ${systemState.batteryInventory['9V']} pcs`;
    }
    
    if (feature.showLiveData && feature.id === 'approvals' && userRole === ROLES.ADMIN) {
      response += `\n\n📊 Pending saat ini: ${systemState.pendingRequests} request`;
      response += `\n\n${systemState.pendingRequests > 0 ? 'Ada request yang perlu direview!' : 'Tidak ada request pending.'}`;
    }
    
    if (feature.showLiveData && feature.id === 'myRequests' && userRole === ROLES.EDITOR) {
      response += `\n\n📊 Total pengajuan Anda: ${systemState.myRequests}`;
    }
    
    if (feature.showLiveData && feature.id === 'update') {
      if (userRole === ROLES.EDITOR && systemState.myRequests !== undefined) {
        response += `\n\n📋 Anda punya ${systemState.myRequests} pengajuan. Cek di menu "Pengajuan Saya"`;
      } else if (userRole === ROLES.ADMIN && systemState.pendingRequests > 0) {
        response += `\n\n⚠️ Ada ${systemState.pendingRequests} request menunggu approval!`;
      }
    }
    
    return response;
  };

// Main response generator - FIXED VERSION
const getResponse = (userInput) => {
  const msg = userInput.toLowerCase().trim();
  const input = msg;

  console.log('🔍 Processing input:', msg); // Debug log

  // ====== 1. GEN Z SLANG - HIGHEST PRIORITY ======
  // Check exact match dulu (case insensitive)
  // This must be first to prevent feature keywords from catching slang
  if (CONTEXTUAL_RESPONSES?.genZ?.exact) {
    const genZResponse = CONTEXTUAL_RESPONSES.genZ.exact[msg];
    if (genZResponse !== undefined) {
      console.log('✅ Gen Z match found:', msg, '→', genZResponse);
      return genZResponse;
    }
  }

  // ====== 2. VERY SHORT GREETINGS ONLY ======
  // Cuma trigger kalau PURELY greeting doang (ga ada kata lain)
  if (input.match(/^(hai|halo|hi|hello|hey)[\s!.]*$/)) {
    return GENERAL_RESPONSES.greeting(userName);
  }

  // Waktu-based greeting (pagi/siang/sore/malam) - ini opsional
  if (input.match(/^(pagi|siang|sore|malam)[\s!.]*$/)) {
    return GENERAL_RESPONSES.greeting(userName);
  }

  // ====== 3. THANKS - STRICT ======
  if (input.match(/^(terima kasih|thanks|thank you|makasih|thx|tysm|ty)[\s!.]*$/i)) {
    return GENERAL_RESPONSES.thanks(userName);
  }

  // ====== 4. HELP - STRICT ======
  if (input.match(/^(help|bantuan|tolong|\?)[\s!.]*$/i)) {
    return GENERAL_RESPONSES.help;
  }

  // ====== 5. ROLE INFO - MUST MENTION "role" or "bisa apa" ======
  // Jangan cuma "bisa" doang, harus ada context
  if (input.match(/\b(role\s+(apa|saya|gue|gw|ku)|apa\s+role|akses\s+apa|permission|hak\s+akses)\b/i) ||
      input.match(/^(apa\s+yang\s+)?(bisa|tidak\s+bisa|ga\s+bisa)\s+(apa|ngapain|aku|gue|saya|apaan)[\s?]*$/i)) {
    return GENERAL_RESPONSES.roleInfo[userRole];
  }

  // ====== 6A. QUICK ASSET COUNT ======
  // If user just asks "how many" without context, show quick asset count
  if (input.match(/^(berapa|ada berapa|jumlah|total)[\s?]*$/i)) {
    return `📦 **Total Aset di Sistem:** ${systemState.totalAssets}\n\nMau lihat info lengkap? Ketik "status sistem"!`;
  }

  // ====== 6B. SYSTEM STATUS - FULL INFO ======
  // More natural ways to ask about stats
  if (input.match(/\b(status\s+sistem|status\s+portal|statistik|stats|info\s+sistem)\b/i) ||
      input.match(/^(status|stats)[\s!.]*$/i) ||
      input.match(/\b(berapa\s+(total|jumlah|banyak)\s+(aset|barang|data)|total\s+(aset|data))\b/i) ||
      input.match(/\b(ada\s+berapa\s+(aset|barang|data)|jumlah\s+(aset|data))\b/i) ||
      input.match(/\b(aset|barang|data)\s+(berapa|ada\s+berapa)\b/i)) {
    
    let statusMsg = `Status Sistem Portal AVM:\n\n`;
    
    if (systemState.totalAssets > 0) {
      statusMsg += `📦 Total Aset: ${systemState.totalAssets}\n`;
    }
    
    if (userRole !== ROLES.VIEWER && systemState.batteryInventory) {
      statusMsg += `🔋 Baterai AA: ${systemState.batteryInventory.AA} pcs\n`;
      statusMsg += `🔋 Baterai 9V: ${systemState.batteryInventory['9V']} pcs\n`;
    }
    
    if (userRole === ROLES.ADMIN && systemState.pendingRequests !== undefined) {
      statusMsg += `⏳ Pending Requests: ${systemState.pendingRequests}\n`;
    }
    
    if (userRole === ROLES.EDITOR && systemState.myRequests !== undefined) {
      statusMsg += `📋 Pengajuan Saya: ${systemState.myRequests}\n`;
    }
    
    statusMsg += `\n📂 Kategori: ${systemState.categories.length} jenis\n`;
    statusMsg += `👤 Role: ${userRole}\n`;
    
    if (systemState.lastSync) {
      statusMsg += `\n🔄 Last update: ${systemState.lastSync.toLocaleTimeString('id-ID')}`;
    }
    
    return statusMsg;
  }

  // ====== 7. FEATURE MATCHING ======
  // Check against features from config
  // IMPORTANT: Only match if message is longer than 3 characters OR contains spaces
  // This prevents short slang like "jir", "gas", "sip" from being caught by feature keywords
  if (input.length > 3 || input.includes(' ')) {
    for (const [key, feature] of Object.entries(CHATBOT_CONFIG)) {
      if (feature.keywords) {
        // Check if any keyword matches
        const hasKeyword = feature.keywords.some(keyword => {
          // For multi-word keywords, check if the whole phrase exists
          if (keyword.includes(' ')) {
            return input.includes(keyword);
          }
          // For single words, use word boundary to avoid partial matches
          // AND make sure the input is not too short (avoid catching slang)
          if (input.length <= 4 && keyword.length <= 4) {
            // For very short inputs/keywords, require exact match to avoid false positives
            return input === keyword.toLowerCase();
          }
          return new RegExp(`\\b${keyword}\\b`, 'i').test(input);
        });

        if (hasKeyword) {
          console.log('🎯 Feature match:', key);
          
          // Check role permission
          if (!feature.roleRequired.includes(userRole)) {
            return `Maaf, fitur "${feature.name}" cuma bisa diakses sama ${feature.roleRequired.join(', ')} 🔒\n\nRole kamu sekarang: ${userRole}\n\nMau tau apa aja yang bisa kamu lakuin? Ketik "role"!`;
          }

          // Return appropriate instructions based on role
          if (typeof feature.instructions === 'object') {
            return feature.instructions[userRole] || feature.instructions.editor;
          }
          return feature.instructions;
        }
      }
    }
  }

  console.log('❌ No match found, returning notFound');
  
  // ====== 8. NOT FOUND ======
  return GENERAL_RESPONSES.notFound;
};

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(currentInput);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
      
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: '🔍 Cek data', query: 'Bagaimana cara cek data aset?' },
    { label: '✏️ Update data', query: 'Bagaimana cara update data aset?' },
    { label: '📊 Status sistem', query: 'Status sistem' },
    { label: '🎯 Fitur tersedia', query: 'Fitur apa saja yang tersedia?' }
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group sm:bottom-6 sm:right-6"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-96 h-[calc(100vh-5rem)] max-h-[600px] sm:max-h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 sm:bottom-6 sm:right-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-full backdrop-blur-sm">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">AIMing</h3>
                <p className="text-[10px] sm:text-xs text-white/80 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 sm:w-2 sm:h-2" />
                  Jgn dimarahin klo salah AI-nya bang🙏
                </p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={fetchSystemState}
                className="hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition"
                title="Refresh data"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-sm border border-gray-100'
                  } p-2.5 sm:p-3`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-snug sm:leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 p-2.5 sm:p-3">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

{/* Quick Actions */}
<div className="hidden sm:block px-4 py-2 border-t bg-white">
  <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
  <div className="flex flex-wrap gap-2">
    {quickActions.map((action, idx) => (
      <button
        key={idx}
        onClick={() => {
          setInput(action.query);
          setTimeout(() => handleSendMessage(), 100);
        }}
        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
      >
        {action.label}
      </button>
    ))}
  </div>
</div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan..."
                disabled={isLoading}
                className="flex-1 px-3 sm:px-4 py-2 text-base sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pulse Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;