import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, X } from 'lucide-react';
import AssetPhotoButton from './AssetPhotoButton';

const RecentUpdatesMode = ({ SCRIPT_URL }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAssets`);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Parse date from string format (e.g., "05/02/2025 14:30")
  const parseDate = (dateString) => {
    if (!dateString) return new Date(0);
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      return new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
    } catch (e) {
      return new Date(0);
    }
  };

  // Filter by time period
  const filterByTime = (asset) => {
    if (timeFilter === 'all') return true;
    
    const assetDate = parseDate(asset.lastUpdated);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (timeFilter) {
      case 'today':
        return assetDate >= today;
      case 'week':
        return assetDate >= weekAgo;
      case 'month':
        return assetDate >= monthAgo;
      default:
        return true;
    }
  };

  // Get recent updates sorted by date
  const getRecentUpdates = () => {
    return [...assets]
      .filter(filterByTime)
      .sort((a, b) => {
        const dateA = parseDate(a.lastUpdated);
        const dateB = parseDate(b.lastUpdated);
        return dateB - dateA;
      });
  };

  const recentUpdates = getRecentUpdates();

  const getGradeClasses = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-500';

    const g = grade.toUpperCase();

    if (g === 'S+' || g === 'S' || g === 'S-') {
      return 'bg-yellow-400 text-yellow-900 font-bold gold-glow';
    }
    if (g === 'A+' || g === 'A' || g === 'A-') {
      return 'bg-green-500 text-white font-semibold grade-a';
    }
    if (g === 'B+' || g === 'B' || g === 'B-') {
      return 'bg-sky-400 text-sky-900 grade-b';
    }
    if (g === 'C+' || g === 'C' || g === 'C-') {
      return 'bg-yellow-300 text-yellow-900 grade-c';
    }
    if (g === 'D+' || g === 'D' || g === 'D-') {
      return 'bg-purple-600 text-purple-200 grade-d';
    }
    if (g === 'E') {
      return 'bg-red-900 text-red-300 font-bold dead-grade';
    }

    return 'bg-slate-200 text-slate-600';
  };

  // Get relative time (e.g., "2 jam lalu", "1 hari lalu")
  const getRelativeTime = (dateString) => {
    const date = parseDate(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    if (minutes > 0) return `${minutes} menit lalu`;
    return 'Baru saja';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-800">Pembaruan Terkini</h1>
            </div>
            <button
              onClick={fetchAssets}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang
            </button>
          </div>

          {/* Time Filter */}
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semua Waktu
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-4">
            Menampilkan {recentUpdates.length} pembaruan terkini
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop Grid View - 2 Columns */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              {recentUpdates.length === 0 ? (
                <div className="col-span-2 bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                  Tidak ada pembaruan terkini untuk periode waktu ini
                </div>
              ) : (
                recentUpdates.map((asset, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer flex flex-col"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {/* Asset Info */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">ID: {asset.id}</div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{asset.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeClasses(asset.grade)}`}>
                            {asset.grade || '-'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            asset.status === 'Available' || asset.status === 'Available (kembali)'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {asset.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lokasi:</span>
                          <span className="font-medium text-gray-800 text-right">{asset.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kategori:</span>
                          <span className="font-medium text-gray-800 text-right">{asset.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pemilik:</span>
                          <span className="font-medium text-gray-800 text-right">{asset.owner}</span>
                        </div>
                        {asset.remarks && (
                          <div className="pt-1">
                            <span className="text-gray-600">Catatan:</span>
                            <p className="text-gray-800 text-sm mt-1 line-clamp-2">{asset.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Update Info - Bottom */}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-xs text-blue-600 font-semibold mb-1">
                            {getRelativeTime(asset.lastUpdated)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {asset.lastUpdated}
                          </div>
                          <div className="text-xs text-gray-600">
                            oleh <span className="font-medium">{asset.updatedBy}</span>
                          </div>
                        </div>
                        <div className="ml-2">
                          <AssetPhotoButton photoUrl={asset.photoUrl} assetId={asset.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Card View - 2 Columns */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {recentUpdates.length === 0 ? (
                <div className="col-span-2 bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                  Tidak ada pembaruan terkini untuk periode waktu ini
                </div>
              ) : (
                recentUpdates.map((asset, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-1 truncate">ID: {asset.id}</div>
                        <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">{asset.name}</h3>
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeClasses(asset.grade)}`}>
                        {asset.grade || '-'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs mb-3">
                      <div>
                        <span className="text-gray-600">Lokasi:</span>
                        <div className="font-medium text-gray-800 truncate">{asset.location}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Kategori:</span>
                        <div className="font-medium text-gray-800 truncate">{asset.category}</div>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          asset.status === 'Available' || asset.status === 'Available (kembali)'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-2 text-xs">
                      <div className="text-blue-600 font-semibold mb-1 truncate">{getRelativeTime(asset.lastUpdated)}</div>
                      <div className="text-gray-500 text-xs truncate">{asset.lastUpdated}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Modal Popup */}
            {selectedAsset && (
              <div 
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedAsset(null)}
              >
                <div 
                  className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-lg font-bold text-gray-800">Detail Aset</h3>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ID: {selectedAsset.id}</div>
                      <div className="text-xl font-bold text-gray-800 mb-2">{selectedAsset.name}</div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1.5 rounded text-sm font-semibold ${getGradeClasses(selectedAsset.grade)}`}>
                          {selectedAsset.grade || '-'}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                          selectedAsset.status === 'Available' || selectedAsset.status === 'Available (kembali)'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedAsset.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Lokasi:</span>
                        <span className="text-gray-800">{selectedAsset.location}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Kategori:</span>
                        <span className="text-gray-800">{selectedAsset.category}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Pemilik:</span>
                        <span className="text-gray-800">{selectedAsset.owner}</span>
                      </div>
                      {selectedAsset.remarks && (
                        <div className="border-b pb-2">
                          <span className="text-gray-600 font-medium block mb-1">Catatan:</span>
                          <p className="text-gray-800">{selectedAsset.remarks}</p>
                        </div>
                      )}
                      <div className="border-b pb-2 bg-blue-50 -mx-4 px-4 py-3 rounded">
                        <div className="text-blue-600 font-semibold mb-1">
                          Diperbarui {getRelativeTime(selectedAsset.lastUpdated)}
                        </div>
                        <div className="text-gray-600">{selectedAsset.lastUpdated}</div>
                        <div className="text-gray-600">oleh {selectedAsset.updatedBy}</div>
                      </div>
                      <div className="pt-2">
                        <span className="text-gray-600 font-medium block mb-2">Foto:</span>
                        <AssetPhotoButton photoUrl={selectedAsset.photoUrl} assetId={selectedAsset.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentUpdatesMode;