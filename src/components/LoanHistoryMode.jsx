import React, { useState, useEffect } from 'react';
import { Camera, List, RefreshCw, X } from 'lucide-react';

const LoanHistoryMode = ({ userName, SCRIPT_URL }) => {
  const [loanedAssets, setLoanedAssets] = useState([]);
  const [loadingLoaned, setLoadingLoaned] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('recent');
  const [assetNames, setAssetNames] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Fetch all assets at once and create a name map
  const fetchAllAssets = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAssets`);
      const data = await response.json();
      
      // Create a mapping of id -> name from all assets
      const nameMap = {};
      data.forEach(asset => {
        if (asset.id && asset.name) {
          nameMap[asset.id] = asset.name;
        }
      });
      
      setAssetNames(nameMap);
    } catch (error) {
      console.error('Error fetching assets:', error);
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
    
    // Apply requester filter
    if (filterBy === 'recent') {
      filtered = filtered.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    } else {
      filtered = filtered.filter(asset => asset.requestedBy === filterBy);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loan => {
        // Search in asset IDs
        const matchesId = loan.ids?.some(id => id.toLowerCase().includes(query));
        
        // Search in asset names
        const matchesName = loan.ids?.some(id => {
          const name = assetNames[id];
          return name && name.toLowerCase().includes(query);
        });
        
        // Search in location
        const matchesLocation = loan.updates?.location?.toLowerCase().includes(query);
        
        // Search in remarks
        const matchesRemarks = loan.updates?.remarks?.toLowerCase().includes(query);
        
        // Search in requester name
        const matchesRequester = loan.requestedBy?.toLowerCase().includes(query);
        
        return matchesId || matchesName || matchesLocation || matchesRemarks || matchesRequester;
      });
    }
    
    return filtered;
  };

  useEffect(() => {
    fetchAllAssets(); // Fetch all asset names at once
    fetchLoanedAssets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Aset yang belum kembali ({loanedAssets.length})
            </h2>
            <button
              onClick={fetchLoanedAssets}
              className="text-sm text-blue-500 hover:text-blue-600 transition"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Muat Ulang
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari berdasarkan ID, nama aset, lokasi, catatan, atau peminjam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
                  Terbaru
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

              {/* Loaned Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredLoanedAssets(activeFilterTab).length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-600">Tidak ada data untuk filter ini</p>
                  </div>
                ) : (
                  getFilteredLoanedAssets(activeFilterTab).map((loan, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedLoan(loan)}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all"
                    >
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                            Belum Kembali
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {loan.requestedBy}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(loan.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Aset:</h4>
                        <div className="flex flex-wrap gap-2">
                          {loan.ids && loan.ids.slice(0, 3).map((id, i) => (
                            <div key={i} className="rounded px-3 py-1 border border-blue-200 inline-flex items-center gap-2">
                              <span className="font-mono text-xs text-black font-semibold">
                                {id}
                              </span>
                              {assetNames[id] && assetNames[id] !== id && (
                                <>
                                  <span className="text-black">•</span>
                                  <span className="text-xs text-black">
                                    {assetNames[id]}
                                  </span>
                                </>
                              )}
                            </div>
                          ))}
                          {loan.ids && loan.ids.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{loan.ids.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <div className="truncate">
                          <span className="font-semibold">Lokasi:</span> {loan.updates?.location || 'N/A'}
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

      {/* Modal for detailed view */}
      {selectedLoan && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLoan(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Detail Peminjaman</h3>
              <button 
                onClick={() => setSelectedLoan(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                  Belum Kembali
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Peminjam:</p>
                <p className="text-gray-900">{selectedLoan.requestedBy}</p>
              </div>

              {selectedLoan.approvedBy && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Disetujui oleh:</p>
                  <p className="text-gray-900">{selectedLoan.approvedBy}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700">Tanggal:</p>
                <p className="text-gray-900">{new Date(selectedLoan.timestamp).toLocaleString('id-ID')}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Aset:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLoan.ids && selectedLoan.ids.map((id, i) => (
                    <div key={i} className="rounded px-3 py-1 border border-blue-200 inline-flex items-center gap-2">
                      <span className="font-mono text-xs text-black font-semibold">
                        {id}
                      </span>
                      {assetNames[id] && assetNames[id] !== id && (
                        <>
                          <span className="text-black">•</span>
                          <span className="text-xs text-black">
                            {assetNames[id]}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Status:</p>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                  {selectedLoan.updates?.status || 'N/A'}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Lokasi & Peminjam:</p>
                <p className="text-gray-900">{selectedLoan.updates?.location || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Catatan:</p>
                <p className="text-gray-900">{selectedLoan.updates?.remarks || 'N/A'}</p>
              </div>

              {selectedLoan.updates?.photoUrl && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Foto:</p>
                  <a
                    href={selectedLoan.updates.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg"
                  >
                    <Camera className="w-5 h-5" />
                    Lihat Foto
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanHistoryMode;