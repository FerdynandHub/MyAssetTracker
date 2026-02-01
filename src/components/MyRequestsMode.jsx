import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';


const MyRequestsMode = ({ userName, SCRIPT_URL }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

 const fetchMyRequests = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getMyRequests&userName=${encodeURIComponent(userName)}`);
    const data = await response.json();
    
    // Make sure data is an array
    if (Array.isArray(data)) {
      setRequests(data);
    } else {
      console.error('Expected array but got:', data);
      setRequests([]); // Set empty array as fallback
    }
  } catch (error) {
    console.error('Error fetching my requests:', error);
    setRequests([]); // Set empty array on error
  }
  setLoading(false);
};

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const getRequestType = (request) => {
    // Priority 1: Check explicit type field
    if (request.type) {
      if (request.type === 'loan') return 'Loan Update Request';
      if (request.type === 'batch') return 'Batch Update Request';
      return 'Single Update Request';
    }
    
    // Priority 2: Check updates for loan-specific status
    if (request.updates && request.updates.status) {
      const status = String(request.updates.status).toLowerCase();
      if (status.includes('kembali') || status.includes('pinjam')) {
        return 'Loan Update Request';
      }
    }
    
    // Priority 3: Check if batch based on IDs
    if (request.ids && request.ids.length > 1) {
      return 'Batch Update Request';
    }
    
    return 'Single Update Request';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-400 text-black',
      approved: 'bg-green-400 text-green-800',
      rejected: 'bg-red-700 text-black'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle className="w-5 h-5" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Permintaan Saya</h1>
            <button
              onClick={fetchMyRequests}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Anda belum memiliki permintaan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {getRequestType(request)}
                    </h3>
                    <p className="text-sm text-gray-600">Request ID: {request.requestId}</p>
                    <p className="text-sm text-gray-600">
                      Tanggal: {new Date(request.timestamp).toLocaleString('id-ID')}
                    </p>
                    {request.approvedBy && (
                      <p className="text-sm text-gray-600">
                        {request.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh: {request.approvedBy}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusBadge(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="font-semibold capitalize">{request.status}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Assets yang Diperbarui:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.ids.map((id, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                        {id}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-semibold text-gray-700 mb-2">Perubahan yang Diajukan:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(request.updates).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0 items-center">
                        <span className="font-medium text-gray-700 capitalize">{key}:</span>
                        {key.toLowerCase() === 'photourl' ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                          >
                            Lihat Foto
                          </a>
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

export default MyRequestsMode;