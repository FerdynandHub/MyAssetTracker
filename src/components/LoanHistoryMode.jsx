import React, { useState, useEffect } from 'react';
import { Camera, List, RefreshCw } from 'lucide-react';

const LoanHistoryMode = ({ userName, SCRIPT_URL }) => {
  const [loanedAssets, setLoanedAssets] = useState([]);
  const [loadingLoaned, setLoadingLoaned] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('recent');
  const [assetNames, setAssetNames] = useState({});

  // Fetch asset name by ID
  const fetchAssetName = async (id) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAsset&id=${encodeURIComponent(id)}`);
      const asset = await response.json();
      
      if (asset && asset.name) {
        return asset.name;
      }
      return id;
    } catch (error) {
      console.error(`Error fetching asset ${id}:`, error);
      return id;
    }
  };

  // Fetch names for multiple asset IDs with batching
  const fetchAssetNames = async (ids) => {
    const idsToFetch = ids.filter(id => !assetNames[id]);
    
    if (idsToFetch.length === 0) return;
    
    const batchSize = 5;
    
    for (let i = 0; i < idsToFetch.length; i += batchSize) {
      const batch = idsToFetch.slice(i, i + batchSize);
      const names = {};
      
      const promises = batch.map(async (id) => {
        const name = await fetchAssetName(id);
        names[id] = name;
      });
      
      await Promise.all(promises);
      setAssetNames(prev => ({ ...prev, ...names }));
    }
  };

  const fetchLoanedAssets = async () => {
    setLoadingLoaned(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getApprovalHistory&limit=999999`);
      const data = await response.json();
      
      if (data.history) {
        const loaned = data.history.filter(item => 
          item.status === 'approved' && 
          item.type === 'loan' &&
          item.updates &&
          item.updates.status &&
          item.updates.status.toLowerCase() === 'loaned'
        );
        
        setLoanedAssets(loaned);
        
        const allIds = loaned.flatMap(loan => loan.ids || []);
        const uniqueIds = [...new Set(allIds)];
        await fetchAssetNames(uniqueIds);
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
      filtered = filtered.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    } else {
      filtered = filtered.filter(asset => asset.requestedBy === filterBy);
    }
    
    return filtered;
  };

  useEffect(() => {
    fetchLoanedAssets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
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
                              <div key={i} className="bg-blue-50 rounded px-3 py-1 border border-blue-200 inline-flex items-center gap-2">
                                <span className="font-mono text-xs text-blue-900 font-semibold">
                                  {id}
                                </span>
                                {assetNames[id] && assetNames[id] !== id && (
                                  <>
                                    <span className="text-blue-600">•</span>
                                    <span className="text-xs text-gray-700">
                                      {assetNames[id]}
                                    </span>
                                  </>
                                )}
                              </div>
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

export default LoanHistoryMode;
