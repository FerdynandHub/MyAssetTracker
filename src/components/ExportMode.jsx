import React, { useState, useEffect } from 'react';
import { Camera, Download } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { exportToCSV } from './ExportUtils';

const ExportMode = ({ SCRIPT_URL }) => {
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
                +
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

export default ExportMode;
