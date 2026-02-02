import React, { useState, useEffect } from 'react';
import { RefreshCw, List, ChevronDown, ChevronUp } from 'lucide-react';

const ApprovalsMode = ({ userName, SCRIPT_URL }) => {
  const [requests, setRequests] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [assetNames, setAssetNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeRequesterTab, setActiveRequesterTab] = useState(null);
  const [currentPage, setCurrentPage] = useState({});
  const [expandedCards, setExpandedCards] = useState({});

  const fetchAssetNames = async (assetIds) => {
    try {
      const uniqueIds = [...new Set(assetIds)];
      const response = await fetch(`${SCRIPT_URL}?action=getAssetNames&ids=${uniqueIds.join(',')}`);
      const data = await response.json();
      
      if (data.assets) {
        setAssetNames(prev => ({
          ...prev,
          ...data.assets
        }));
      }
    } catch (error) {
      console.error('Error fetching asset names:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getPendingRequests`);
      const data = await response.json();
      setRequests(data);
      
      // Fetch asset names for all requests
      const allIds = data.flatMap(req => req.ids || []);
      if (allIds.length > 0) {
        await fetchAssetNames(allIds);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  const fetchApprovalHistory = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getApprovalHistory&limit=999999`);
      const data = await response.json();
      
      if (data.history) {
        setApprovalHistory(data.history);
        
        // Fetch asset names for all history items
        const allIds = data.history.flatMap(h => h.ids || []);
        if (allIds.length > 0) {
          await fetchAssetNames(allIds);
        }
        
        if (data.history.length > 0) {
          const requesters = getRequesters(data.history);
          if (requesters.length > 0) {
            setActiveRequesterTab(requesters[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching approval history:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchApprovalHistory();
  }, []);

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this request?')) return;

    const request = requests.find(r => r.requestId === requestId);

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'approveRequest',
          requestId: requestId,
          approvedBy: userName
        })
      });
      alert('Request approved successfully');
      fetchRequests();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request');
    }
  };

  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'rejectRequest',
          requestId: requestId
        })
      });
      alert('Request rejected');
      fetchRequests();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    }
  };

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
    let filtered = approvalHistory.filter(h => h.requestedBy === requester);
    
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

  useEffect(() => {
    const key = activeRequesterTab;
    if (!currentPage[key]) {
      setCurrentPage(prev => ({ ...prev, [key]: 0 }));
    }
  }, [activeRequesterTab]);

  const requesters = getRequesters(approvalHistory);

  const AssetBadge = ({ id }) => {
    const name = assetNames[id];
    return (
      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono inline-flex items-center gap-1">
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Pending Approvals</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchRequests}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-6">
            <List className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {requests.map((request, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {getRequestType(request)}
                    </h3>
                    <p className="text-sm text-gray-600">Request ID: {request.requestId}</p>
                    <p className="text-sm text-gray-600">Requested by: {request.requestedBy}</p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(request.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.requestId)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.requestId)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Assets to Update:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.ids.map((id, i) => (
                      <AssetBadge key={i} id={id} />
                    ))}
                  </div>

                  <h4 className="font-semibold text-gray-700 mb-2">Proposed Changes:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(request.updates).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium text-gray-700 capitalize">{key}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Approval History</h3>
            <button
              onClick={fetchApprovalHistory}
              className="text-sm text-blue-500 hover:text-blue-600 transition"
            >
              Refresh
            </button>
          </div>

          {requesters.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No approval history</p>
          ) : (
            <>
              {/* Requester Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
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
                                          {approval.approvedBy && (
                                            <span className="text-xs text-gray-500">
                                              by {approval.approvedBy}
                                            </span>
                                          )}
                                          <span className="text-sm text-gray-700 font-medium">
                                            {getRequestType(approval)}
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
                                            <span className="text-gray-900 text-right ml-4">{value || 'N/A'}</span>
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

export default ApprovalsMode;