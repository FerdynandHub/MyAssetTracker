import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import AssetPhotoButton from './AssetPhotoButton';

const OverviewMode = ({ onBack, SCRIPT_URL, CATEGORIES }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

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

  const categories = ['All', ...CATEGORIES];

  // Get unique statuses from assets
  const statuses = ['All', ...new Set(assets.map(a => a.status).filter(Boolean))];

  // Get unique locations from assets
  const locations = ['All', ...Array.from(new Set(assets.map(a => a.location).filter(Boolean))).sort()];

  // Get available options based on current filters
  const getAvailableCategories = () => {
    let filtered = assets;
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(a => a.location === selectedLocation);
    }
    return new Set(filtered.map(a => a.category).filter(Boolean));
  };

  const getAvailableStatuses = () => {
    let filtered = assets;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(a => a.location === selectedLocation);
    }
    return new Set(filtered.map(a => a.status).filter(Boolean));
  };

  const getAvailableLocations = () => {
    let filtered = assets;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }
    return new Set(filtered.map(a => a.location).filter(Boolean));
  };

  const availableCategories = getAvailableCategories();
  const availableStatuses = getAvailableStatuses();
  const availableLocations = getAvailableLocations();

  // Filter by category
  const categoryFiltered =
    selectedCategory === 'All'
      ? assets
      : assets.filter(a => a.category === selectedCategory);

  // Filter by status
  const statusFiltered =
    selectedStatus === 'All'
      ? categoryFiltered
      : categoryFiltered.filter(a => a.status === selectedStatus);

  // Filter by location
  const locationFiltered =
    selectedLocation === 'All'
      ? statusFiltered
      : statusFiltered.filter(a => a.location === selectedLocation);

  // Filter by search term
  const searchFiltered = locationFiltered.filter(asset => {
    if (!searchTerm) return true;
    
    // Split search term into individual words
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    
    const searchableFields = [
      asset.id,
      asset.name,
      asset.location,
      asset.owner,
      asset.status,
      asset.remarks
    ];
    
    // Combine all searchable fields into one string
    const combinedText = searchableFields
      .filter(field => field)
      .map(field => String(field).toLowerCase())
      .join(' ');
    
    // Check if ALL search words are found in the combined text
    return searchWords.every(word => combinedText.includes(word));
  });

  // Sort filtered results
  const sortedAssets = [...searchFiltered].sort((a, b) => {
    if (!sortConfig.key) return 0;

    // Special handling for grade sorting
    if (sortConfig.key === 'grade') {
      const aGradeValue = getGradeValue(a.grade);
      const bGradeValue = getGradeValue(b.grade);
      
      if (aGradeValue < bGradeValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aGradeValue > bGradeValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }

    // Normal sorting for other columns
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';

    if (aVal < bVal) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus, selectedLocation, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Custom grade sorting order
  const getGradeValue = (grade) => {
    if (!grade) return 999; // Empty grades go to bottom
    
    const gradeOrder = {
      'S+': 1, 'S': 2, 'S-': 3,
      'A+': 4, 'A': 5, 'A-': 6,
      'B+': 7, 'B': 8, 'B-': 9,
      'C+': 10, 'C': 11, 'C-': 12,
      'D+': 13, 'D': 14, 'D-': 15,
      'E': 16
    };
    
    return gradeOrder[grade.toUpperCase()] || 999;
  };

function getGradeClasses(grade) {
  if (!grade) return 'bg-gray-100 text-gray-500';

  const g = grade.toUpperCase();

  // S grades
  if (g === 'S+' || g === 'S' || g === 'S-') {
    return 'bg-yellow-400 text-yellow-900 font-bold gold-glow';
  }

  // A grades
  if (g === 'A+' || g === 'A' || g === 'A-') {
    return 'bg-green-500 text-white font-semibold grade-a';
  }

  // B grades
  if (g === 'B+' || g === 'B' || g === 'B-') {
    return 'bg-sky-400 text-sky-900 grade-b';
  }

  // C grades
  if (g === 'C+' || g === 'C' || g === 'C-') {
    return 'bg-yellow-300 text-yellow-900 grade-c';
  }

  // D grades
  if (g === 'D+' || g === 'D' || g === 'D-') {
    return 'bg-purple-600 text-purple-200 grade-d';
  }

  // E (dead)
  if (g === 'E') {
    return 'bg-red-900 text-red-300 font-bold dead-grade';
  }

return 'bg-slate-200 text-slate-600';


}




  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-blue-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
            <div className="flex gap-2">
              <button
                onClick={fetchAssets}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID, name, location, owner, status, or remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Filters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option 
                    key={cat} 
                    value={cat}
                    disabled={!availableCategories.has(cat)}
                    style={!availableCategories.has(cat) ? { color: '#ccc' } : {}}
                  >
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                {statuses.filter(s => s !== 'All').map(status => (
                  <option 
                    key={status} 
                    value={status}
                    disabled={!availableStatuses.has(status)}
                    style={!availableStatuses.has(status) ? { color: '#ccc' } : {}}
                  >
                    {status}
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Locations</option>
                {locations.filter(l => l !== 'All').map(location => (
                  <option 
                    key={location} 
                    value={location}
                    disabled={!availableLocations.has(location)}
                    style={!availableLocations.has(location) ? { color: '#ccc' } : {}}
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-2">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedAssets.length)} of {sortedAssets.length} results
            {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedLocation !== 'All') && (
              <span className="ml-1">
                (filtered from {assets.length} total)
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th
                      onClick={() => handleSort('id')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        ID {getSortIcon('id')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Name {getSortIcon('name')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('location')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Location {getSortIcon('location')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('category')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Category {getSortIcon('category')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Status {getSortIcon('status')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('owner')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Owner {getSortIcon('owner')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('grade')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Grade {getSortIcon('grade')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('lastUpdated')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Last Updated {getSortIcon('lastUpdated')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('updatedBy')}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-300 transition"
                    >
                      <div className="flex items-center gap-2">
                        Updated By {getSortIcon('updatedBy')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-4 py-3 text-left">Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                        No assets found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    paginatedAssets.map((asset, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{asset.id}</td>
                        <td className="px-4 py-3">{asset.name}</td>
                        <td className="px-4 py-3">{asset.location}</td>
                        <td className="px-4 py-3">{asset.category}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              asset.status === 'Available' || asset.status === 'Available (kembali)'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{asset.owner}</td>
                        <td className="px-4 py-3">
                        <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getGradeClasses(asset.grade)}`}
                        >
                            {asset.grade || '-'}
                        </span>
                        </td>
                        <td className="px-4 py-3">{asset.lastUpdated}</td>
                        <td className="px-4 py-3">{asset.updatedBy}</td>
                        <td className="px-4 py-3">{asset.remarks}</td>
                        <td className="px-4 py-3">
  <AssetPhotoButton photoUrl={asset.photoUrl} assetId={asset.id} />
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewMode;