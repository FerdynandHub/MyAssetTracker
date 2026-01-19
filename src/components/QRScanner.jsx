import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle, RefreshCw, Video } from 'lucide-react';

export default function QRScanner({ onScanResult }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showCameraSelect, setShowCameraSelect] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isMountedRef = useRef(true);

  // Get available cameras
  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      if (devices.length > 0 && !selectedCamera) {
        // Default to back camera if available
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      }
    } catch (err) {
      console.error("Error getting cameras:", err);
      setError("Unable to access cameras. Please check permissions.");
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  const startScanning = async (cameraId = null) => {
    try {
      setError(null);
      setResult(null);
      
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      }

      const cameraToUse = cameraId || selectedCamera || { facingMode: "environment" };

      await html5QrCodeRef.current.start(
        cameraToUse,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          if (isMountedRef.current) {
            setResult(decodedText);
            if (onScanResult) {
              onScanResult(decodedText);
            }
            stopScanning();
          }
        },
        (errorMessage) => {
          // Silent error handling for continuous scanning
        }
      );
      
      setScanning(true);
      setShowCameraSelect(false);
    } catch (err) {
      if (isMountedRef.current) {
        setError("Unable to access camera. Please check permissions and try again.");
        console.error(err);
      }
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) {
          await html5QrCodeRef.current.stop();
        }
        setScanning(false);
      } catch (err) {
        console.log("Scanner stop (safe to ignore):", err);
        setScanning(false);
      }
    }
  };

  const handleCameraChange = async (cameraId) => {
    setSelectedCamera(cameraId);
    if (scanning) {
      await stopScanning();
      setTimeout(() => startScanning(cameraId), 500);
    }
  };

  const requestCameraPermission = async () => {
    setError(null);
    await getCameras();
    if (cameras.length > 0) {
      startScanning();
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          if (state === 2) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-center gap-3">
              <Camera size={32} />
              <h1 className="text-2xl font-bold">QR Code Scanner</h1>
            </div>
          </div>

          {/* Scanner Area */}
          <div className="p-6">
            {!scanning && !result && (
              <div className="text-center space-y-6">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Camera size={80} className="text-gray-400" />
                </div>
                <p className="text-gray-600">
                  Click the button below to start scanning QR codes
                </p>

                {/* Camera Selection */}
                {cameras.length > 1 && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowCameraSelect(!showCameraSelect)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Video size={20} />
                      Select Camera
                    </button>
                    
                    {showCameraSelect && (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                        {cameras.map((camera) => (
                          <button
                            key={camera.id}
                            onClick={() => setSelectedCamera(camera.id)}
                            className={`w-full text-left px-3 py-2 rounded transition text-sm ${
                              selectedCamera === camera.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => startScanning()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Scanner
                </button>
              </div>
            )}

            {scanning && (
              <div className="space-y-4">
                <div 
                  id="qr-reader" 
                  ref={scannerRef}
                  className="rounded-xl overflow-hidden border-4 border-blue-500"
                ></div>
                
                {/* Camera switch button while scanning */}
                {cameras.length > 1 && (
                  <button
                    onClick={() => setShowCameraSelect(!showCameraSelect)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Video size={20} />
                    Switch Camera
                  </button>
                )}

                {showCameraSelect && scanning && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                    {cameras.map((camera) => (
                      <button
                        key={camera.id}
                        onClick={() => handleCameraChange(camera.id)}
                        className={`w-full text-left px-3 py-2 rounded transition text-sm ${
                          selectedCamera === camera.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={stopScanning}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Stop Scanning
                </button>
                <p className="text-center text-sm text-gray-500">
                  Position the QR code within the frame
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    QR Code Detected!
                  </h3>
                  <div className="bg-white rounded-lg p-4 break-all text-sm text-gray-700 border border-green-200">
                    {result}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    startScanning();
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Scan Another
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  Camera Access Error
                </h3>
                <p className="text-sm text-gray-700 mb-4">{error}</p>
                <button
                  onClick={requestCameraPermission}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Request Camera Permission
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500 border-t">
            Powered by html5-qrcode
          </div>
        </div>
      </div>
    </div>
  );
}