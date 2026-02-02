import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, List, RefreshCw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PhotoUpload from './PhotoUpload';

const LoanMode = ({ onBack, userRole, userName, ROLES, SCRIPT_URL }) => {
  const [assetIds, setAssetIds] = useState([]);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
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
      const response = await fetch(`${SCRIPT_URL}?action=getApprovalHistory&limit=999999`);
      const data = await response.json();
      
      if (data.history) {
        // Filter for approved loan requests
        const loaned = data.history.filter(item => 
          item.status === 'approved' && 
          item.type === 'loan' &&
          item.updates &&
          item.updates.status &&
          item.updates.status.toLowerCase() === 'loaned'
        );
        
        setLoanedAssets(loaned);
      }
    } catch (error) {
      console.error('Error fetching loaned assets:', error);
    }
    setLoadingLoaned(false);
  };

  const getRequesters = (assets) => {
    const requesters = [...new Set(
      assets.map(asset => asset.requestedBy).filter(r => r)
    )];
    return requesters.sort();
  };

  const getFilteredLoanedAssets = (filterBy) => {
    let filtered = [...loanedAssets];
    
    if (filterBy === 'recent') {
      // Sort by most recent first
      filtered = filtered.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    } else {
      // Filter by specific requester
      filtered = filtered.filter(asset => asset.requestedBy === filterBy);
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
    fetchLoanedAssets();
  }, []);

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Mode Peminjaman</h1>
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan ID Aset"
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
              {scanning ? 'Hentikan Scan' : 'Scan Barcode'}
            </button>
          </div>

          {scanning && (
            <div className="mt-4">
              <div id="reader"></div>
              <button
                onClick={() => setScanning(false)}
                className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg"
              >
                Hentikan Scan
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Aset Terpilih ({assetIds.length})
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {assetIds.map((id, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-mono">{id}</span>
                <button
                  onClick={() => removeId(id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            ))}
            {assetIds.length === 0 && (
              <p className="text-center text-gray-500 py-4">Belum ada aset yang dipilih</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pembaruan Peminjaman</h2>
          <p className="text-sm text-gray-600 mb-4">Semua kolom wajib diisi. Perbarui status, lokasi, dan catatan untuk aset yang dipilih</p>
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
                  Pilih status (wajib)
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
                placeholder="Masukkan lokasi terkini dan nama peminjam (wajib)"
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
                placeholder="Masukkan catatan (wajib)"
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
              {loading ? 'Memperbarui...' : 'Perbarui Status Peminjaman'}
            </button>
            
            {!isFormValid() && assetIds.length > 0 && (
              <p className="text-sm text-red-600 text-center">
                Lengkapin mas..
              </p>
            )}
          </div>
        </div>

        {/* Daftar Aset yang Sedang Dipinjam */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Aset yang Sedang Dipinjam ({loanedAssets.length})
            </h2>
            <button
              onClick={fetchLoanedAssets}
              className="text-sm text-blue-500 hover:text-blue-600 transition"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Muat Ulang
            </button>
          </div>

          {loadingLoaned ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : loanedAssets.length === 0 ? (
            <div className="text-center py-12">
              <List className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Tidak ada aset yang sedang dipinjam</p>
            </div>
          ) : (
            <>
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
                <button
                  onClick={() => setActiveFilterTab('recent')}
                  className={`px-4 py-2 rounded-t-lg transition ${
                    activeFilterTab === 'recent'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Terbaru (Semua)
                </button>
                {getRequesters(loanedAssets).map(requester => (
                  <button
                    key={requester}
                    onClick={() => setActiveFilterTab(requester)}
                    className={`px-4 py-2 rounded-t-lg transition ${
                      activeFilterTab === requester
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {requester}
                  </button>
                ))}
              </div>

              {/* Loaned Assets List */}
              <div className="space-y-4">
                {getFilteredLoanedAssets(activeFilterTab).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Tidak ada data untuk filter ini</p>
                  </div>
                ) : (
                  getFilteredLoanedAssets(activeFilterTab).map((loan, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                            Dipinjam
                          </span>
                          <span className="text-sm text-gray-600">
                            oleh {loan.requestedBy}
                          </span>
                          {loan.approvedBy && (
                            <span className="text-sm text-gray-600">
                              • disetujui oleh {loan.approvedBy}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(loan.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Aset:</h4>
                          <div className="flex flex-wrap gap-2">
                            {loan.ids && loan.ids.map((id, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Status:</span>{' '}
                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                              {loan.updates?.status || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Lokasi & Peminjam:</span>{' '}
                            <span className="text-gray-900">{loan.updates?.location || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Catatan:</span>{' '}
                            <span className="text-gray-900">{loan.updates?.remarks || 'N/A'}</span>
                          </div>
                          {loan.updates?.photoUrl && (
                            <a
                              href={loan.updates.photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                            >
                              <Camera className="w-4 h-4" />
                              Lihat Foto
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanMode;