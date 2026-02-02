import React, { useState, useEffect } from 'react';
import { RefreshCw, List } from 'lucide-react';

const ApprovalsMode = ({ userName, SCRIPT_URL }) => {
  const [requests, setRequests] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [currentPage, setCurrentPage] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getPendingRequests`);
      const data = await response.json();
      setRequests(data);
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
        if (data.history.length > 0) {
          const approvers = getApprovers(data.history);
          if (approvers.length > 0) {
            setActiveTab(approvers[0]);
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
          approvedBy: request.requestedBy
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

  const getApprovers = (history) => {
    const approvers = [...new Set(history.map(h => h.requestedBy))];
    return approvers.sort();
  };

  const getApprovalsForUser = (userName, page = 0) => {
    const userApprovals = approvalHistory.filter(h => h.requestedBy === userName);
    const itemsPerPage = 5;
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      items: userApprovals.slice(startIndex, endIndex),
      total: userApprovals.length,
      hasNext: endIndex < userApprovals.length,
      currentPage: page
    };
  };

  const handleNextPage = (userName) => {
    setCurrentPage(prev => ({
      ...prev,
      [userName]: (prev[userName] || 0) + 1
    }));
  };

  const handlePrevPage = (userName) => {
    setCurrentPage(prev => ({
      ...prev,
      [userName]: Math.max(0, (prev[userName] || 0) - 1)
    }));
  };

  const approvers = getApprovers(approvalHistory);

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
                      <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                        {id}
                      </span>
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

        {/* Approval History by User */}
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

          {approvers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No approval history</p>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
                {approvers.map(approver => (
                  <button
                    key={approver}
                    onClick={() => setActiveTab(approver)}
                    className={`px-4 py-2 rounded-t-lg transition ${
                      activeTab === approver
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {approver}
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              {activeTab && (
                <div>
                  {(() => {
                    const page = currentPage[activeTab] || 0;
                    const { items, total, hasNext } = getApprovalsForUser(activeTab, page);
                    
                    return (
                      <>
                        <div className="space-y-2 mb-4">
                          {items.map((approval, index) => {
                            const isApproved = approval.status === 'approved';
                            
                            return (
                              <div 
                                key={index} 
                                className={`p-3 rounded-lg border-2 ${
                                  isApproved ? 'bg-white border-green-400' : 'bg-white border-red-400'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm px-2 py-0.5 rounded ${
                                        isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {isApproved ? 'Approved' : 'Rejected'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {getRequestType(approval)} • {approval.ids?.length || 0} asset(s)
                                    </p>
                                    <p className="text-xs text-gray-500">Request ID: {approval.requestId}</p>
                                  </div>
                                  <div className="text-right text-xs text-gray-500">
                                    {formatDate(approval.timestamp)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Showing {page * 5 + 1}-{Math.min((page + 1) * 5, total)} of {total}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePrevPage(activeTab)}
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
                              onClick={() => handleNextPage(activeTab)}
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