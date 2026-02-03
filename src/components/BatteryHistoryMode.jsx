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

              {/* History Cards - 2 Column Grid */}
              {activeTab && (
                <div>
                  {(() => {
                    const key = activeTab;
                    const page = currentPage[key] || 0;
                    const { items, total, hasNext } = getFilteredHistory(activeTab, page);
                    
                    return (
                      <>
                        {items.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No history found
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {items.map((entry, index) => {
                              const isAdd = entry.quantity > 0;
                              const isTake = entry.quantity < 0;
                              const isPending = entry.status === 'pending'; // Check if there's a pending status
                              const isExpanded = expandedCards[`${activeTab}-${page}-${index}`];
                              
                              // Determine border color
                              let borderColor;
                              if (isPending) {
                                borderColor = 'border-yellow-500'; // Yellow for pending
                              } else if (isAdd) {
                                borderColor = 'border-green-500'; // Green for add/restock
                              } else {
                                borderColor = 'border-red-500'; // Red for take/checkout
                              }
                              
                              // Determine badge color
                              let badgeColor;
                              if (isPending) {
                                badgeColor = 'bg-yellow-100 text-yellow-800';
                              } else if (isAdd) {
                                badgeColor = 'bg-green-100 text-green-800';
                              } else {
                                badgeColor = 'bg-red-100 text-red-800';
                              }
                              
                              // Determine badge text
                              let badgeText;
                              if (isPending) {
                                badgeText = 'Pending';
                              } else if (isAdd) {
                                badgeText = 'Add';
                              } else {
                                badgeText = 'Take';
                              }
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`rounded-lg border-2 bg-white ${borderColor} cursor-pointer hover:shadow-lg transition`}
                                  onClick={() => toggleCard(`${activeTab}-${page}-${index}`)}
                                >
                                  {/* Card Header - Always Visible */}
                                  <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-sm px-2 py-0.5 rounded font-medium ${badgeColor}`}>
                                            {badgeText}
                                          </span>
                                          <span className="text-sm font-semibold text-gray-700">
                                            {entry.batteryType}
                                          </span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800 mb-1">
                                          {entry.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-2xl font-bold ${
                                            isPending ? 'text-yellow-600' : isAdd ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            {isAdd ? '+' : ''}{entry.quantity}
                                          </span>
                                          <span className="text-sm text-gray-500">units</span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-500 mb-1">
                                          {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </span>
                                        {isExpanded ? (
                                          <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                          <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                    
                                    {!isExpanded && (
                                      <p className="text-sm text-gray-600 truncate">
                                        {entry.eventName}
                                      </p>
                                    )}
                                  </div>

                                  {/* Expanded Details */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 border-t">
                                      <div className="pt-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-600">Event:</span>
                                          <span className="text-gray-900 text-right ml-4">{entry.eventName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-600">Location:</span>
                                          <span className="text-gray-900 text-right ml-4">{entry.eventLocation || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium text-gray-600">Date & Time:</span>
                                          <span className="text-gray-900">{formatDate(entry.timestamp)}</span>
                                        </div>
                                        {isPending && (
                                          <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-600">Status:</span>
                                            <span className="text-yellow-600 font-semibold">Pending Approval</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Pagination */}
                        {total > 0 && (
                          <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-600">
                              Showing {page * 10 + 1}-{Math.min((page + 1) * 10, total)} of {total}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrevPage();
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextPage();
                                }}
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