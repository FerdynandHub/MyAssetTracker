import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Search, Download, Edit, List, Eye, Scan } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';



// Configuration - Replace with your actual Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0ZXg17cMDPTCcWZex5qKDGwoUOXrOH2_zS6-8kC1IN8I_-FtgvHEBlUZAhY8qWF42/exec';

const CATEGORIES = ['Projectors', 'Toolkit', 'TV', 'Screen', 'EventPC'];
const GRADES = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];




const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [mode, setMode] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (accessCode === '123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid access code');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
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

          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">DASTRACK WEB BASED</h1>
          <p className="text-gray-600 mb-6 text-center">Dynamic Automated Asset Tracker by Ferdynand</p>
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

  if (!mode) {
    
  return (
  <div className="min-h-[100vh] bg-gray-100 p-4 sm:p-6">
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to DASTRACK!</h1>
        <p className="text-gray-600">Select a mode to begin</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModeCard
          icon={<Eye className="w-12 h-12" />}
          title="Overview"
          description="View all assets by category"
          onClick={() => setMode('overview')}
          color="blue"
        />
        <ModeCard
          icon={<Search className="w-12 h-12" />}
          title="Check Information"
          description="Scan or search asset details"
          onClick={() => setMode('check')}
          color="green"
        />
        <ModeCard
          icon={<Download className="w-12 h-12" />}
          title="Export"
          description="Batch scan and export to CSV"
          onClick={() => setMode('export')}
          color="purple"
        />
        <ModeCard
          icon={<Edit className="w-12 h-12" />}
          title="Update Information"
          description="Update asset information"
          onClick={() => setMode('update')}
          color="orange"
        />
      </div>
    </div>
  </div>
);

  }

  const renderMode = () => {
    switch (mode) {
      case 'overview':
        return <OverviewMode onBack={() => setMode(null)} />;
      case 'check':
        return <CheckMode onBack={() => setMode(null)} />;
      case 'export':
        return <ExportMode onBack={() => setMode(null)} />;
      case 'update':
        return <UpdateMode onBack={() => setMode(null)} />;
      default:
        return null;
    }
  };

  return renderMode();
};

const ModeCard = ({ icon, title, description, onClick, color }) => {
  const inlineStyles = {
    blue: { background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)' },
    green: { background: 'linear-gradient(to bottom right, #22c55e, #16a34a)' },
    purple: { background: 'linear-gradient(to bottom right, #a855f7, #9333ea)' },
    orange: { background: 'linear-gradient(to bottom right, #f97316, #ea580c)' }
  };

  return (
    <div
      onClick={onClick}
      style={inlineStyles[color]}
      className="rounded-lg shadow-lg p-8 cursor-pointer transform hover:scale-105 transition text-white"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2 text-center">{title}</h2>
      <p className="text-center opacity-90">{description}</p>
    </div>
  );
};

const OverviewMode = ({ onBack }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const filteredAssets = selectedCategory === 'All'
    ? assets
    : assets.filter(a => a.category === selectedCategory);

  const categories = ['All', ...CATEGORIES];
  

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
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">Last Updated</th>
                    <th className="px-4 py-3 text-left">Updated By</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{asset.id}</td>
                      <td className="px-4 py-3">{asset.name}</td>
                      <td className="px-4 py-3">{asset.location}</td>
                      <td className="px-4 py-3">{asset.category}</td>
                      <td className="px-4 py-3">{asset.status}</td>
                      <td className="px-4 py-3">{asset.owner}</td>
                      <td className="px-4 py-3">{asset.grade}</td>
                      <td className="px-4 py-3">{asset.lastUpdated}</td>
                      <td className="px-4 py-3">{asset.updatedBy}</td>
                      <td className="px-4 py-3">{asset.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckMode = ({ onBack }) => {
  const [assetId, setAssetId] = useState('');
  const [asset, setAsset] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  //const videoRef = useRef(null);
  //const streamRef = useRef(null);

 // const checkAsset = async (id) => {
  //  setLoading(true);
 //   try {
  //    const response = await fetch(`${SCRIPT_URL}?action=getAsset&id=${id}`);
  //    const data = await response.json();
  //    setAsset(data);
  //  } catch (error) {
  //    console.error('Error checking asset:', error);
  //    setAsset(null);
  //  }
 //   setLoading(false);
 // };

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

  const exportToCSV = async () => {
    if (scannedIds.length === 0) {
      alert('No assets to export');
      return;
    }

    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAssetsByIds&ids=${scannedIds.join(',')}`);
      const assets = await response.json();

      const headers = ['id', 'name', 'location', 'category', 'status', 'owner', 'grade', 'lastUpdated', 'updatedBy', 'remarks'];
      const csvContent = [
        headers.join(','),
        ...assets.map(asset => 
          headers.map(h => `"${asset[h] || ''}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_export_${new Date().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error exporting assets');
    }
  };

const startScanning = () => {
  setScanning(true);
};

useEffect(() => {
  if (scanning) {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } }
    );

scanner.render(
  (decodedText) => {
    if (!scannedIds.includes(decodedText)) {
      setScannedIds([...scannedIds, decodedText]);  // ✅ Correct
    }
    scanner.clear();
    setScanning(false);
  }
);

    return () => {
      scanner.clear().catch(() => {});
    };
  }
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
              onClick={exportToCSV}
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

const UpdateMode = ({ onBack }) => {
  const [updateMode, setUpdateMode] = useState(null);

  if (!updateMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Update Information</h1>
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
                <h3 className="text-2xl font-bold mb-2 text-center">Please make sure the ID is correct (case sensitive)</h3>
              <p className="text-center opacity-90">Update one asset at a time</p>
            </div>

            <div
              onClick={() => setUpdateMode('batch')}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 cursor-pointer transform hover:scale-105 transition text-white"
            >
              <List className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-center">Batch Update</h2>
              <h3 className="text-2xl font-bold mb-2 text-center">Please make sure the ID is correct (case sensitive)</h3>
              <p className="text-center opacity-90">Update multiple assets at once</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (updateMode === 'single') {
    return <SingleUpdateMode onBack={() => setUpdateMode(null)} />;
  }

  return <BatchUpdateMode onBack={() => setUpdateMode(null)} />;
};

const SingleUpdateMode = ({ onBack }) => {
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
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Error updating asset');
    }
    setLoading(false);
  };

const startScanning = () => {
  setScanning(true);
};

useEffect(() => {
  if (scanning) {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } }
    );

 scanner.render(
  (decodedText) => {
    if (!scannedIds.includes(decodedText)) {
      setScannedIds([...scannedIds, decodedText]);  // ✅ Correct
    }
    scanner.clear();
    setScanning(false);
  }
);

    return () => {
      scanner.clear().catch(() => {});
    };
  }
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

const BatchUpdateMode = ({ onBack }) => {
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
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'batchUpdateAssets',
          ids: assetIds,
          updates: updates
        })
      });

      alert('Assets updated successfully');
      setAssetIds([]);
      setFormData({});
    } catch (error) {
      console.error('Error updating assets:', error);
      alert('Error updating assets');
    }
    setLoading(false);
  };

const startScanning = () => {
  setScanning(true);
};

useEffect(() => {
  if (scanning) {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } }
    );

  scanner.render(
  (decodedText) => {
    if (!scannedIds.includes(decodedText)) {
      setScannedIds([...scannedIds, decodedText]);  // ✅ Correct
    }
    scanner.clear();
    setScanning(false);
  }
);

    return () => {
      scanner.clear().catch(() => {});
    };
  }
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

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="px-4 py-2 bg-gray-50 rounded-lg">{value || '-'}</div>
  </div>
);

export default App;