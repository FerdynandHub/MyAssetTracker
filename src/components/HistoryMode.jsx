import React, { useState, useEffect } from 'react';
import { Camera, Search, List } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import AssetPhotoButton from './AssetPhotoButton';

const HistoryMode = ({ onBack, SCRIPT_URL }) => {
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
                      if (key === 'id' || key === 'lastUpdated' || key === 'updatedBy' || key === 'photoUrl') return null;
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
                  
                  {/* Photo section */}
                  {record.photoUrl && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Photo</label>
                      <AssetPhotoButton photoUrl={record.photoUrl} assetId={record.id} />
                    </div>
                  )}
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

export default HistoryMode;