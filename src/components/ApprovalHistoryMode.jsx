import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Image } from 'lucide-react';

const ApprovalHistoryMode = ({ userName, SCRIPT_URL }) => {
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [assetNames, setAssetNames] = useState({});
  const [activeRequesterTab, setActiveRequesterTab] = useState('recent');
  const [currentPage, setCurrentPage] = useState({});
  const [expandedCards, setExpandedCards] = useState({});

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

  const fetchApprovalHistory = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getApprovalHistory&limit=999999`);
      const data = await response.json();
      
      if (data.history) {
        setApprovalHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching approval history:', error);
    }
  };

  useEffect(() => {
    fetchAllAssets();
    fetchApprovalHistory();
  }, []);

  const getRequestType = (request) => {
    if (request.type) {
      if (request.type === 'loan') return 'Loan Update Request';
      if (request.type === 'batch') return 'Batch Update Request';
      return 'Single Update Request';
    }
    
    if (request.updates && request.updates.status) {
      const status = String(request.updates.status).toLowerCase();
      if (status.includes('kembali') || status.includes('pinjam')) {
        return 'Loan Update Request';
      }
    }
    
    if (request.ids && request.ids.length > 1) {
      return 'Batch Update Request';
    }
    
    return 'Single Update Request';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRequesters = (history) => {
    const requesters = [...new Set(history.map(h => h.requestedBy))];
    return requesters.sort();
  };

  const getFilteredApprovals = (requester, page = 0) => {
    let filtered;
    
    if (requester === 'recent') {
      // Sort all approvals by timestamp (most recent first)
      filtered = [...approvalHistory].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA; // Descending order
      });
    } else {
      filtered = approvalHistory.filter(h => h.requestedBy === requester);
    }
    
    const itemsPerPage = 5;
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      items: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      hasNext: endIndex < filtered.length,
      currentPage: page
    };
  };

  const handleNextPage = () => {
    const key = activeRequesterTab;
    setCurrentPage(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  const handlePrevPage = () => {
    const key = activeRequesterTab;
    setCurrentPage(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1)
    }));
  };

  const toggleCard = (requestId) => {
    setExpandedCards(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const handlePhotoClick = (photoUrl) => {
    if (photoUrl) {
      window.open(photoUrl, '_blank');
    }
  };

  useEffect(() => {
    const key = activeRequesterTab;
    if (!currentPage[key]) {
      setCurrentPage(prev => ({ ...prev, [key]: 0 }));
    }
  }, [activeRequesterTab]);

  const requesters = getRequesters(approvalHistory);

  const AssetBadgeSmall = ({ id }) => {
    const name = assetNames[id];
    return (
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono inline-flex items-center gap-1">
        <span className="font-semibold">{id}</span>
        {name && (
          <>
            <span className="text-blue-600">•</span>
            <span className="font-normal">{name}</span>
          </>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Riwayat Persetujuan</h1>
            <button
              onClick={fetchApprovalHistory}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {approvalHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No approval history</p>
          ) : (
            <>
              {/* Requester Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
                <button
                  onClick={() => setActiveRequesterTab('recent')}
                  className={`px-4 py-2 rounded-t-lg transition ${
                    activeRequesterTab === 'recent'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Terbaru
                </button>
                {requesters.map(requester => (
                  <button
                    key={requester}
                    onClick={() => setActiveRequesterTab(requester)}
                    className={`px-4 py-2 rounded-t-lg transition ${
                      activeRequesterTab === requester
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {requester}
                  </button>
                ))}
              </div>

              {/* Approval Cards */}
              {activeRequesterTab && (
                <div>
                  {(() => {
                    const key = activeRequesterTab;
                    const page = currentPage[key] || 0;
                    const { items, total, hasNext } = getFilteredApprovals(activeRequesterTab, page);
                    
                    return (
                      <>
                        <div className="space-y-3 mb-4">
                          {items.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              No approvals found
                            </p>
                          ) : (
                            items.map((approval, index) => {
                              const isApproved = approval.status === 'approved';
                              const isExpanded = expandedCards[approval.requestId];
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`rounded-lg border-2 ${
                                    isApproved ? 'bg-white border-green-400' : 'bg-white border-red-400'
                                  }`}
                                >
                                  {/* Card Header - Always Visible */}
                                  <div 
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() => toggleCard(approval.requestId)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className={`text-sm px-2 py-0.5 rounded font-medium ${
                                            isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                            {isApproved ? 'Approved' : 'Rejected'}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            by {approval.requestedBy}
                                          </span>
                                          {approval.approvedBy && (
                                            <span className="text-xs text-gray-500">
                                              • approved by {approval.approvedBy}
                                            </span>
                                          )}
                                          <span className="text-sm text-gray-700 font-medium">
                                            • {getRequestType(approval)}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                          {approval.ids?.length || 0} asset(s) • {approval.requestId}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">
                                          {formatDate(approval.timestamp)}
                                        </span>
                                        {isExpanded ? (
                                          <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                          <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expanded Details */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 border-t pt-4">
                                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Assets:</h4>
                                      <div className="flex flex-wrap gap-2 mb-4">
                                        {approval.ids.map((id, i) => (
                                          <AssetBadgeSmall key={i} id={id} />
                                        ))}
                                      </div>

                                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Changes Made:</h4>
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        {Object.entries(approval.updates).map(([key, value]) => (
                                          <div key={key} className="flex justify-between py-2 border-b last:border-0 text-sm">
                                            <span className="font-medium text-gray-700 capitalize">{key}:</span>
                                            {key.toLowerCase() === 'photourl' && value ? (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePhotoClick(value);
                                                }}
                                                className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition text-xs"
                                              >
                                                <Image className="w-3 h-3" />
                                                Lihat Photo
                                              </button>
                                            ) : (
                                              <span className="text-gray-900 text-right ml-4">{value || 'N/A'}</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Pagination */}
                        {total > 0 && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                              Showing {page * 5 + 1}-{Math.min((page + 1) * 5, total)} of {total}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={handlePrevPage}
                                disabled={page === 0}
                                className={`px-4 py-2 rounded-lg transition ${
                                  page === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                              >
                                Previous
                              </button>
                              <button
                                onClick={handleNextPage}
                                disabled={!hasNext}
                                className={`px-4 py-2 rounded-lg transition ${
                                  !hasNext
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalHistoryMode;
