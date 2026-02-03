import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PhotoUpload from './PhotoUpload';

const SingleUpdateMode = ({ onBack, userRole, userName, ROLES, SCRIPT_URL, CATEGORIES, GRADES }) => {
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

  const STATUSES = [
  'Available',
  'Classroom',
  'Unavailable'
];

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
                <Search className="w-5 h-5" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aset</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Terkini</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  {STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pemunya aset</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <PhotoUpload
  currentPhotoUrl={formData.photoUrl}
  onPhotoUrlChange={(url) => setFormData({...formData, photoUrl: url})}
  assetId={formData.id}
  SCRIPT_URL={SCRIPT_URL}
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

export default SingleUpdateMode;