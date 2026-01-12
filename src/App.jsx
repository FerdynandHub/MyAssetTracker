//base imports essentials + components
import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Search, Download, Edit, List, Eye, Scan, ArrowUpDown, ArrowUp, ArrowDown} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

//components
import ModeSelection from "./components/ModeSelection";
import { exportToCSV } from "./components/ExportUtils";
import CheckMode from "./components/CheckMode";
import UpdateMode from "./components/UpdateMode"; //imports single+batch internally
import OverviewMode from "./components/OverviewMode";
import HistoryMode from "./components/HistoryMode";

//roles assigntment
const ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin'
};

// Database
const SCRIPT_URL = (() => {
  return 'https://script.google.com/macros/s/AKfycbzlBJ3A04_2yryNKZHJcm3cJVK_kffVmlpQGskdMWjC_QUaTn9N8Ia6J1V5_DzTi5Ks/exec';
})();


//Categories List must be updated everytime theres a new category. yes its hard coded i know
const CATEGORIES = [
  'Projectors',
  'Toolkit',
  'TV',
  'Screen',
  'EventPC',
  'Kabel HDMI',
  'Kabel USB',
  'Kabel Audio',
  'HDMI Extender',
  'DI Box',
  'Soundcard',
  'HDMI Splitter',
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
  'PDU'
];

//Grades List
const GRADES = [
  'S+', 
  'S', 
  'S-', 
  'A+', 
  'A', 
  'A-', 
  'B+', 
  'B', 
  'B-', 
  'C+', 
  'C', 
  'C-', 
  'D+', 
  'D', 
  'D-', 
  'E'
];

/* Root:
  + credentials and login handler
  + login page handler
  + credentials login actuator
  + mode rendering handler */
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [mode, setMode] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //credentials and login handler
  const handleLogin = () => {
    const accessCodes = {
      '123': { role: ROLES.VIEWER, name: 'Viewer User' },
      'ivan456': { role: ROLES.EDITOR, name: 'Ivan' },
      'hien456': { role: ROLES.EDITOR, name: 'Hiendarta' },
      'henny456': { role: ROLES.EDITOR, name: 'Henny' },
      'alfons654': { role: ROLES.EDITOR, name: 'Alfons' },
      'parmin456': { role: ROLES.EDITOR, name: 'Suparmin' },
      'deni654': { role: ROLES.EDITOR, name: 'Denni' },
      '111': { role: ROLES.ADMIN, name: 'ADMIN' },
      'Mingming1234': { role: ROLES.ADMIN, name: 'Ferdynand' }
    };

    if (accessCodes[accessCode]) {
      setIsLoggedIn(true);
      setUserRole(accessCodes[accessCode].role);
      setUserName(accessCodes[accessCode].name);
      setError('');
    } else {
      setError('Per 10 Januari 2026, semua akun demo telah dihapus kecuali viewer (123). Silahkan contact admin untuk dibuatkan akun');
    }
  };

  //login page handler
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

<form className="space-y-4">
</form>

<h1 className="text-3xl font-bold text-gray-800 mb-1 text-center">
  Portal AVM UPH
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
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  //credentials login actuator
if (!mode) {
  return (
    <ModeSelection
      userName={userName}
      userRole={userRole}
      roles={ROLES}
      ModeCard={ModeCard}
      setMode={setMode}
      onLogout={() => {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName("");
        setAccessCode("");
      }}
    />
  );
}

//mode rendering handler
const renderMode = () => {
  switch (mode) {
    case 'battery':
  return <BatteryMode onBack={() => setMode(null)} userName={userName} />;
    case 'overview':
      return <OverviewMode onBack={() => setMode(null)} SCRIPT_URL={SCRIPT_URL} CATEGORIES={CATEGORIES} />;
    case 'check':
      return <CheckMode onBack={() => setMode(null)} SCRIPT_URL={SCRIPT_URL} />;
    case 'export':
      return <ExportMode onBack={() => setMode(null)} />;
    case 'history':
      return <HistoryMode onBack={() => setMode(null)} SCRIPT_URL={SCRIPT_URL} />;
    case 'update':
      return (
              <UpdateMode
              onBack={() => setMode(null)}
              userRole={userRole}
               userName={userName}
               ROLES={ROLES}
              SCRIPT_URL={SCRIPT_URL}
              CATEGORIES={CATEGORIES}
             GRADES={GRADES}
         />
     );
    case 'approvals':
      return <ApprovalsMode onBack={() => setMode(null)} userName={userName} />;
    default:
      return null;
  }
};

  return renderMode();
};

//modecard colors
const ModeCard = ({ 
  icon, title, description, onClick, color, disabled }) => {
  const inlineStyles = {
    blue: { background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)' },
    green: { background: 'linear-gradient(to bottom right, #22c55e, #16a34a)' },
    purple: { background: 'linear-gradient(to bottom right, #a855f7, #9333ea)' },
    orange: { background: 'linear-gradient(to bottom right, #f97316, #ea580c)' },
    red: { background: 'linear-gradient(to bottom right, #ef4444, #dc2626)' },
    indigo: { background: 'linear-gradient(to bottom right, #6366f1, #4f46e5)' },
    gray: { background: 'linear-gradient(to bottom right, #aeafd4c4, #a7a4db)' },
    disabled: { background: '#e5e7eb' } // gray-200
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={disabled ? inlineStyles.disabled : inlineStyles[color]}
      className={`
        rounded-lg shadow-lg p-8 transition
        ${disabled
          ? "cursor-not-allowed text-gray-400"
          : "cursor-pointer transform hover:scale-105 text-white"}
      `}
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2 text-center">{title}</h2>
      <p className="text-center opacity-90">{description}</p>
    </div>
  );
};

//export mode
const ExportMode = ({ onBack }) => {
  const [scannedIds, setScannedIds] = useState([]);
  const [currentId, setCurrentId] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const addId = () => {
    if (currentId.trim() && !scannedIds.includes(currentId.trim())) {
      setScannedIds([...scannedIds, currentId.trim()]);
      setCurrentId('');
    }
  };

  const removeId = (id) => {
    setScannedIds(scannedIds.filter(i => i !== id));
  };


  //exportCSV
const handleExportToCSV = async () => {
  console.log('scannedIds in ExportMode:', scannedIds);
  console.log('Is array?', Array.isArray(scannedIds));
  await exportToCSV(scannedIds, SCRIPT_URL);
};

const startScanning = () => {
  setScanning(true);
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

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Export Mode</h1>
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Back
            </button>
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
              onClick={scanning ? stopScanning : startScanning}
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
    <button
      onClick={() => setScanning(false)}
      className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg"
    >
      Stop Scanning
    </button>
  </div>
)}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Scanned Assets ({scannedIds.length})
            </h2>
            <button
              onClick={handleExportToCSV} //exporttocsv
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

//admin approvals mode
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

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approveRequest',
          requestId: requestId,
          approvedBy: userName
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
              <button
                onClick={onBack}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Back
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