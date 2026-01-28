import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const LoanMode = ({ onBack, userRole, userName, ROLES, SCRIPT_URL }) => {
  const [assetIds, setAssetIds] = useState([]);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const STATUSES = [
    'Available (kembali)',
    'Loaned (pinjam)',
  ];

  const addId = () => {
    if (currentId.trim() && !assetIds.includes(currentId.trim())) {
      setAssetIds([...assetIds, currentId.trim()]);
      setCurrentId('');
    }
  };

  const removeId = (id) => {
    setAssetIds(assetIds.filter(i => i !== id));
  };

  const handleLoanUpdate = async () => {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loan Update</h2>
          <p className="text-sm text-gray-600 mb-4">Update status, location, and remarks for selected assets</p>
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
                  Tidak berubah
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
                placeholder="Lokasi Tidak Berubah"
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
                placeholder="Catatan Tidak Berubah"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleLoanUpdate}
              disabled={loading || assetIds.length === 0}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Loan Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanMode;