import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, RefreshCw, Zap } from 'lucide-react';
import { CHATBOT_CONFIG, GENERAL_RESPONSES } from './chatbot-config';

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

  // Main response generator
  const getResponse = (userInput) => {
  const msg = userInput.toLowerCase().trim();

       //ya
    if (GENERAL_RESPONSES.genZ?.exact[msg]) {
    return GENERAL_RESPONSES.genZ.exact[msg];
  }

    const input = msg;

    // Greetings
    if (input.match(/^(hai|halo|hi|hello|hey|pagi|siang|sore|malam)/)) {
      return GENERAL_RESPONSES.greeting(userName);
    }

    // Thanks
    if (input.match(/(terima kasih|thanks|thank you|makasih|thx)/i)) {
      return GENERAL_RESPONSES.thanks(userName);
    }

    // Help
    if (input.match(/^(help|bantuan|tolong|\?)$/i)) {
      return GENERAL_RESPONSES.help;
    }

    // Role info
    if (input.match(/(role|akses|permission|hak|bisa|tidak bisa)/i)) {
      return GENERAL_RESPONSES.roleInfo[userRole];
    }

    // System status
    if (input.match(/(status|statistik|stats|berapa|jumlah|total)/i)) {
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

    // List all features
    if (input.match(/(fitur|feature|bisa apa|apa aja|menu|fungsi)/i)) {
      const availableFeatures = getAvailableFeatures();
      let featuresMsg = `Fitur yang tersedia untuk Anda:\n\n`;
      
      availableFeatures.forEach((feature, idx) => {
        featuresMsg += `${idx + 1}. ${feature.name}\n   ${feature.description}\n\n`;
      });
      
      featuresMsg += `Ketik nama fitur atau tanyakan "cara [nama fitur]" untuk panduan!`;
      
      return featuresMsg;
    }

    // Categories
    if (input.match(/(kategori|category|jenis)/i)) {
      const catList = systemState.categories.slice(0, 10).join(', ');
      return `Kategori aset yang tersedia (${systemState.categories.length} jenis):\n\n${catList}, dan ${systemState.categories.length - 10} lainnya.\n\n🔍 Gunakan filter kategori di menu "Daftar Data" untuk pencarian lebih mudah!\n\nAda kategori spesifik yang dicari?`;
    }

    // Try to find matching feature from config
    const matchedFeature = findFeatureByKeywords(input);
    if (matchedFeature) {
      return getFeatureResponse(matchedFeature);
    }

    // Not found
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
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AIMing</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  (Kalo AInya ada salah jangan dimarahin y bg thx)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchSystemState}
                className="hover:bg-white/20 p-2 rounded-full transition"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-sm border border-gray-100'
                  } p-3`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
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
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 p-3">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t bg-white">
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
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan Anda..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
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