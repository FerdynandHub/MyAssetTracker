import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader, Check } from 'lucide-react';

const PhotoUpload = ({ onPhotoUrlChange, assetId, SCRIPT_URL }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false); // Stays true once finished
  const [showWebcam, setShowWebcam] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const uploadToGoogleDrive = async (blob, fileName) => {
    const base64Data = await blobToBase64(blob);
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'uploadPhoto',
        fileName: fileName,
        base64Data: base64Data,
        mimeType: 'image/jpeg',
        assetId: assetId
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadSuccess(false); // Reset success state if starting a new upload
    setUploading(true);
    
    try {
      const compressedBlob = await compressImage(file);
      const timestamp = new Date().getTime();
      const fileName = `asset_${assetId}_${timestamp}.jpg`;
      const url = await uploadToGoogleDrive(compressedBlob, fileName);

      onPhotoUrlChange(url);
      setUploadSuccess(true); // Set to true permanently
      
      if (e.target) e.target.value = '';
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setShowWebcam(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      alert('Could not access webcam.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowWebcam(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    stopWebcam();
    setUploadSuccess(false); // Reset for new capture
    setUploading(true);

    try {
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });
      const compressedBlob = await compressImage(blob);
      const timestamp = new Date().getTime();
      const fileName = `asset_${assetId}_${timestamp}.jpg`;
      const url = await uploadToGoogleDrive(compressedBlob, fileName);

      onPhotoUrlChange(url);
      setUploadSuccess(true); // Set to true permanently
    } catch (error) {
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Photo</label>
      
      {showWebcam && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md rounded-lg border-2 border-blue-500"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Camera className="w-4 h-4" />
              Capture
            </button>
            <button
              type="button"
              onClick={stopWebcam}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showWebcam && (
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={startWebcam}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300"
          >
            <Camera className="w-4 h-4" />
            Use Webcam
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition disabled:bg-gray-300 ${uploadSuccess ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {uploading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : uploadSuccess ? (
              <><Check className="w-4 h-4" /> Done!</>
            ) : (
              <><Camera className="w-4 h-4" /> Mobile Phone Camera</>
            )}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition disabled:bg-gray-300 ${uploadSuccess ? 'bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {uploading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : uploadSuccess ? (
              <><Check className="w-4 h-4" /> Done!</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload Photo</>
            )}
          </button>
        </div>
      )}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <p className="text-xs text-gray-500">
        {uploading && <span className="block text-blue-600 font-semibold">Uploading...</span>}
        {uploadSuccess && !uploading && <span className="block text-green-600 font-semibold">✓ Photo Uploaded Successfully</span>}
      </p>
    </div>
  );
};

export default PhotoUpload;