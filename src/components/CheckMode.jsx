import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="px-4 py-2 bg-gray-50 rounded-lg">{value || '-'}</div>
  </div>
);

const CheckMode = ({ onBack, SCRIPT_URL }) => {
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
              <InfoField
  label="Photo"
  value={
    <button
      onClick={() => window.open(asset.photoUrl, "_blank")}
      className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 transition"
    >
      View Photo
    </button>
  }
/>

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

export default CheckMode;