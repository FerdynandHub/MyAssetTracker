import './index.css';
import React, { useState, useRef } from 'react';
import { Camera, Package, Edit, Search, Download, X, Check, Plus } from 'lucide-react';

const AssetTrackerApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMode, setCurrentMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [assets, setAssets] = useState([
    { id: 'AST001', name: 'Laptop Dell XPS', location: 'Office A', category: 'Electronics', status: 'Active', owner: 'John Doe', grade: 'A', lastUpdated: '2024-12-15', updatedBy: 'Admin', remarks: 'Working perfectly' },
    { id: 'AST002', name: 'Office Chair', location: 'Office B', category: 'Furniture', status: 'Active', owner: 'Jane Smith', grade: 'B', lastUpdated: '2024-12-14', updatedBy: 'Admin', remarks: 'Minor wear on armrest' },
    { id: 'AST003', name: 'Projector Epson', location: 'Meeting Room 1', category: 'Electronics', status: 'Maintenance', owner: 'IT Department', grade: 'C', lastUpdated: '2024-12-10', updatedBy: 'IT Support', remarks: 'Bulb replacement needed' },
    { id: 'AST004', name: 'Desk Standing', location: 'Office A', category: 'Furniture', status: 'Active', owner: 'IT Department', grade: 'A+', lastUpdated: '2024-12-16', updatedBy: 'Admin', remarks: 'New installation' },
    { id: 'AST005', name: 'Monitor LG 27"', location: 'Office B', category: 'Electronics', status: 'Active', owner: 'Jane Smith', grade: 'S', lastUpdated: '2024-12-12', updatedBy: 'Admin', remarks: 'Excellent condition' },
    { id: 'AST006', name: 'Whiteboard', location: 'Meeting Room 1', category: 'Office Supplies', status: 'Active', owner: 'Admin', grade: 'B', lastUpdated: '2024-12-08', updatedBy: 'Maintenance', remarks: 'Surface cleaned' },
    { id: 'AST007', name: 'Conference Table', location: 'Meeting Room 2', category: 'Furniture', status: 'Active', owner: 'Admin', grade: 'A', lastUpdated: '2024-12-11', updatedBy: 'Admin', remarks: 'Regular maintenance done' }
  ]);

  // --- New State for Adding Assets ---
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAssetData, setNewAssetData] = useState({
    id: '', name: '', location: '', category: 'Electronics', status: 'Active', owner: '', grade: 'A', lastUpdated: new Date().toISOString().split('T')[0], updatedBy: '', remarks: ''
  });

  const [scannedAsset, setScannedAsset] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [batchUpdateData, setBatchUpdateData] = useState({});
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const videoRef = useRef(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentMode(null);
    setScannedAsset(null);
    setInventory([]);
  };

  const selectMode = (mode) => {
    setCurrentMode(mode);
    setScannedAsset(null);
    setManualInput('');
    setShowBatchUpdate(false);
    setSelectedCategory(null);
    setIsAddingNew(false); // Reset add state when switching modes
  };

  const getCategoryCounts = () => {
    const counts = {};
    assets.forEach(asset => {
      counts[asset.category] = (counts[asset.category] || 0) + 1;
    });
    return counts;
  };

  const getAssetsByCategory = (category) => {
    return assets.filter(asset => asset.category === category);
  };

  const startScanner = async () => {
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied. Please use manual input.');
      setShowScanner(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowScanner(false);
  };

  const simulateScan = () => {
    if (currentMode === 'overview' && isAddingNew) {
        const randomId = 'AST' + Math.floor(Math.random() * 9000 + 1000);
        handleBarcodeDetected(randomId);
    } else {
        const randomAsset = assets[Math.floor(Math.random() * assets.length)];
        handleBarcodeDetected(randomAsset.id);
    }
    stopScanner();
  };

  const handleManualInput = () => {
    if (manualInput.trim()) {
      handleBarcodeDetected(manualInput.trim());
      setManualInput('');
    }
  };

  const handleBarcodeDetected = (assetId) => {
    // Logic for ADD NEW ASSET
    if (currentMode === 'overview' && isAddingNew) {
        const existing = assets.find(a => a.id === assetId);
        if (existing) {
            alert('This Asset ID already exists in the database!');
        } else {
            setNewAssetData({...newAssetData, id: assetId});
        }
        return;
    }

    // Logic for EXISTING ASSETS
    const asset = assets.find(a => a.id === assetId);
    
    if (!asset) {
      alert('Asset not found in database');
      return;
    }

    if (currentMode === 'check') {
      setScannedAsset(asset);
    } else if (currentMode === 'inventory') {
      if (!inventory.find(item => item.id === asset.id)) {
        setInventory([...inventory, asset]);
      }
    } else if (currentMode === 'update') {
      setScannedAsset(asset);
      setUpdateData(asset);
    } else if (currentMode === 'batch') {
      if (!inventory.find(item => item.id === asset.id)) {
        setInventory([...inventory, asset]);
      }
    }
  };

  const handleSaveNewAsset = () => {
    if (!newAssetData.id || !newAssetData.name) {
      alert("Asset ID and Name are required!");
      return;
    }
    setAssets([...assets, newAssetData]);
    alert("New asset added successfully!");
    setIsAddingNew(false);
    setNewAssetData({ id: '', name: '', location: '', category: 'Electronics', status: 'Active', owner: '', grade: 'A', lastUpdated: new Date().toISOString().split('T')[0], updatedBy: '', remarks: '' });
  };

  const exportInventory = () => {
    const csv = [
      ['Asset ID', 'Name', 'Location', 'Category', 'Status', 'Owner', 'Grade', 'Last Updated', 'Updated By', 'Remarks'],
      ...inventory.map(item => [item.id, item.name, item.location, item.category, item.status, item.owner, item.grade, item.lastUpdated, item.updatedBy, item.remarks])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleUpdateSingle = () => {
    const updatedAsset = {
      ...updateData,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setAssets(assets.map(a => a.id === scannedAsset.id ? updatedAsset : a));
    alert('Asset updated successfully!');
    setScannedAsset(null);
    setUpdateData({});
  };

  const handleBatchUpdate = () => {
    if (inventory.length < 2) {
      alert('Please scan at least 2 assets for batch update');
      return;
    }

    const updatedAssets = assets.map(asset => {
      if (inventory.find(item => item.id === asset.id)) {
        const updates = { lastUpdated: new Date().toISOString().split('T')[0] };
        Object.keys(batchUpdateData).forEach(key => {
          if (batchUpdateData[key]) updates[key] = batchUpdateData[key];
        });
        return { ...asset, ...updates };
      }
      return asset;
    });

    setAssets(updatedAssets);
    alert(`${inventory.length} assets updated successfully!`);
    setInventory([]);
    setBatchUpdateData({});
    setCurrentMode(null);
  };

  // --- RENDER LOGIC ---

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Package className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Asset Tracking System</h1>
            <p className="text-gray-600 mt-2">Login to continue</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Login
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">Registration available via admin only</p>
        </div>
      </div>
    );
  }

  if (!currentMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Select Mode</h1>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                Logout
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <button
              onClick={() => selectMode('overview')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105"
            >
              <Package className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 text-center">Overview</h2>
              <p className="text-gray-600 text-center mt-2">View all assets by category</p>
            </button>

            <button
              onClick={() => selectMode('check')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105"
            >
              <Search className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 text-center">Check Info</h2>
              <p className="text-gray-600 text-center mt-2">Scan barcode to view asset details</p>
            </button>

            <button
              onClick={() => selectMode('inventory')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105"
            >
              <Package className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 text-center">Inventory</h2>
              <p className="text-gray-600 text-center mt-2">Batch scan and export to CSV</p>
            </button>

            <button
              onClick={() => selectMode('update')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105"
            >
              <Edit className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 text-center">Update</h2>
              <p className="text-gray-600 text-center mt-2">Single or batch update assets</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentMode === 'overview' && 'Overview - All Assets'}
              {currentMode === 'check' && 'Check Information'}
              {currentMode === 'inventory' && 'Inventory Mode'}
              {currentMode === 'update' && 'Single Update Mode'}
              {currentMode === 'batch' && 'Batch Update Mode'}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => selectMode(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* SCANNER VIEW (Shared by Check, Inventory, Update, Batch) */}
        {!showScanner && !scannedAsset && inventory.length === 0 && !isAddingNew && currentMode !== 'overview' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <Camera className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Scan or Enter Barcode</h2>
            </div>

            {currentMode === 'update' && (
              <div className="mb-6 grid md:grid-cols-2 gap-4">
                <button
                  onClick={startScanner}
                  className="p-4 border-2 border-indigo-300 rounded-lg hover:bg-indigo-50"
                >
                  <h3 className="font-bold mb-1">Single Update</h3>
                  <p className="text-sm text-gray-600">Update one asset</p>
                </button>
                <button
                  onClick={() => selectMode('batch')}
                  className="p-4 border-2 border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  <h3 className="font-bold mb-1">Batch Update</h3>
                  <p className="text-sm text-gray-600">Update multiple assets</p>
                </button>
              </div>
            )}

            {currentMode !== 'update' && (
              <div className="space-y-4">
                <button
                  onClick={startScanner}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera Scanner
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Asset ID manually (e.g., AST001)"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleManualInput}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SHOW CAMERA UI */}
        {showScanner && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full"
                style={{ minHeight: '300px' }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={simulateScan}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Simulate Scan (Demo)
              </button>
              <button
                onClick={stopScanner}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* CHECK INFO RESULT */}
        {currentMode === 'check' && scannedAsset && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Asset Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Asset Tag ID:</span>
                <span className="text-gray-900">{scannedAsset.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-900">{scannedAsset.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Grade Quality:</span>
                <span className="text-gray-900 font-bold">{scannedAsset.grade}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Last Status:</span>
                <span className={`font-semibold ${scannedAsset.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>
                  {scannedAsset.status}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Last Location / Holder:</span>
                <span className="text-gray-900">{scannedAsset.location}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Category:</span>
                <span className="text-gray-900">{scannedAsset.category}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Owner:</span>
                <span className="text-gray-900">{scannedAsset.owner}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Last Updated Date:</span>
                <span className="text-gray-900">{scannedAsset.lastUpdated}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Latest Updated By:</span>
                <span className="text-gray-900">{scannedAsset.updatedBy}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">Last Remarks:</span>
                <span className="text-gray-900">{scannedAsset.remarks || 'No remarks'}</span>
              </div>
            </div>
            <button
              onClick={() => setScannedAsset(null)}
              className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              Scan Another
            </button>
          </div>
        )}

        {/* INVENTORY TABLE */}
        {currentMode === 'inventory' && inventory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Scanned Assets ({inventory.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportInventory}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={startScanner}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Scan More
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-2 text-sm">{item.id}</td>
                      <td className="px-4 py-2 text-sm">{item.name}</td>
                      <td className="px-4 py-2 text-sm">{item.location}</td>
                      <td className="px-4 py-2 text-sm">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SINGLE UPDATE EDIT FORM */}
        {currentMode === 'update' && scannedAsset && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Update Asset: {scannedAsset.id}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={updateData.name || ''}
                  onChange={(e) => setUpdateData({...updateData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location / Holder</label>
                <input
                  type="text"
                  value={updateData.location || ''}
                  onChange={(e) => setUpdateData({...updateData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={updateData.category || ''}
                  onChange={(e) => setUpdateData({...updateData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={updateData.status || ''}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Grade Quality</label>
                <select
                  value={updateData.grade || ''}
                  onChange={(e) => setUpdateData({...updateData, grade: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="E">E</option>
                  <option value="D">D</option>
                  <option value="C">C</option>
                  <option value="B">B</option>
                  <option value="A">A</option>
                  <option value="A+">A+</option>
                  <option value="S">S</option>
                  <option value="S+">S+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  value={updateData.owner || ''}
                  onChange={(e) => setUpdateData({...updateData, owner: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Updated By</label>
                <input
                  type="text"
                  value={updateData.updatedBy || ''}
                  onChange={(e) => setUpdateData({...updateData, updatedBy: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={updateData.remarks || ''}
                  onChange={(e) => setUpdateData({...updateData, remarks: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateSingle}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Update Asset
                </button>
                <button
                  onClick={() => setScannedAsset(null)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          )}

    {/* BATCH UPDATE STEP 1 */}
    {currentMode === 'batch' && inventory.length === 0 && (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Package className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Scan Assets for Batch Update</h2>
          <p className="text-gray-600">Scan at least 2 assets to update them together</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={startScanner}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Start Scanning
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or enter Asset ID manually"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleManualInput}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )}

    {/* BATCH UPDATE STEP 2 (LIST) */}
    {currentMode === 'batch' && inventory.length > 0 && !showBatchUpdate && (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Assets to Update ({inventory.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBatchUpdate(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Proceed to Update
            </button>
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add More
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2 text-sm">{item.id}</td>
                  <td className="px-4 py-2 text-sm">{item.name}</td>
                  <td className="px-4 py-2 text-sm">{item.location}</td>
                  <td className="px-4 py-2 text-sm">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* BATCH UPDATE STEP 3 (FIELDS) */}
    {currentMode === 'batch' && showBatchUpdate && (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Batch Update {inventory.length} Assets</h2>
        <p className="text-sm text-gray-600 mb-6">Only fill in fields you want to update. Empty fields will keep their current values.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location / Holder</label>
            <input
              type="text"
              placeholder="Leave empty to keep current values"
              value={batchUpdateData.location || ''}
              onChange={(e) => setBatchUpdateData({...batchUpdateData, location: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <input
              type="text"
              placeholder="Leave empty to keep current values"
              value={batchUpdateData.category || ''}
              onChange={(e) => setBatchUpdateData({...batchUpdateData, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={batchUpdateData.status || ''}
              onChange={(e) => setBatchUpdateData({...batchUpdateData, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Keep current values</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Grade Quality</label>
            <select
              value={batchUpdateData.grade || ''}
              onChange={(e) => setBatchUpdateData({...batchUpdateData, grade: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Keep current values</option>
              <option value="E">E</option>
              <option value="D">D</option>
              <option value="C">C</option>
              <option value="B">B</option>
              <option value="A">A</option>
              <option value="A+">A+</option>
              <option value="S">S</option>
              <option value="S+">S+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Owner</label>
            <input
              type="text"
              placeholder="Leave empty to keep current values"
              value={batchUpdateData.owner || ''}
              onChange={(e) => setBatchUpdateData({...batchUpdateData, owner: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Updated By</label>
            <input
              type="text"
              placeholder="Leave empty to keep current values"
              value={batchUpdateData.updatedBy || ''}
              onChange={(e) => setBatchUpdateData({...batchUpdateData, updatedBy: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
            <textarea
              placeholder="Leave empty to keep current values"
              value={batchUpdateData.remarks || ''}
              onChange={(e) => setBatchUpdateData({...batchUpdateData, remarks: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBatchUpdate}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Update All {inventory.length} Assets
            </button>
            <button
              onClick={() => setShowBatchUpdate(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )}

    {/* OVERVIEW: CATEGORY GRID */}
    {currentMode === 'overview' && !selectedCategory && !isAddingNew && (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Asset Categories</h2>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
          >
            <Plus size={20} /> Add New Asset
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(getCategoryCounts()).map(([category, count]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-800">{category}</h3>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {count}
                </span>
              </div>
              <p className="text-sm text-gray-600">{count} {count === 1 ? 'asset' : 'assets'}</p>
            </button>
          ))}
        </div>
      </div>
    )}

    {/* OVERVIEW: ADD NEW ASSET FORM */}
    {currentMode === 'overview' && isAddingNew && (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Register New Asset</h2>
            
            {/* ID SCANNER SECTION */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <label className="block text-sm font-bold text-gray-700 mb-2">Asset Tag ID (Scan or Type)</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Asset ID"
                        value={newAssetData.id}
                        onChange={(e) => setNewAssetData({...newAssetData, id: e.target.value})}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={startScanner} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                        <Camera />
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Asset Name *</label>
                    <input
                        type="text"
                        value={newAssetData.name}
                        onChange={(e) => setNewAssetData({...newAssetData, name: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location / Holder</label>
                    <input
                        type="text"
                        value={newAssetData.location}
                        onChange={(e) => setNewAssetData({...newAssetData, location: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select
                        value={newAssetData.category}
                        onChange={(e) => setNewAssetData({...newAssetData, category: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                    >
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Office Supplies">Office Supplies</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select
                        value={newAssetData.status}
                        onChange={(e) => setNewAssetData({...newAssetData, status: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                    >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Retired">Retired</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Grade Quality</label>
                    <select
                        value={newAssetData.grade}
                        onChange={(e) => setNewAssetData({...newAssetData, grade: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                    >
                        <option value="E">E</option>
                        <option value="D">D</option>
                        <option value="C">C</option>
                        <option value="B">B</option>
                        <option value="A">A</option>
                        <option value="A+">A+</option>
                        <option value="S">S</option>
                        <option value="S+">S+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Owner</label>
                    <input
                        type="text"
                        value={newAssetData.owner}
                        onChange={(e) => setNewAssetData({...newAssetData, owner: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Updated By</label>
                    <input
                        type="text"
                        value={newAssetData.updatedBy}
                        onChange={(e) => setNewAssetData({...newAssetData, updatedBy: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Remarks</label>
                    <textarea
                        value={newAssetData.remarks}
                        onChange={(e) => setNewAssetData({...newAssetData, remarks: e.target.value})}
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleSaveNewAsset}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                >
                    <Check /> Save Asset
                </button>
                <button
                    onClick={() => setIsAddingNew(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    )}

    {/* OVERVIEW: CATEGORY TABLE */}
    {currentMode === 'overview' && selectedCategory && !isAddingNew && (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{selectedCategory} Assets</h2>
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Categories
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Asset Tag ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location/Holder</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Updated</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {getAssetsByCategory(selectedCategory).map((asset) => (
                <tr key={asset.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{asset.grade}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.owner}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.lastUpdated}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.updatedBy}</td>
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