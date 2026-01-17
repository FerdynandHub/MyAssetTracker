//base imports essentials
import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Search, Download, Edit, List, Eye, Scan, ArrowUpDown, ArrowUp, ArrowDown} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

//components
import ModeSelection from "../src/components/ModeSelection";
import { exportToCSV } from "../src/components/ExportUtils";


//roles assigntment
const ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin'
};

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNiroTzVYqfh4Dq1vW8zbD74pd6o1EQcx2_RKzTImYHxS3jK8ama33REMMvXC5VumF/exec';


//Categories List must be updated everytime theres a new category.
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


//root component
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

//moderenderinghandler
const renderMode = () => {
  switch (mode) {
    case 'battery':
  return <BatteryMode onBack={() => setMode(null)} userName={userName} />;
    case 'overview':
      return <OverviewMode onBack={() => setMode(null)} />;
    case 'check':
      return <CheckMode onBack={() => setMode(null)} />;
    case 'export':
      return <ExportMode onBack={() => setMode(null)} />;
    case 'history':  // ADD THIS
      return <HistoryMode onBack={() => setMode(null)} />;
    case 'update':
      return <UpdateMode onBack={() => setMode(null)} userRole={userRole} userName={userName} />;
    case 'approvals':
      return <ApprovalsMode onBack={() => setMode(null)} userName={userName} />;
    default:
      return null;
  }
};

  return renderMode();
};

//modecard colors
const ModeCard = ({ icon, title, description, onClick, color, disabled }) => {
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

//overview mode
const OverviewMode = ({ onBack }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAssets`);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const categories = ['All', ...CATEGORIES];

  // Filter by category
  const categoryFiltered =
    selectedCategory === 'All'
      ? assets
      : assets.filter(a => a.category === selectedCategory);

  // Filter by search term
  const searchFiltered = categoryFiltered.filter(asset => {
    if (!searchTerm) return true;
    
    // Split search term into individual words
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    
    const searchableFields = [
      asset.id,
      asset.name,
      asset.location,
      asset.owner,
      asset.status,
      asset.remarks
    ];
    
    // Combine all searchable fields into one string
    const combinedText = searchableFields
      .filter(field => field)
      .map(field => String(field).toLowerCase())
      .join(' ');
    
    // Check if ALL search words are found in the combined text
    return searchWords.every(word => combinedText.includes(word));
  });

  // Sort filtered results
  const sortedAssets = [...searchFiltered].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';

    if (aVal < bVal) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-blue-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchAssets}
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

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID, name, location, owner, status, or remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-2">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedAssets.length)} of {sortedAssets.length} results
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {categoryFiltered.length !== sortedAssets.length && ` (filtered from ${categoryFiltered.length})`}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th
                      onClick={() => handleSort('id')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        ID {getSortIcon('id')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Name {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('location')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Location {getSortIcon('location')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('category')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Category {getSortIcon('category')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Status {getSortIcon('status')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('owner')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Owner {getSortIcon('owner')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('grade')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Grade {getSortIcon('grade')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('lastUpdated')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Last Updated {getSortIcon('lastUpdated')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('updatedBy')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Updated By {getSortIcon('updatedBy')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                        No assets found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    paginatedAssets.map((asset, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{asset.id}</td>
                        <td className="px-4 py-3">{asset.name}</td>
                        <td className="px-4 py-3">{asset.location}</td>
                        <td className="px-4 py-3">{asset.category}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              asset.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : asset.status === 'Maintenance'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{asset.owner}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              asset.grade === 'A'
                                ? 'bg-green-100 text-green-800'
                                : asset.grade === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {asset.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3">{asset.lastUpdated}</td>
                        <td className="px-4 py-3">{asset.updatedBy}</td>
                        <td className="px-4 py-3">{asset.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


//check mode
const CheckMode = ({ onBack }) => {
  const streamRef = useRef(null);
  const [assetId, setAssetId] = useState('');
  const [asset, setAsset] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

 const checkAsset = async (id) => {
  setLoading(true);
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getAsset&id=${id}`);
    const data = await response.json();

    if (!data || !data.id) {
      setAsset(null);
      alert('Asset not found');
    } else {
      setAsset(data);
    }
  } catch (error) {
    console.error('Error checking asset:', error);
    setAsset(null);
  }
  setLoading(false);
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
        setAssetId(decodedText);
        checkAsset(decodedText);
        scanner.clear().catch(() => {});
        setScanning(false);
      },
      (error) => {
        // Just ignore scanning errors
      }
    );
  }

  return () => {
    if (scanner) {
      scanner.clear().catch(() => {});
    }
  };
}, [scanning]);

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const handleManualCheck = () => {
    if (assetId.trim()) {
      checkAsset(assetId.trim());
      //setAssetId('');
    }
  };

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Check Information</h1>
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
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualCheck()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualCheck}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Check
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

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {asset && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Asset Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="ID" value={asset.id} />
              <InfoField label="Name" value={asset.name} />
              <InfoField label="Location" value={asset.location} />
              <InfoField label="Category" value={asset.category} />
              <InfoField label="Status" value={asset.status} />
              <InfoField label="Owner" value={asset.owner} />
              <InfoField label="Grade" value={asset.grade} />
              <InfoField label="Last Updated" value={asset.lastUpdated} />
              <InfoField label="Updated By" value={asset.updatedBy} />
              <InfoField label="Remarks" value={asset.remarks} />
            </div>
          </div>
        )}

        {asset === null && !loading && assetId === '' && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Scan or enter an Asset ID to check information</p>
          </div>
        )}
      </div>
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


//update mode menu
const UpdateMode = ({ onBack, userRole, userName }) => {
  const [updateMode, setUpdateMode] = useState(null);

  if (!updateMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {userRole === ROLES.ADMIN ? 'Update Information' : 'Request Update'}
              </h1>
              <button
                onClick={onBack}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => setUpdateMode('single')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 cursor-pointer transform hover:scale-105 transition text-white"
            >
              <Edit className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-center">Single Update</h2>
              <h3 className="text-xl mb-2 text-center">Please make sure the ID is correct (case sensitive)</h3>
              <p className="text-center opacity-90">
                {userRole === ROLES.ADMIN ? 'Update one asset at a time' : 'Request update for one asset'}
              </p>
            </div>

            <div
              onClick={() => setUpdateMode('batch')}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 cursor-pointer transform hover:scale-105 transition text-white"
            >
              <List className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-center">Batch Update</h2>
              <h3 className="text-xl mb-2 text-center">Please make sure the ID is correct (case sensitive)</h3>
              <p className="text-center opacity-90">
                {userRole === ROLES.ADMIN ? 'Update multiple assets at once' : 'Request update for multiple assets'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (updateMode === 'single') {
    return <SingleUpdateMode onBack={() => setUpdateMode(null)} userRole={userRole} userName={userName} />;
  }

  if (updateMode === 'batch') {
    return <BatchUpdateMode onBack={() => setUpdateMode(null)} userRole={userRole} userName={userName} SCRIPT_URL={SCRIPT_URL} />;
  }
};


//single update mode
const SingleUpdateMode = ({ onBack, userRole, userName }) => {
  const [assetId, setAssetId] = useState('');
  const [asset, setAsset] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fetchAsset = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAsset&id=${id}`);
      const data = await response.json();
      setAsset(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching asset:', error);
      setAsset(null);
    }
    setLoading(false);
  };

  const handleFetch = () => {
    if (assetId.trim()) {
      fetchAsset(assetId.trim());
    }
  };

const handleUpdate = async () => {
    if (!asset) return;

    setLoading(true);
    try {
      const updates = {};
      Object.keys(formData).forEach(key => {
        if (key !== 'id' && formData[key] !== asset[key]) {
          updates[key] = formData[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        alert('No changes detected');
        setLoading(false);
        return;
      }

      if (userRole === ROLES.ADMIN) {
        // Admin: Direct update
        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateAsset',
            id: asset.id,
            updates: updates
          })
        });
        alert('Asset updated successfully');
        await fetchAsset(asset.id);
      } else {
        // Editor: Submit request
        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'submitUpdateRequest',
            ids: [asset.id],
            updates: updates,
            requestedBy: userName,
            isBatch: false
          })
        });
        alert('Update request submitted for admin approval');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(userRole === ROLES.ADMIN ? 'Error updating asset' : 'Error submitting request');
    }
    setLoading(false);
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
        setAssetId(decodedText);
        fetchAsset(decodedText);
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
}, [scanning]);

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
            <h1 className="text-3xl font-bold text-gray-800">Single Update</h1>
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
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleFetch}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Fetch
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

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {asset && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Asset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID (Read-only)</label>
                <input
                  type="text"
                  value={formData.id || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <input
                  type="text"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  value={formData.owner || ''}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  value={formData.grade || ''}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Grade</option>
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleUpdate}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
              >
                Update Asset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


//batch update mode
const BatchUpdateMode = ({ onBack, userRole, userName }) => {
  const [assetIds, setAssetIds] = useState([]);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const addId = () => {
    if (currentId.trim() && !assetIds.includes(currentId.trim())) {
      setAssetIds([...assetIds, currentId.trim()]);
      setCurrentId('');
    }
  };

  const removeId = (id) => {
    setAssetIds(assetIds.filter(i => i !== id));
  };

const handleBatchUpdate = async () => {
    if (assetIds.length === 0) {
      alert('No assets to update');
      return;
    }

    const updates = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] && formData[key].trim()) {
        updates[key] = formData[key].trim();
      }
    });

    if (Object.keys(updates).length === 0) {
      alert('No fields to update');
      return;
    }

    setLoading(true);
    try {
      if (userRole === ROLES.ADMIN) {
        // Admin: Direct update
        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'batchUpdateAssets',
            ids: assetIds,
            updates: updates
          })
        });
        alert('Assets updated successfully');
      } else {
        // Editor: Submit request
        await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'submitUpdateRequest',
            ids: assetIds,
            updates: updates,
            requestedBy: userName,
            isBatch: true
          })
        });
        alert('Batch update request submitted for admin approval');
      }
      setAssetIds([]);
      setFormData({});
    } catch (error) {
      console.error('Error:', error);
      alert(userRole === ROLES.ADMIN ? 'Error updating assets' : 'Error submitting request');
    }
    setLoading(false);
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
        if (decodedText.trim() && !assetIds.includes(decodedText.trim())) {
          setAssetIds([...assetIds, decodedText.trim()]);
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
}, [scanning, assetIds]);

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
            <h1 className="text-3xl font-bold text-gray-800">Batch Update</h1>
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Selected Assets ({assetIds.length})
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {assetIds.map((id, idx) => (
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
            {assetIds.length === 0 && (
              <p className="text-center text-gray-500 py-4">No assets selected yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Fields</h2>
          <p className="text-sm text-gray-600 mb-4">Leave fields empty to keep existing values</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Leave empty to keep existing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Leave empty to keep existing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep existing</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <input
                type="text"
                value={formData.status || ''}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                placeholder="Leave empty to keep existing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                placeholder="Leave empty to keep existing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                value={formData.grade || ''}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keep existing</option>
                {GRADES.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                value={formData.remarks || ''}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows="3"
                placeholder="Leave empty to keep existing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleBatchUpdate}
              disabled={loading || assetIds.length === 0}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update All Assets'}
            </button>
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

//history mode
const HistoryMode = ({ onBack }) => {
  const [assetId, setAssetId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchHistory = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAssetHistory&id=${id}`);
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        setHistory([]);
      } else {
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    }
    setLoading(false);
  };

  const handleCheck = () => {
    if (assetId.trim()) {
      fetchHistory(assetId.trim());
    }
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
          setAssetId(decodedText);
          fetchHistory(decodedText);
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
  }, [scanning]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Asset History</h1>
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
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCheck}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Check
              </button>
            </div>

            <button
              onClick={scanning ? () => setScanning(false) : startScanning}
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

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              History for Asset: {assetId} ({history.length} records)
            </h2>
            
            <div className="space-y-4">
              {history.map((record, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">
                        Record #{history.length - idx}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">
                        {record.lastUpdated || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated by: {record.updatedBy || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(record).map(([key, value]) => {
                      if (key === 'id' || key === 'lastUpdated' || key === 'updatedBy') return null;
                      return (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                            {key}
                          </label>
                          <p className="text-sm text-gray-900">{value || '-'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && history.length === 0 && assetId && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <List className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No history found for this asset</p>
          </div>
        )}

        {!loading && !assetId && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Scan or enter an Asset ID to view history</p>
          </div>
        )}
      </div>
    </div>
  );
};


//misc infofield
const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="px-4 py-2 bg-gray-50 rounded-lg">{value || '-'}</div>
  </div>
);

export default App;