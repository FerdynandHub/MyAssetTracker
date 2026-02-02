import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, List } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PhotoUpload from './PhotoUpload';

const LoanMode = ({ onBack, userRole, userName, ROLES, SCRIPT_URL }) => {
  const [assetIds, setAssetIds] = useState([]);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showLoanedAssets, setShowLoanedAssets] = useState(false);
  const [loanedAssets, setLoanedAssets] = useState([]);
  const [loadingLoaned, setLoadingLoaned] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('recent');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const STATUSES = [
    'Available',
    'Loaned',
  ];

  const fetchLoanedAssets = async () => {
    setLoadingLoaned(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAssets`);
      const data = await response.json();
      
      // Filter for assets with status "Loaned"
      const loaned = data.filter(asset => 
        asset.status && asset.status.toLowerCase() === 'loaned'
      );
      
      setLoanedAssets(loaned);
      setShowLoanedAssets(true);
      setActiveFilterTab('recent'); // Reset to recent when opening
    } catch (error) {
      console.error('Error fetching loaned assets:', error);
      alert('Error loading loaned assets');
    }
    setLoadingLoaned(false);
  };

  const getBorrowers = (assets) => {
    const borrowers = [...new Set(
      assets
        .map(asset => {
          // Extract borrower from location field
          // Assuming format is "Location & Borrower" or just "Borrower"
          const location = asset.location || '';
          return location.trim();
        })
        .filter(loc => loc !== '')
    )];
    return borrowers.sort();
  };

  const getFilteredLoanedAssets = (filterBy) => {
    let filtered = [...loanedAssets];
    
    if (filterBy === 'recent') {
      // Sort by most recent (assuming newer entries are at the end, or we can use timestamp if available)
      // For now, we'll reverse the array to show most recent first
      filtered = filtered.reverse();
    } else {
      // Filter by specific borrower/location
      filtered = filtered.filter(asset => 
        asset.location && asset.location.trim() === filterBy
      );
    }
    
    return filtered;
  };

  const addId = () => {
    if (currentId.trim() && !assetIds.includes(currentId.trim())) {
      setAssetIds([...assetIds, currentId.trim()]);
      setCurrentId('');
    }
  };

  const removeId = (id) => {
    setAssetIds(assetIds.filter(i => i !== id));
  };

  // Validation function to check if form is complete
  const isFormValid = () => {
    return (
      assetIds.length > 0 &&
      formData.status &&
      formData.status.trim() !== '' &&
      formData.location &&
      formData.location.trim() !== '' &&
      formData.remarks &&
      formData.remarks.trim() !== '' &&
      formData.photoUrl &&
      formData.photoUrl.trim() !== ''
    );
  };

  const handleLoanUpdate = async () => {
    if (assetIds.length === 0) {
      alert('Please select at least one asset');
      return;
    }

    if (!formData.status || formData.status.trim() === '') {
      alert('Please select a status');
      return;
    }

    if (!formData.location || formData.location.trim() === '') {
      alert('Please enter location and borrower information');
      return;
    }

    if (!formData.remarks || formData.remarks.trim() === '') {
      alert('Please enter remarks');
      return;
    }

    if (!formData.photoUrl || formData.photoUrl.trim() === '') {
      alert('Please upload a photo');
      return;
    }

    const updates = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] && formData[key].trim()) {
        updates[key] = formData[key].trim();
      }
    });

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
            isBatch: true,
            type: 'loan'  
          })
        });
        alert('Loan update request submitted for admin approval');
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
            <h1 className="text-3xl font-bold text-gray-800">Loan Mode</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchLoanedAssets}
                disabled={loadingLoaned}
                className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300"
              >
                <List className="w-5 h-5" />
                {loadingLoaned ? 'Loading...' : 'View Loaned Items'}
              </button>
              <button
                onClick={onBack}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Back
              </button>
            </div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loan Update</h2>
          <p className="text-sm text-gray-600 mb-4">All fields are required. Update status, location, and remarks for selected assets</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select status (required)
                </option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi terkini & Peminjam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Enter current location and borrower name (required)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.remarks || ''}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows="3"
                placeholder="Enter remarks or notes (required)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wajib Foto <span className="text-red-500">*</span>
              </label>
              <PhotoUpload
                currentPhotoUrl={formData.photoUrl}
                onPhotoUrlChange={(url) => setFormData({...formData, photoUrl: url})}
                assetId={assetIds.length > 0 ? assetIds.join(',') : 'loan-batch'}
                SCRIPT_URL={SCRIPT_URL}
              />
            </div>

            <button
              onClick={handleLoanUpdate}
              disabled={loading || !isFormValid()}
              className={`w-full py-3 rounded-lg transition ${
                loading || !isFormValid()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {loading ? 'Updating...' : 'Update Loan Status'}
            </button>
            
            {!isFormValid() && assetIds.length > 0 && (
              <p className="text-sm text-red-600 text-center">
                Lengkapin mas..
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loaned Assets Modal */}
      {showLoanedAssets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Currently Loaned Assets ({loanedAssets.length})
              </h2>
              <button
                onClick={() => setShowLoanedAssets(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {loanedAssets.length > 0 && (
              <div className="px-6 pt-4 border-b">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setActiveFilterTab('recent')}
                    className={`px-4 py-2 rounded-t-lg transition ${
                      activeFilterTab === 'recent'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Recent (All)
                  </button>
                  {getBorrowers(loanedAssets).map(borrower => (
                    <button
                      key={borrower}
                      onClick={() => setActiveFilterTab(borrower)}
                      className={`px-4 py-2 rounded-t-lg transition ${
                        activeFilterTab === borrower
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {borrower}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-6 overflow-y-auto flex-1">
              {loanedAssets.length === 0 ? (
                <div className="text-center py-12">
                  <List className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No assets currently on loan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredLoanedAssets(activeFilterTab).map((asset, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 mb-2">
                            {asset.name || 'Unnamed Asset'}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-semibold text-gray-700">ID:</span>{' '}
                              <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {asset.id}
                              </span>
                            </p>
                            <p>
                              <span className="font-semibold text-gray-700">Category:</span>{' '}
                              {asset.category || 'N/A'}
                            </p>
                            <p>
                              <span className="font-semibold text-gray-700">Status:</span>{' '}
                              <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium">
                                {asset.status}
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-semibibold text-gray-700">Location & Borrower:</span>{' '}
                            {asset.location || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">Remarks:</span>{' '}
                            {asset.remarks || 'N/A'}
                          </p>
                          {asset.photoUrl && (
                            <a
                              href={asset.photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
                            >
                              <Camera className="w-4 h-4" />
                              View Photo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getFilteredLoanedAssets(activeFilterTab).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No assets found for this filter</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowLoanedAssets(false)}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanMode;