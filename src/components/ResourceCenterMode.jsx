import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, ExternalLink } from 'lucide-react';

// Hardcoded Google Apps Script URL
const RESOURCE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw59qhRICTOVvxeLzCTLoe9_U80P3Wjkf4zK1dstoO9CFfjv6dqnw0GFgpjSYPVTm5y/exec';

const ResourceCenterMode = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${RESOURCE_SCRIPT_URL}?action=getResourceContent`
      );
      const data = await response.json();

      if (data.success) {
        setContent(data.content || []);
        setLastUpdated(data.lastUpdated);
      } else {
        console.error('Error in response:', data.error);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getFileIcon = (text = '') => {
    const lower = text.toLowerCase();
    if (lower.includes('pdf')) return '📄';
    if (lower.includes('doc')) return '📘';
    if (lower.includes('xlsx') || lower.includes('xls')) return '📊';
    if (lower.includes('pptx') || lower.includes('ppt')) return '📊';
    return '📎';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📚 Resource Center</h1>
              <p className="text-gray-600 italic mt-2">
                "We don't react. We anticipate. We hunt."
              </p>
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

        {/* Content */}
        {loading && content.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <p className="text-gray-600">Loading resources...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {content.map((section, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
                  {section.title}
                </h2>

                <div className="space-y-3">
                  {(section.items || []).map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-3">
                      {item.type === 'link' ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition group"
                        >
                          <span className="text-xl">
                            {getFileIcon(item.text)}
                          </span>
                          <span className="flex-1">{item.text}</span>
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                        </a>
                      ) : (
                        <div className="flex items-start gap-2 text-gray-700">
                          {item.type === 'list-item' && (
                            <span className="text-blue-500 mt-1">•</span>
                          )}
                          <span>{item.text}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && content.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No content available. Please check your Google Doc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCenterMode;
