import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

const RESOURCE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwcGLO5nIcqbqO3Hcobuf9GP8j9hoXxnY2D46OSFr03Pzimr93vwtoWhEU4486La74l/exec';

const ResourceCenterMode = () => {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${RESOURCE_SCRIPT_URL}?action=getResourceContent`);
      const data = await response.json();

      if (data.success) {
        setElements(data.elements || []);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📚 Resource Center</h1>
              <p className="text-gray-600 italic mt-2">"We don't react. We anticipate. We hunt."</p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchContent}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading && elements.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {elements.map((element, idx) => {
                if (element.url) {
                  return (
                    <a
                      key={idx}
                      href={element.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-blue-600 hover:text-blue-800 hover:underline transition group py-1"
                    >
                      {element.type === 'list' && (
                        <span className="text-blue-500 mt-1">•</span>
                      )}
                      <span className="flex-1">{element.text}</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-1" />
                    </a>
                  );
                }

                return (
                  <div key={idx} className="flex items-start gap-2 text-gray-700 py-1">
                    {element.type === 'list' && (
                      <span className="text-blue-500 mt-1">•</span>
                    )}
                    <span>{element.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCenterMode;
