import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const BatteryHistoryMode = ({ userName, SCRIPT_URL }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState({});
  const [expandedCards, setExpandedCards] = useState({});

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getBatteryHistory&limit=999999`);
      const data = await response.json();
      
      if (data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching battery history:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsers = (history) => {
    const users = [...new Set(history.map(h => h.name))];
    return users.sort();
  };

  const getFilteredHistory = (filter, page = 0) => {
    let filtered;
    
    if (filter === 'all') {
      // Sort all history by timestamp (most recent first)
      filtered = [...history].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    } else {
      filtered = history.filter(h => h.name === filter);
    }
    
    const itemsPerPage = 10;
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
    const key = activeTab;
    setCurrentPage(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  const handlePrevPage = () => {
    const key = activeTab;
    setCurrentPage(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1)
    }));
  };

  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    const key = activeTab;
    if (!currentPage[key]) {
      setCurrentPage(prev => ({ ...prev, [key]: 0 }));
    }
  }, [activeTab]);

  const users = getUsers(history);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Riwayat Baterai</h1>
            <button
              onClick={fetchHistory}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No battery history</p>
          ) : (
            <>
              {/* User Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-t-lg transition ${
                    activeTab === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                {users.map(user => (
                  <button
                    key={user}
                    onClick={() => setActiveTab(user)}
                    className={`px-4 py-2 rounded-t-lg transition ${
                      activeTab === user
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {user}
                  </button>
                ))}
              </div>

              {/* History Cards */}
              {activeTab && (
                <div>
                  {(() => {
                    const key = activeTab;
                    const page = currentPage[key] || 0;
                    const { items, total, hasNext } = getFilteredHistory(activeTab, page);
                    
                    return (
                      <>
                        <div className="space-y-3 mb-4">
                          {items.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              No history found
                            </p>
                          ) : (
                            items.map((entry, index) => {
                              const isCheckout = entry.quantity < 0;
                              const isRestock = entry.eventName === 'Inventory Restock';
                              const isExpanded = expandedCards[`${activeTab}-${page}-${index}`];
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`rounded-lg border-2 ${
                                    isRestock 
                                      ? 'bg-white border-green-400' 
                                      : 'bg-white border-blue-400'
                                  }`}
                                >
                                  {/* Card Header - Always Visible */}
                                  <div 
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() => toggleCard(`${activeTab}-${page}-${index}`)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className={`text-sm px-2 py-0.5 rounded font-medium ${
                                            isRestock 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-blue-100 text-blue-800'
                                          }`}>
                                            {isRestock ? 'Restock' : 'Checkout'}
                                          </span>
                                          <span className="text-sm font-semibold text-gray-700">
                                            {entry.batteryType}
                                          </span>
                                          <span className={`text-sm font-bold ${
                                            isRestock ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            {isRestock ? '+' : ''}{entry.quantity}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                          by {entry.name}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">
                                          {formatDate(entry.timestamp)}
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
                                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-700">Name:</span>
                                          <span className="text-gray-900">{entry.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-700">Battery Type:</span>
                                          <span className="text-gray-900">{entry.batteryType}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-700">Quantity:</span>
                                          <span className={`font-bold ${
                                            isRestock ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            {isRestock ? '+' : ''}{entry.quantity}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-700">Event Name:</span>
                                          <span className="text-gray-900">{entry.eventName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-700">Event Location:</span>
                                          <span className="text-gray-900">{entry.eventLocation || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-700">Date:</span>
                                          <span className="text-gray-900">{formatDate(entry.timestamp)}</span>
                                        </div>
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
                              Showing {page * 10 + 1}-{Math.min((page + 1) * 10, total)} of {total}
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

export default BatteryHistoryMode;
