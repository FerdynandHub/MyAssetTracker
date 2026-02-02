//base imports essentials + components
import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Eye,
  Search, 
  Download,
  History, 
  Edit, 
  Battery, 
  RefreshCw, 
  BookOpenText,
    BookOpen,
    ArrowLeftRight,
  FileText,
  Camera,
  List,
  Moon,
  Sun,
  Tickets
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';


//components
import { exportToCSV } from "./components/ExportUtils";
import CheckMode from "./components/CheckMode";
import UpdateMode from "./components/UpdateMode";
import OverviewMode from "./components/OverviewMode";
import HistoryMode from "./components/HistoryMode";
import BatteryMode from "./components/BatteryMode";
import MyRequestsMode from './components/MyRequestsMode.jsx';
import LoanMode from './components/LoanMode';
import AIChatbot from './components/AIChatbot';
import ApprovalsMode from './components/ApprovalsMode';



//roles assignment
const ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin'
};


const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL

// helper, keep insertion order
const CATEGORY_SOURCE = [
  'Projectors',
  'Toolkit',
  'Kabel HDMI',
  'HDMI SPLITTER',
  'Kabel USB',
  'Kabel Audio',
  'HDMI Extender',
  'DI Box',
  'Soundcard',
  'HDMI Matrix',
  'HDMI Switcher',
  'Microphone',
  'Wireless Microphone',
  'Wireless Presentation',
  'Stylus Pen',
  'Presentation Remote',
  'Docking Station',
  'Video Capture',
  'Power Supply',
  'PDU',
  'Mixer',
  'Speaker',
  'Speaker Stand',
  'Camera',
  'XLR Cable',
  'TV Auditorium',
  'Bracket TV',
  'Type C Hub Converter',
  'Power Extension',
  'VGA-HDMI Converter',
  'Kabel Data',
  'Jack L',
  'Jack 6,5mm'
];

// host, always sorted
const CATEGORIES = Object.freeze(
  [...CATEGORY_SOURCE].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )
);


const GRADES = [
  'S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 
  'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'
];

/* Root Component */
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [mode, setMode] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check if current time is in dark mode period (6PM - 6AM)
  const isNightTime = () => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18; // Dark mode from 6PM (18:00) to 6AM
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    
    // Lunch time: 11:15 AM - 1:00 PM
    if ((hour === 11 && minute >= 15) || (hour === 12)) {
      return 'Selamat Makan Siang';
    }
    
    if (hour >= 5 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Initialize dark mode based on time or saved preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode !== null) {
      // If user has manually set a preference, use that
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Otherwise, use automatic time-based setting
      setDarkMode(isNightTime());
    }

    // Update dark mode every minute to auto-adjust if no manual preference
    const interval = setInterval(() => {
      const savedPref = localStorage.getItem('darkMode');
      if (savedPref === null) {
        // Only auto-adjust if user hasn't manually set a preference
        setDarkMode(isNightTime());
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Clear manual preference on logout to revert to time-based
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName("");
    setAccessCode("");
    sessionStorage.clear();
    localStorage.removeItem('darkMode'); // Clear dark mode preference
    setDarkMode(isNightTime()); // Reset to time-based
  };

  // SECURITY: Backend authentication
  const handleLogin = async () => {
    // Rate limiting check
    if (isLocked) {
      setError('Terlalu banyak percobaan gagal. Silakan coba lagi dalam 5 menit.');
      return;
    }

    if (loginAttempts >= 5) {
      setIsLocked(true);
      setError('Terlalu banyak percobaan gagal. Silakan coba lagi dalam 5 menit.');
      setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
      }, 300000); // 5 minutes
      return;
    }

    if (!accessCode.trim()) {
      setError('Silakan masukkan access code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=authenticate&code=${encodeURIComponent(accessCode)}`);
      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        setUserRole(data.role);
        setUserName(data.name);
        setError('');
        setLoginAttempts(0);
        
        // Store session info (not credentials)
        const sessionToken = generateSessionToken();
        sessionStorage.setItem('sessionToken', sessionToken);
        sessionStorage.setItem('userRole', data.role);
        sessionStorage.setItem('userName', data.name);
        sessionStorage.setItem('loginTime', Date.now().toString());
      } else {
        setLoginAttempts(prev => prev + 1);
        setError(data.message || 'Kode akses tidak valid. Hubungi admin atau masuk sebagai guest (kode: 123)');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Gagal login. Silakan coba lagi.');
      setLoginAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
      setAccessCode(''); // Clear from memory
    }
  };

  // Generate simple session token (client-side)
  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  // Check for existing session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('sessionToken');
    const role = sessionStorage.getItem('userRole');
    const name = sessionStorage.getItem('userName');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (token && role && name && loginTime) {
      // Check if session is expired (24 hours)
      const sessionAge = Date.now() - parseInt(loginTime);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge < maxAge) {
        setIsLoggedIn(true);
        setUserRole(role);
        setUserName(name);
      } else {
        handleLogout();
      }
    }
  }, []);

  // Login page
  if (!isLoggedIn) {
    return (
      <div 
        className={`min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat ${darkMode ? 'dark' : ''}`}
        style={{
          backgroundImage: darkMode 
            ? 'url(https://i.imgur.com/cncw5PG.jpeg)' 
            : 'url(https://edp.uph.edu/wp-content/uploads/2024/06/16.-UPH-RMIT-scaled-1-edited.jpg)'
        }}
      >
        {/* Date and Time - Top */}
        <div className="absolute top-8 text-center">
          <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentTime.toLocaleDateString('id-ID', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {currentTime.toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            }).replace(/\./g, ':')}
          </p>
        </div>

        {/* Dark Mode Toggle - Login Page */}
        <button
          onClick={toggleDarkMode}
          className={`fixed top-4 right-4 p-3 rounded-full shadow-lg transition ${
            darkMode 
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
              : 'bg-white text-gray-800 hover:bg-gray-100'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className={`rounded-lg shadow-2xl p-8 w-full max-w-md bg-white ${darkMode ? 'dark' : ''}`}>
          <div className="flex justify-center mb-6">
            <img
              src="https://www.uph.edu/wp-content/uploads/2023/10/cropped-uph-universitas-pelita-harapan-logo.png"
              alt="UPH Logo"
              className="h-16 w-auto"
            />
          </div>

          <h1 className={`text-3xl font-bold mb-1 text-center text-gray-800`}>
            Portal AVM UPH
          </h1>

          <p className={`text-xs text-center mb-4 text-gray-400`}>
            Stable Full Release V.1.1
          </p>


          <h2 className={`text-lg font-medium text-center mb-1 text-gray-700`}>
            Selamat Datang
          </h2>

          <p className={`text-sm text-center mb-6 text-gray-500`}>
            Masukkan Access Code
          </p>

          <input
            type="password"
            placeholder="Enter Access Code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && !isLocked && handleLogin()}
            disabled={isLocked || loading}
            className={`w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-white border-gray-300 text-gray-900`}
            autoComplete="off"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          {loginAttempts > 0 && !isLocked && (
            <p className="text-orange-500 text-sm mb-4">
              {5 - loginAttempts} percobaan tersisa
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={isLocked || loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition mb-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Login'
            )}
          </button>
        </div>
<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
  <p className="text-xs text-white">
    © Made by Ferdynand
  </p>
</div>
      </div>
    );
  }

const SidebarItem = ({ icon, label, active, onClick, disabled }) => {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
        ${active 
          ? 'bg-blue-500 text-white' 
          : disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};





  // Mode rendering
const renderMode = () => {
  switch (mode) {
    case 'overview':
      return <OverviewMode SCRIPT_URL={SCRIPT_URL} CATEGORIES={CATEGORIES} />;
    case 'check':
      return <CheckMode SCRIPT_URL={SCRIPT_URL} />;
    case 'resourceCenter':
      return <ResourceCenterMode />;
    case 'export':
      return <ExportMode />;
    case 'history':
      return <HistoryMode SCRIPT_URL={SCRIPT_URL} />;
    case 'update':
      return (
        <UpdateMode
          userRole={userRole}
          userName={userName}
          ROLES={ROLES}
          SCRIPT_URL={SCRIPT_URL}
          CATEGORIES={CATEGORIES}
          GRADES={GRADES}
        />
      );
    case 'battery':
      return <BatteryMode userName={userName} SCRIPT_URL={SCRIPT_URL} />;
    case 'approvals':
  return <ApprovalsMode userName={userName} SCRIPT_URL={SCRIPT_URL} />;
    case 'myRequests':
      return <MyRequestsMode userName={userName} SCRIPT_URL={SCRIPT_URL} />;
    case 'loan':  
      return (
        <LoanMode
          userName={userName}
          userRole={userRole}
          ROLES={ROLES}
          SCRIPT_URL={SCRIPT_URL}
          CATEGORIES={CATEGORIES}
          GRADES={GRADES}
        />
      );
    default:
      return null;
  }
};

// After login, show sidebar layout
return (
  <div className={`flex overflow-hidden bg-gray-100 ${darkMode ? 'dark' : ''}`} style={{ height: '100dvh' }}>
    {/* Sidebar */}
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-[60]
      w-64 shadow-lg flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      bg-white
    `}>
{/* Header */}
<div className="p-6 border-b border-gray-200 relative">
  <div className="flex justify-between items-start mb-4">
    
    {/* User Info */}
    <div>
      <p className="text-sm text-gray-500 mb-1">{getGreeting()}</p>
      <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
      <p className="text-xs text-gray-500">({userRole})</p>
    </div>

    {/* Date/Time + Close Button */}
    <div className="flex flex-col items-end">
      <p className="text-xs text-gray-500">
        {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
      </p>
      <p className="text-sm font-medium text-gray-600">
        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
      </p>

      {/* Mobile Close Button */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden mt-2 text-gray-500 hover:text-gray-700"
      >
        <X className="w-6 h-6" />
      </button>
    </div>

  </div>
</div>


      {/* Navigation */}
<nav className="flex-1 overflow-y-auto p-4">
  <div className="space-y-2">
    <SidebarItem
      icon={<Eye className="w-5 h-5" />}
      label="Daftar Data"
      active={mode === 'overview'}
      onClick={() => {
        setMode('overview');
        setSidebarOpen(false);
      }}
    />

    <SidebarItem
      icon={<Search className="w-5 h-5" />}
      label="Cek Data"
      active={mode === 'check'}
      onClick={() => {
        setMode('check');
        setSidebarOpen(false);
      }}
    />

    <SidebarItem
      icon={<Download className="w-5 h-5" />}
      label="Unduh Data"
      active={mode === 'export'}
      onClick={() => {
        setMode('export');
        setSidebarOpen(false);
      }}
    />

    <SidebarItem
      icon={<History className="w-5 h-5" />}
      label="Riwayat Data"
      active={mode === 'history'}
      onClick={() => {
        setMode('history');
        setSidebarOpen(false);
      }}
    />



{/* Battery - Hidden from VIEWER */}
{userRole !== ROLES.VIEWER && (
  <SidebarItem
    icon={<Battery className="w-5 h-5" />}
    label="Baterai"
    active={mode === 'battery'}
    onClick={() => {
      setMode('battery');
      setSidebarOpen(false);
    }}
  />
)}

{/* Pending Approvals - ADMIN only */}
{userRole === ROLES.ADMIN && (
  <SidebarItem
    icon={<RefreshCw className="w-5 h-5" />}
    label="Persetujuan Pending"
    active={mode === 'approvals'}
    onClick={() => {
      setMode('approvals');
      setSidebarOpen(false);
    }}
  />
)}

{/* Update Data - Hidden from VIEWER */}
{userRole !== ROLES.VIEWER && (
  <SidebarItem
    icon={<Edit className="w-5 h-5" />}
    label={userRole === ROLES.ADMIN ? "Perbarui Data" : "Ajukan Ubah Data"}
    active={mode === 'update'}
    onClick={() => {
      setMode('update');
      setSidebarOpen(false);
    }}
  />
)}

{userRole !== ROLES.VIEWER && (
  <SidebarItem
    icon={<ArrowLeftRight className="w-5 h-5" />}
    label={userRole === ROLES.ADMIN ? "Pinjam Barang" : "Pinjam Barang"}
    active={mode === 'loan'}
    onClick={() => {
      setMode('loan');
      setSidebarOpen(false);
    }}
  />
)}

{/* My Requests - For EDITOR only */}
{userRole === ROLES.EDITOR && (
  <SidebarItem
    icon={<FileText className="w-5 h-5" />}
    label="Pengajuan Saya"
    active={mode === 'myRequests'}
    onClick={() => {
      setMode('myRequests');
      setSidebarOpen(false);
    }}
  />
)}


{/* Classroom Center - Hidden from VIEWER */}
{userRole !== ROLES.VIEWER && (
  <SidebarItem
    icon={<BookOpenText className="w-5 h-5" />}
    label="Pusat Classroom"
    active={false}
    onClick={() => {
      window.open(
        "https://docs.google.com/document/d/1nQZMGHu7H5A4cRY08elEqtDZfLe-NB-ySr3_jbc3Nbs/edit?tab=t.ajkay86zze5j",
        "_blank"
      );
      setSidebarOpen(false);
    }}
  />
)}

            <SidebarItem
      icon={<BookOpenText className="w-5 h-5" />}
      label="Cara Pakai Scanner"
      active={false}
      onClick={() => {
        window.open(
          "https://docs.google.com/document/d/1fUivFvMW9HVQ_ht3nKEDjVCSI4Pq2G-dlQD7cCDKtjo/edit?tab=t.0",
          "_blank"
        );
        setSidebarOpen(false);
      }}
    />

                <SidebarItem
      icon={<Tickets className="w-5 h-5" />}
      label="Buka Tiket"
      active={false}
      onClick={() => {
        window.open(
          "https://onestopservice.uph.edu",
          "_blank"
        );
        setSidebarOpen(false);
      }}
    />


  </div>
</nav>


      {/* Logout & Dark Mode Toggle */}
      <div className={`p-4 border-t space-y-2 border-gray-200`}>
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition
            bg-gray-200 text-gray-700 hover:bg-gray-300
          `}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Keluar
        </button>
      </div>
    </aside>

    {/* Main Content Area */}
    <main className="flex-1 overflow-auto flex flex-col">
      {/* Top bar with hamburger menu */}
<div className={`shadow-sm p-4 flex items-center gap-4 relative overflow-hidden ${darkMode ? 'bg-gradient-to-r from-gray-900 to-blue-900' : 'bg-gradient-to-r from-sky-400 to-blue-500'}`}>
 
 
  {/* Stars for dark mode - twinkle but don't move */}
  {darkMode && (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(30)].map((_, i) => (
<div
  key={i}
  className="absolute bg-white rounded-full animate-[pulse_12s_linear_infinite]"
  style={{
    width: Math.random() * 2 + 1 + 'px',
    height: Math.random() * 2 + 1 + 'px',
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
  }}
/>
      ))}
    </div>
  )}
  
  
  <button
    onClick={() => setSidebarOpen(true)}
    className={`lg:hidden transition relative z-10 text-white hover:text-gray-200`}>
    <Menu className="w-6 h-6" />
  </button>
  <h1 className={`text-xl font-bold text-white relative z-10`}>
  {mode === 'overview' && 'Overview Data'}
  {mode === 'check' && 'Check Information'}
  {mode === 'export' && 'Export Data'}
  {mode === 'history' && 'History'}
  {mode === 'update' && (userRole === ROLES.ADMIN ? 'Update Data' : 'Request Update Data')}
  {mode === 'battery' && 'Single-Use Item'}
  {mode === 'myRequests' && 'Permintaan Saya'} 
  {mode === 'approvals' && 'Pending Approvals'}
  {mode === 'loan' && 'Peminjaman/Pengembalian'}  
  {!mode && 'Portal AVM'}
</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!mode ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <h1 className={`text-4xl font-bold mb-4 text-gray-800`}>
                Welcome to Portal AVM!
              </h1>
              <p className={`text-gray-600`}>
                Pilih aktivitas dari menu ☰ di sisi kiri layar untuk mulai.
              </p>
            </div>
          </div>
        ) : (
          renderMode()
        )}
      </div>
    </main>

    {/* AI Chatbot - Always visible when logged in */}
    <AIChatbot
      userName={userName}
      userRole={userRole}
      ROLES={ROLES}
      SCRIPT_URL={SCRIPT_URL}
      CATEGORIES={CATEGORIES}
      onNavigate={setMode}
    />
  </div>
);

};





// Export Mode
const ExportMode = ({ onBack }) => {
  const [scannedIds, setScannedIds] = useState([]);
  const [currentId, setCurrentId] = useState('');
  const [scanning, setScanning] = useState(false);

  const addId = () => {
    if (currentId.trim() && !scannedIds.includes(currentId.trim())) {
      setScannedIds([...scannedIds, currentId.trim()]);
      setCurrentId('');
    }
  };

  const removeId = (id) => {
    setScannedIds(scannedIds.filter(i => i !== id));
  };

  const handleExportToCSV = async () => {
    await exportToCSV(scannedIds, SCRIPT_URL);
  };

  useEffect(() => {
    let scanner = null;
    
    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } }
      );

      scanner.render(
        (decodedText) => {
          if (decodedText.trim() && !scannedIds.includes(decodedText.trim())) {
            setScannedIds([...scannedIds, decodedText.trim()]);
          }
          scanner.clear().catch(() => {});
          setScanning(false);
        },
        (error) => {
          // Ignore scanning errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [scanning, scannedIds]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Export Mode</h1>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Asset ID"
                value={currentId}
                onChange={(e) => setCurrentId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addId()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addId}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                +
              </button>
            </div>

            <button
              onClick={() => setScanning(!scanning)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                scanning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              <Camera className="w-5 h-5" />
              {scanning ? 'Stop Scanning' : 'Scan Barcode'}
            </button>
          </div>

          {scanning && (
            <div className="mt-4">
              <div id="reader"></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Scanned Assets ({scannedIds.length})
            </h2>
            <button
              onClick={handleExportToCSV}
              disabled={scannedIds.length === 0}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scannedIds.map((id, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-mono">{id}</span>
                <button
                  onClick={() => removeId(id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  Remove
                </button>
              </div>
            ))}
            {scannedIds.length === 0 && (
              <p className="text-center text-gray-500 py-8">No assets scanned yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default App;