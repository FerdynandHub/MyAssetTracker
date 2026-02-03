import React, { useState, useEffect } from 'react';
import { RefreshCw, List, Image } from 'lucide-react';

const ApprovalsMode = ({ userName, SCRIPT_URL }) => {
  const [requests, setRequests] = useState([]);
  const [assetNames, setAssetNames] = useState({});
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchAllAssets();
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this request?')) return;

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

  const handlePhotoClick = (photoUrl) => {
    if (photoUrl) {
      window.open(photoUrl, '_blank');
  }
  };

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

  // Show pending approvals
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
                        {key.toLowerCase() === 'photourl' && value ? (
                          <button
                            onClick={() => handlePhotoClick(value)}
                            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                          >
                            <Image className="w-4 h-4" />
                            View Photo
                          </button>
                        ) : (
                          <span className="text-gray-900">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsMode;