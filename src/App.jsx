//base imports essentials + components
import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Search, Download, Edit, List, Eye, Scan, ArrowUpDown, ArrowUp, ArrowDown, Menu, X, BookOpenText, History} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';


//components
import { exportToCSV } from "./components/ExportUtils";
import CheckMode from "./components/CheckMode";
import UpdateMode from "./components/UpdateMode";
import OverviewMode from "./components/OverviewMode";
import HistoryMode from "./components/HistoryMode";
import BatteryMode from "./components/BatteryMode";
import { Battery } from 'lucide-react'; 

//roles assignment
const ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin'
};


const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL

//Categories List
const CATEGORIES = [
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
  'Power Extension'
];

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName("");
    setAccessCode("");
    sessionStorage.clear();
  };

  // Login page
  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(https://edp.uph.edu/wp-content/uploads/2024/06/16.-UPH-RMIT-scaled-1-edited.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img
              src="https://www.uph.edu/wp-content/uploads/2023/10/cropped-uph-universitas-pelita-harapan-logo.png"
              alt="UPH Logo"
              className="h-16 w-auto"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-1 text-center">
            Portal AVM UPH 6.0
          </h1>

          <p className="text-xs text-gray-400 text-center mb-4">
            by Ferdynand
          </p>

          <h2 className="text-lg font-medium text-gray-700 text-center mb-1">
            Selamat Datang
          </h2>

          <p className="text-sm text-gray-500 text-center mb-6">
            Masukkan Access Code
          </p>

          <input
            type="password"
            placeholder="Enter Access Code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && !isLocked && handleLogin()}
            disabled={isLocked || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
      return <ApprovalsMode userName={userName} />;
    default:
      return null;
  }
};

// After login, show sidebar layout
return (
  <div className="flex h-screen bg-gray-100 overflow-hidden">
    {/* Sidebar */}
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-[60]
      w-64 bg-white shadow-lg flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Portal AVM</h2>
          <p className="text-sm text-gray-600 mt-1">{userName}</p>
          <p className="text-xs text-gray-500">({userRole})</p>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
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

    <SidebarItem
      icon={<Edit className="w-5 h-5" />}
      label={userRole === ROLES.ADMIN ? "Perbarui Data" : "Ajukan Pembaruan Data"}
      active={mode === 'update'}
      onClick={() => {
        setMode('update');
        setSidebarOpen(false);
      }}
      disabled={userRole === ROLES.VIEWER}
    />

    <SidebarItem
      icon={<BookOpenText className="w-5 h-5" />}
      label="Pusat Pengetahuan"
      active={false}
      onClick={() => {
        window.open(
          "https://docs.google.com/document/d/1nQZMGHu7H5A4cRY08elEqtDZfLe-NB-ySr3_jbc3Nbs/edit?tab=t.ajkay86zze5j",
          "_blank"
        );
        setSidebarOpen(false);
      }}
      disabled={userRole === ROLES.VIEWER}
    />

    <SidebarItem
      icon={<Battery className="w-5 h-5" />}
      label="Baterai"
      active={mode === 'battery'}
      onClick={() => {
        setMode('battery');
        setSidebarOpen(false);
      }}
      disabled={userRole === ROLES.VIEWER}
    />

        <SidebarItem
      icon={<BookOpenText className="w-5 h-5" />}
      label="Tata Cara Memakai Scanner"
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
      icon={<RefreshCw className="w-5 h-5" />}
      label="Persetujuan Pending"
      active={mode === 'approvals'}
      onClick={() => {
        setMode('approvals');
        setSidebarOpen(false);
      }}
      disabled={userRole !== ROLES.ADMIN}
    />

    {/* Coming Soon Section */}
    <div className="pt-4 mt-4 border-t">
      <p className="text-xs text-gray-500 uppercase mb-2 px-3">
        Segera Hadir
      </p>
      {['Permintaan Barang', 'Progres'].map((label) => (
        <SidebarItem
          key={label}
          icon={<span className="w-5 h-5 text-gray-400">•</span>}
          label={label}
          active={false}
          disabled={true}
        />
      ))}
    </div>
  </div>
</nav>


      {/* Logout Button */}
      <div className="p-4 border-t">
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
      <div className="bg-white shadow-sm p-4 flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-600 hover:text-gray-800 transition"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {mode === 'overview' && 'Overview Data'}
          {mode === 'check' && 'Check Information'}
          {mode === 'export' && 'Export Data'}
          {mode === 'history' && 'History'}
          {mode === 'update' && (userRole === ROLES.ADMIN ? 'Update Data' : 'Request Update Data')}
          {mode === 'battery' && 'Single-Use Item'}
          {mode === 'approvals' && 'Pending Approvals'}
          {!mode && 'Portal AVM'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!mode ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to Portal AVM!
              </h1>
              <p className="text-gray-600">Select a mode from the menu ☰ on the left to begin</p>
            </div>
          </div>
        ) : (
          renderMode()
        )}
      </div>
    </main>
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
                Add
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


// Approvals Mode
const ApprovalsMode = ({ onBack, userName }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getPendingRequests`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

    const handleApprove = async (requestId) => {
      if (!confirm('Are you sure you want to approve this request?')) return;

      // Find the request to get the requester's name
      const request = requests.find(r => r.requestId === requestId);

      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'approveRequest',
            requestId: requestId,
            approvedBy: request.requestedBy  // Use requester instead of approver
          })
        });
        alert('Request approved successfully');
        fetchRequests();
      } catch (error) {
        console.error('Error approving request:', error);
        alert('Error approving request');
      }
    };

  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'rejectRequest',
          requestId: requestId
        })
      });
      alert('Request rejected');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Pending Approvals</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchRequests}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <List className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {request.type === 'batch' ? 'Batch Update Request' : 'Single Update Request'}
                    </h3>
                    <p className="text-sm text-gray-600">Request ID: {request.requestId}</p>
                    <p className="text-sm text-gray-600">Requested by: {request.requestedBy}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(request.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.requestId)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.requestId)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Assets to Update:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.ids.map((id, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                        {id}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-semibold text-gray-700 mb-2">Proposed Changes:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(request.updates).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium text-gray-700 capitalize">{key}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;