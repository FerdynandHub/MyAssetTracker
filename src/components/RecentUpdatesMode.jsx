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

  // Get relative time (e.g., "2 hours ago", "1 day ago")
  const getRelativeTime = (dateString) => {
    const date = parseDate(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl font-bold text-gray-800">Recent Updates</h1>
            </div>
            <button
              onClick={fetchAssets}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Time Filter */}
          <div className="mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'today'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'week'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 rounded-lg transition ${
                  timeFilter === 'month'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {recentUpdates.length} recent update{recentUpdates.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop List View */}
            <div className="hidden md:block space-y-3">
              {recentUpdates.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                  No recent updates found for this time period
                </div>
              ) : (
                recentUpdates.map((asset, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Section - Asset Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">ID: {asset.id}</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{asset.name}</h3>
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
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-gray-600">Location:</span>{' '}
                            <span className="font-medium text-gray-800">{asset.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>{' '}
                            <span className="font-medium text-gray-800">{asset.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Owner:</span>{' '}
                            <span className="font-medium text-gray-800">{asset.owner}</span>
                          </div>
                          {asset.remarks && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Remarks:</span>{' '}
                              <span className="text-gray-800">{asset.remarks}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Update Info */}
                      <div className="text-right">
                        <div className="text-xs text-purple-600 font-semibold mb-1">
                          {getRelativeTime(asset.lastUpdated)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {asset.lastUpdated}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          by <span className="font-medium">{asset.updatedBy}</span>
                        </div>
                        <div className="mt-2">
                          <AssetPhotoButton photoUrl={asset.photoUrl} assetId={asset.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {recentUpdates.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                  No recent updates found for this time period
                </div>
              ) : (
                recentUpdates.map((asset, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">ID: {asset.id}</div>
                        <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{asset.name}</h3>
                      </div>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold shrink-0 ${getGradeClasses(asset.grade)}`}>
                        {asset.grade || '-'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-800">{asset.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium text-gray-800">{asset.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          asset.status === 'Available' || asset.status === 'Available (kembali)'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium text-gray-800">{asset.owner}</span>
                      </div>
                    </div>

                    <div className="border-t pt-2 text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-purple-600 font-semibold">{getRelativeTime(asset.lastUpdated)}</div>
                          <div className="text-gray-500">{asset.lastUpdated}</div>
                          <div className="text-gray-600">by {asset.updatedBy}</div>
                        </div>
                        <AssetPhotoButton photoUrl={asset.photoUrl} assetId={asset.id} />
                      </div>
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
                    <h3 className="text-lg font-bold text-gray-800">Asset Details</h3>
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
                        <span className="text-gray-600 font-medium">Location:</span>
                        <span className="text-gray-800">{selectedAsset.location}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Category:</span>
                        <span className="text-gray-800">{selectedAsset.category}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Owner:</span>
                        <span className="text-gray-800">{selectedAsset.owner}</span>
                      </div>
                      {selectedAsset.remarks && (
                        <div className="border-b pb-2">
                          <span className="text-gray-600 font-medium block mb-1">Remarks:</span>
                          <p className="text-gray-800">{selectedAsset.remarks}</p>
                        </div>
                      )}
                      <div className="border-b pb-2 bg-purple-50 -mx-4 px-4 py-3 rounded">
                        <div className="text-purple-600 font-semibold mb-1">
                          Updated {getRelativeTime(selectedAsset.lastUpdated)}
                        </div>
                        <div className="text-gray-600">{selectedAsset.lastUpdated}</div>
                        <div className="text-gray-600">by {selectedAsset.updatedBy}</div>
                      </div>
                      <div className="pt-2">
                        <span className="text-gray-600 font-medium block mb-2">Photo:</span>
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
