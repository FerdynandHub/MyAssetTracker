import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, RefreshCw, Zap } from 'lucide-react';

const AIChatbot = ({ userName, userRole, ROLES, SCRIPT_URL, CATEGORIES, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Halo ${userName}! 👋 Saya AIming asisten Portal AVM. Saya akan membantu memandu Anda menggunakan sistem ini.\n\nApa yang ingin Anda lakukan hari ini?`,
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
    lastSync: null,
    features: []
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

  // Auto-detect available features based on role
  const detectFeatures = () => {
    const features = [];
    
    // Base features (all roles)
    features.push({
      name: 'Daftar Data',
      id: 'overview',
      description: 'Lihat semua aset dengan filter kategori',
      available: true
    });
    
    features.push({
      name: 'Cek Data',
      id: 'check',
      description: 'Cari aset spesifik dengan ID atau scan barcode',
      available: true
    });
    
    features.push({
      name: 'Unduh Data',
      id: 'export',
      description: 'Export aset ke CSV dengan scan multiple barcode',
      available: true
    });
    
    features.push({
      name: 'Riwayat Data',
      id: 'history',
      description: 'Lihat history perubahan aset',
      available: true
    });

    // Role-based features
    if (userRole !== ROLES.VIEWER) {
      features.push({
        name: 'Baterai',
        id: 'battery',
        description: 'Checkout baterai AA/9V untuk event',
        available: true
      });

      features.push({
        name: userRole === ROLES.ADMIN ? 'Perbarui Data' : 'Ajukan Ubah Data',
        id: 'update',
        description: userRole === ROLES.ADMIN ? 'Update data langsung' : 'Ajukan perubahan (perlu approval)',
        available: true
      });

      features.push({
        name: 'Pinjam Barang',
        id: 'loan',
        description: 'Update status peminjaman/pengembalian',
        available: true
      });
    }

    if (userRole === ROLES.EDITOR) {
      features.push({
        name: 'Pengajuan Saya',
        id: 'myRequests',
        description: 'Lihat status request update yang diajukan',
        available: true
      });
    }

    if (userRole === ROLES.ADMIN) {
      features.push({
        name: 'Persetujuan Pending',
        id: 'approvals',
        description: 'Approve/reject request dari editor',
        available: true
      });
    }

    return features;
  };

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
      newState.features = detectFeatures();
      newState.categories = CATEGORIES;

      setSystemState(newState);
    } catch (error) {
      console.error('Error fetching system state:', error);
    }
  };

  // Generate contextual response based on live data
  const getResponse = (userInput) => {
    const input = userInput.toLowerCase();
    const features = systemState.features;

    // Greetings
    if (input.match(/^(hai|halo|hi|hello|hey|pagi|siang|sore|malam)/)) {
      return `Halo ${userName}! 😊 Saya di sini untuk membantu Anda menggunakan Portal AVM.\n\nBeberapa hal yang bisa saya bantu:\n• Cara cek data aset\n• Cara update data\n• Cara checkout baterai\n• Cara export data\n• Dan lainnya!\n\nAda yang bisa saya bantu?`;
    }

    // System status / stats
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

    // List features / apa yang bisa dilakukan
    if (input.match(/(fitur|feature|bisa apa|apa aja|menu|fungsi)/i)) {
      let featuresMsg = `Fitur yang tersedia untuk Anda:\n\n`;
      
      features.forEach((feature, idx) => {
        featuresMsg += `${idx + 1}. ${feature.name}\n   ${feature.description}\n\n`;
      });
      
      featuresMsg += `Ketik nama fitur atau tanyakan "cara [nama fitur]" untuk panduan!`;
      
      return featuresMsg;
    }

    // Battery with live inventory
    if (input.match(/(baterai|battery|batre|aa|9v|checkout)/i)) {
      if (userRole === ROLES.VIEWER) {
        return `Maaf ${userName}, fitur Baterai tidak tersedia untuk role Viewer. 🔋\n\nHubungi admin untuk upgrade role!`;
      }

      let batteryMsg = `Untuk checkout baterai:\n\n`;
      batteryMsg += `1. Buka menu "Baterai" di sidebar\n`;
      batteryMsg += `2. Pilih jenis baterai:\n`;
      batteryMsg += `   • AA (baterai kecil)\n`;
      batteryMsg += `   • 9V (baterai kotak)\n`;
      batteryMsg += `3. Isi form:\n`;
      batteryMsg += `   • Nama Anda: ${userName}\n`;
      batteryMsg += `   • Jumlah: (berapa pcs?)\n`;
      batteryMsg += `   • Nama Event: (untuk acara apa?)\n`;
      batteryMsg += `   • Lokasi: (di mana?)\n`;
      batteryMsg += `4. Checkout 🔋\n\n`;
      
      // Show current inventory
      if (systemState.batteryInventory) {
        batteryMsg += `Stok saat ini:\n`;
        batteryMsg += `• AA: ${systemState.batteryInventory.AA} pcs\n`;
        batteryMsg += `• 9V: ${systemState.batteryInventory['9V']} pcs\n\n`;
      }
      
      batteryMsg += `Sistem otomatis kurangi inventory!`;
      
      return batteryMsg;
    }

    // Check data with stats
    if (input.match(/(cek|check|lihat|search|cari).*(data|aset|barang|item)/i) || 
        input.match(/(cara|bagaimana).*(cek|search|cari)/i)) {
      let checkMsg = `Untuk cek data aset, ada 2 cara:\n\n`;
      checkMsg += `1. Lewat Daftar Data:\n`;
      checkMsg += `• Buka menu "Daftar Data" di sidebar\n`;
      checkMsg += `• Gunakan filter kategori untuk mempersempit pencarian\n`;
      checkMsg += `• Klik pada aset untuk detail\n\n`;
      checkMsg += `2. Lewat Cek Data (Lebih Cepat):\n`;
      checkMsg += `• Buka menu "Cek Data"\n`;
      checkMsg += `• Masukkan ID aset atau scan barcode\n`;
      checkMsg += `• Detail langsung muncul!\n\n`;
      
      if (systemState.totalAssets > 0) {
        checkMsg += `📦 Total aset di sistem: ${systemState.totalAssets}\n\n`;
      }
      
      checkMsg += `Mau coba yang mana? 🔍`;
      
      return checkMsg;
    }

    // Update data with pending info
    if (input.match(/(update|ubah|edit|ganti|perbarui).*(data|aset|proyektor|barang)/i) ||
        input.match(/(cara|bagaimana).*(update|ubah)/i)) {
      if (userRole === ROLES.VIEWER) {
        return `Maaf ${userName}, dengan role Viewer Anda tidak dapat update data. 😔\n\nRole Viewer hanya bisa:\n• Lihat data\n• Cek informasi\n• Export data\n• Lihat riwayat\n\nSilakan hubungi admin untuk upgrade role jika perlu akses update!`;
      }

      if (userRole === ROLES.EDITOR) {
        let editorMsg = `Untuk mengajukan update data (Editor):\n\n`;
        editorMsg += `1. Buka menu "Ajukan Ubah Data" di sidebar\n`;
        editorMsg += `2. Pilih mode:\n`;
        editorMsg += `   • Single Update (1 aset)\n`;
        editorMsg += `   • Batch Update (banyak aset)\n`;
        editorMsg += `3. Masukkan ID aset\n`;
        editorMsg += `   • Ketik manual, atau\n`;
        editorMsg += `   • Scan barcode\n`;
        editorMsg += `4. Isi data yang ingin diubah\n`;
        editorMsg += `5. Submit → Menunggu approval admin\n\n`;
        
        if (systemState.myRequests !== undefined) {
          editorMsg += `📋 Anda punya ${systemState.myRequests} pengajuan. Cek di menu "Pengajuan Saya"\n\n`;
        }
        
        editorMsg += `Sudah siap ID asetnya?`;
        
        return editorMsg;
      }

      if (userRole === ROLES.ADMIN) {
        let adminMsg = `Untuk update data (Admin - langsung approve):\n\n`;
        adminMsg += `1. Buka menu "Perbarui Data" di sidebar\n`;
        adminMsg += `2. Pilih mode:\n`;
        adminMsg += `   • Single Update (1 aset)\n`;
        adminMsg += `   • Batch Update (banyak aset sekaligus)\n`;
        adminMsg += `3. Masukkan ID aset\n`;
        adminMsg += `   • Ketik manual, atau\n`;
        adminMsg += `   • Scan barcode 📷\n`;
        adminMsg += `4. Isi data yang ingin diubah:\n`;
        adminMsg += `   • Category, Status, Location, dll\n`;
        adminMsg += `5. Update! ✅ (langsung tersimpan)\n\n`;
        
        if (systemState.pendingRequests > 0) {
          adminMsg += `⚠️ Ada ${systemState.pendingRequests} request menunggu approval!\n\n`;
        }
        
        adminMsg += `💡 Tip: Gunakan Batch Update untuk efisiensi!\n\nAda yang mau diupdate?`;
        
        return adminMsg;
      }
    }

    // Approvals with live count
    if (input.match(/(approval|approve|persetujuan|pending|request)/i)) {
      if (userRole !== ROLES.ADMIN) {
        return `Fitur approval hanya untuk Admin. 🔒\n\n${userRole === ROLES.EDITOR ? 'Anda bisa cek status pengajuan di menu "Pengajuan Saya"!' : 'Role Viewer tidak bisa mengajukan update.'}`;
      }

      let approvalMsg = `Untuk kelola approval (Admin):\n\n`;
      approvalMsg += `1. Buka menu "Persetujuan Pending"\n`;
      approvalMsg += `2. Lihat semua request dari Editor\n`;
      approvalMsg += `   • Detail perubahan\n`;
      approvalMsg += `   • Siapa yang mengajukan\n`;
      approvalMsg += `3. Review dan putuskan:\n`;
      approvalMsg += `   • ✅ Approve → Data langsung terupdate\n`;
      approvalMsg += `   • ❌ Reject → Request ditolak\n\n`;
      
      if (systemState.pendingRequests !== undefined) {
        approvalMsg += `📊 Pending saat ini: ${systemState.pendingRequests} request\n\n`;
      }
      
      approvalMsg += `📋 Best practice:\n`;
      approvalMsg += `• Review dengan teliti\n`;
      approvalMsg += `• Pastikan data valid\n`;
      approvalMsg += `• Beri feedback jika reject\n\n`;
      approvalMsg += `${systemState.pendingRequests > 0 ? 'Ada request yang perlu direview!' : 'Tidak ada request pending.'}`;
      
      return approvalMsg;
    }

    // Export data
    if (input.match(/(export|unduh|download|csv).*(data)/i) ||
        input.match(/(cara|bagaimana).*(export|unduh|download)/i)) {
      return `Untuk export data ke CSV:\n\n1. Buka menu "Unduh Data" di sidebar\n2. Tambahkan ID aset:\n   • Ketik manual lalu klik "Add", atau\n   • Klik "Scan Barcode" 📷\n3. Scan beberapa aset (bisa banyak!)\n4. Klik "Export to CSV" 📥\n5. File akan terdownload!\n\n💡 Tips: Scan banyak aset sekaligus untuk laporan lengkap!\n\nMau coba sekarang?`;
    }

    // Loan
    if (input.match(/(pinjam|loan|kembalikan|return|borrow)/i)) {
      if (userRole === ROLES.VIEWER) {
        return `Fitur Peminjaman tidak tersedia untuk Viewer. 📦\n\nHubungi admin untuk akses!`;
      }

      return `Untuk pinjam/kembalikan barang:\n\nPINJAM:\n1. Buka menu "Pinjam Barang"\n2. Pilih "Update Status Pinjam"\n3. Scan/input ID barang\n4. Isi detail peminjam\n5. Submit ${userRole === ROLES.ADMIN ? '(langsung approve)' : '(tunggu approval admin)'}\n\nKEMBALIKAN:\n1. Buka menu "Pinjam Barang"\n2. Pilih "Update Status Kembali"\n3. Scan/input ID barang\n4. Submit\n\nStatus otomatis terupdate! 📦\n\nMau pinjam atau kembalikan?`;
    }

    // History
    if (input.match(/(history|riwayat|log|perubahan)/i)) {
      return `Untuk lihat riwayat perubahan:\n\n1. Buka menu "Riwayat Data" di sidebar\n2. Masukkan ID aset\n   • Ketik atau scan\n3. Lihat semua history 📜\n   • Semua perubahan tercatat\n   • Siapa yang ubah\n   • Kapan diubah\n\nBerguna untuk audit dan tracking!\n\nMau cek riwayat aset apa?`;
    }

    // Categories
    if (input.match(/(kategori|category|jenis)/i)) {
      const catList = systemState.categories.slice(0, 10).join(', ');
      return `Kategori aset yang tersedia (${systemState.categories.length} jenis):\n\n${catList}, dan ${systemState.categories.length - 10} lainnya.\n\n🔍 Gunakan filter kategori di menu "Daftar Data" untuk pencarian lebih mudah!\n\nAda kategori spesifik yang dicari?`;
    }

    // Scan barcode
    if (input.match(/(scan|barcode|qr|kamera|camera)/i)) {
      return `Cara scan barcode:\n\n1. Di fitur apa pun (Cek Data, Update, Export, dll)\n2. Cari tombol "Scan Barcode" 📷\n3. Klik → Kamera terbuka\n4. Arahkan ke barcode aset\n5. ID otomatis terdeteksi! ✨\n\n💡 Tips:\n• Pastikan pencahayaan cukup\n• Barcode harus jelas/tidak rusak\n• Pegang stabil saat scan\n\nLebih detail? Cek "Cara Pakai Scanner" di sidebar!`;
    }

    // Role info
    if (input.match(/(role|akses|permission|hak|bisa|tidak bisa)/i)) {
      let roleInfo = '';
      
      if (userRole === ROLES.VIEWER) {
        roleInfo = `Role Anda: Viewer 👁️\n\nYang BISA dilakukan:\n✅ Lihat semua data\n✅ Cek informasi aset\n✅ Export data ke CSV\n✅ Lihat riwayat\n\nYang TIDAK BISA:\n❌ Update data\n❌ Checkout baterai\n❌ Pinjam barang\n\nPerlu akses lebih? Hubungi admin!`;
      } else if (userRole === ROLES.EDITOR) {
        roleInfo = `Role Anda: Editor ✏️\n\nYang BISA dilakukan:\n✅ Semua akses Viewer\n✅ Ajukan update data (perlu approval)\n✅ Checkout baterai\n✅ Pinjam/kembalikan barang\n✅ Lihat status pengajuan\n\nYang TIDAK BISA:\n❌ Update langsung (harus request)\n❌ Approve request\n\nRequest Anda akan direview admin!`;
      } else if (userRole === ROLES.ADMIN) {
        roleInfo = `Role Anda: Admin 👑\n\nFULL ACCESS! 🎉\n✅ Update data langsung\n✅ Approve/reject request\n✅ Semua fitur tersedia\n✅ Kelola seluruh sistem\n\nDengan kekuatan besar datang tanggung jawab besar! 💪`;
      }
      
      return roleInfo;
    }

    // My Requests
    if (input.match(/(pengajuan saya|my request|status|request saya)/i)) {
      if (userRole !== ROLES.EDITOR) {
        return userRole === ROLES.ADMIN 
          ? `Admin tidak perlu ajukan request - Anda bisa update langsung! 👑`
          : `Fitur ini hanya untuk Editor. Role Viewer tidak bisa ajukan update.`;
      }

      let requestMsg = `Untuk cek status pengajuan Anda:\n\n`;
      requestMsg += `1. Buka menu "Pengajuan Saya"\n`;
      requestMsg += `2. Lihat semua request yang pernah diajukan\n`;
      requestMsg += `3. Cek status:\n`;
      requestMsg += `   • 🟡 Pending - Menunggu review admin\n`;
      requestMsg += `   • ✅ Approved - Sudah disetujui & applied\n`;
      requestMsg += `   • ❌ Rejected - Ditolak admin\n\n`;
      
      if (systemState.myRequests !== undefined) {
        requestMsg += `📊 Total pengajuan Anda: ${systemState.myRequests}\n\n`;
      }
      
      requestMsg += `💡 Jika lama pending, follow up ke admin!\n\nMau cek sekarang?`;
      
      return requestMsg;
    }

    // Thank you
    if (input.match(/(terima kasih|thanks|thank you|makasih|thx)/i)) {
      return `Sama-sama ${userName}! 😊\n\nSenang bisa membantu! Jangan ragu tanya lagi kalau ada yang perlu bantuan.\n\nSemangat kelola aset! 🚀`;
    }

    // Help
    if (input.match(/^(help|bantuan|tolong|\?)$/i)) {
      return `Saya bisa bantu dengan:\n\n🔍 Cek Data - Cara search & lihat aset\n✏️ Update Data - Cara ubah informasi\n🔋 Baterai - Cara checkout baterai\n📥 Export - Cara download data CSV\n📦 Pinjam Barang - Cara pinjam/kembalikan\n📜 Riwayat - Cara lihat history\n📷 Scan - Cara pakai barcode scanner\n👤 Role - Info hak akses Anda\n📊 Status - Lihat statistik sistem\n\nKetik topik yang ingin ditanyakan!`;
    }

    // Default
    return `Hmm, saya belum paham pertanyaan ini. 🤔\n\nCoba tanyakan tentang:\n• Cara cek data\n• Cara update data\n• Cara checkout baterai\n• Cara export data\n• Status sistem\n• Fitur yang tersedia\n\nAtau ketik "help" untuk bantuan lengkap!`;
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
                <h3 className="font-bold text-lg">AIming</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Live data enabled (Do not share personal information)
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