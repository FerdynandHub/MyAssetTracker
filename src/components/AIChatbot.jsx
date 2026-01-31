import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';

const AIChatbot = ({ userName, userRole, ROLES, SCRIPT_URL, CATEGORIES, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Halo ${userName}! 👋 Saya asisten Portal AVM. Saya akan membantu memandu Anda menggunakan sistem ini.\n\nApa yang ingin Anda lakukan hari ini?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // System context about the Portal AVM
  const getSystemContext = () => {
    return `Anda adalah asisten AI untuk Portal AVM UPH 7.1, sistem manajemen aset audio-visual.

INFORMASI PENGGUNA:
- Nama: ${userName}
- Role: ${userRole}
- Hak akses: ${userRole === ROLES.ADMIN ? 'Full access (admin)' : userRole === ROLES.EDITOR ? 'Dapat mengajukan perubahan data' : 'Hanya dapat melihat data'}

FITUR YANG TERSEDIA:
1. **Daftar Data (Overview)** - Melihat semua aset dengan filter kategori
2. **Cek Data (Check)** - Mencari aset spesifik dengan ID atau scan barcode
3. **Unduh Data (Export)** - Export aset ke CSV dengan scan multiple barcode
4. **Riwayat Data (History)** - Melihat history perubahan aset
5. **Baterai (Battery)** - ${userRole === ROLES.VIEWER ? 'TIDAK TERSEDIA untuk viewer' : 'Checkout baterai AA/9V untuk event'}
6. **Perbarui Data (Update)** - ${userRole === ROLES.ADMIN ? 'Update langsung' : userRole === ROLES.EDITOR ? 'Ajukan perubahan (perlu approval admin)' : 'TIDAK TERSEDIA'}
7. **Pinjam Barang (Loan)** - ${userRole === ROLES.VIEWER ? 'TIDAK TERSEDIA' : 'Update status peminjaman/pengembalian'}
8. **Pengajuan Saya** - ${userRole === ROLES.EDITOR ? 'Lihat status request update yang diajukan' : 'TIDAK TERSEDIA'}
9. **Persetujuan Pending** - ${userRole === ROLES.ADMIN ? 'Approve/reject request dari editor' : 'TIDAK TERSEDIA'}

KATEGORI ASET TERSEDIA:
${CATEGORIES.join(', ')}

GRADE CONDITION:
S+, S, S-, A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E

PERAN ANDA:
- JANGAN lakukan aksi untuk user (tidak bisa update data langsung)
- PANDU user step-by-step untuk mencapai tujuan mereka
- Berikan instruksi jelas dan spesifik
- Tanyakan informasi yang diperlukan
- Sarankan fitur mana yang harus digunakan
- Jelaskan batasan berdasarkan role mereka

GAYA KOMUNIKASI:
- Gunakan Bahasa Indonesia yang ramah dan profesional
- Berikan panduan yang jelas dan terstruktur
- Gunakan emoji untuk membuat lebih friendly
- Singkat namun informatif

Contoh interaksi yang BENAR:
User: "Saya ingin update data proyektor"
Assistant: "Baik! Untuk update data proyektor, Anda perlu:
1. Siapkan ID proyektor yang ingin diupdate
2. Buka menu **Perbarui Data** di sidebar
3. ${userRole === ROLES.ADMIN ? 'Pilih mode Single/Batch Update' : 'Ajukan request update (akan direview admin)'}
4. Masukkan ID dan data yang ingin diubah

Apakah Anda sudah punya ID proyektornya? 📋"

Contoh yang SALAH (jangan lakukan):
❌ "Saya akan update proyektor untuk Anda..."
❌ Mencoba mengakses SCRIPT_URL atau melakukan API call

INGAT: Anda HANYA memandu, TIDAK melakukan aksi!`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: getSystemContext(),
          messages: [
            ...messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: input
            }
          ]
        })
      });

      const data = await response.json();
      
      // Extract text from response
      const assistantMessage = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n\n');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi. 😅',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: '📋 Cara cek data', query: 'Bagaimana cara cek data aset?' },
    { label: '🔄 Cara update data', query: 'Bagaimana cara update data aset?' },
    { label: '🔋 Cara checkout baterai', query: 'Bagaimana cara checkout baterai?' },
    { label: '📥 Cara export data', query: 'Bagaimana cara export data ke CSV?' }
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
                <h3 className="font-bold text-lg">Portal AVM Assistant</h3>
                <p className="text-xs text-white/80">Siap membantu Anda</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
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
                      handleSendMessage();
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