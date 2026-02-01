import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import AssetPhotoButton from './AssetPhotoButton';

const OverviewMode = ({ onBack, SCRIPT_URL, CATEGORIES }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const [selectedAsset, setSelectedAsset] = useState(null);

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

  // Get unique grades from assets (in proper order)
  const allGrades = Array.from(new Set(assets.map(a => a.grade).filter(Boolean)));
  const gradeOrder = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
  const sortedGrades = allGrades.sort((a, b) => {
    const aIndex = gradeOrder.indexOf(a.toUpperCase());
    const bIndex = gradeOrder.indexOf(b.toUpperCase());
    return aIndex - bIndex;
  });
  const grades = ['All', ...sortedGrades];

  // Get available options based on current filters
  const getAvailableCategories = () => {
    let filtered = assets;
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(a => a.location === selectedLocation);
    }
    if (selectedGrade !== 'All') {
      filtered = filtered.filter(a => a.grade === selectedGrade);
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
    if (selectedGrade !== 'All') {
      filtered = filtered.filter(a => a.grade === selectedGrade);
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
    if (selectedGrade !== 'All') {
      filtered = filtered.filter(a => a.grade === selectedGrade);
    }
    return new Set(filtered.map(a => a.location).filter(Boolean));
  };

  const getAvailableGrades = () => {
    let filtered = assets;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(a => a.location === selectedLocation);
    }
    return new Set(filtered.map(a => a.grade).filter(Boolean));
  };

  const availableCategories = getAvailableCategories();
  const availableStatuses = getAvailableStatuses();
  const availableLocations = getAvailableLocations();
  const availableGrades = getAvailableGrades();

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

  // Filter by grade
  const gradeFiltered =
    selectedGrade === 'All'
      ? locationFiltered
      : locationFiltered.filter(a => a.grade === selectedGrade);

  // Filter by search term
  const searchFiltered = gradeFiltered.filter(asset => {
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
  }, [selectedCategory, selectedStatus, selectedLocation, selectedGrade, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
          <div className="mb-3">
            <h2 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Filters</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Grade Filter */}
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Grades</option>
                {grades.filter(g => g !== 'All').map(grade => (
                  <option 
                    key={grade} 
                    value={grade}
                    disabled={!availableGrades.has(grade)}
                    style={!availableGrades.has(grade) ? { color: '#ccc' } : {}}
                  >
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-2">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedAssets.length)} of {sortedAssets.length} results
            {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedLocation !== 'All' || selectedGrade !== 'All') && (
              <span className="ml-1">
                (filtered from {assets.length} total)
              </span>
            )}
          </div>

          {/* Mobile Sort Dropdown */}
          <div className="md:hidden mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Sort By
            </label>
            <select
              value={sortConfig.key || ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleSort(e.target.value);
                } else {
                  setSortConfig({ key: null, direction: 'asc' });
                }
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Default Order</option>
              <option value="id">ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="name">Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="location">Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="category">Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="status">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="owner">Owner {sortConfig.key === 'owner' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="grade">Grade {sortConfig.key === 'grade' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="lastUpdated">Last Updated {sortConfig.key === 'lastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
              <option value="updatedBy">Updated By {sortConfig.key === 'updatedBy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</option>
            </select>
            {sortConfig.key && (
              <button
                onClick={() => {
                  setSortConfig({ 
                    key: sortConfig.key, 
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' 
                  });
                }}
                className="mt-2 w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition"
              >
                {sortConfig.direction === 'asc' ? (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4" />
                    Descending
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
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

            {/* Mobile Card View */}
            <div className="md:hidden">
              {paginatedAssets.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                  No assets found matching your search criteria
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {paginatedAssets.map((asset, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-shadow active:scale-95"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-1">ID: {asset.id}</div>
                        <div className="text-sm font-bold text-gray-800 line-clamp-2">{asset.name}</div>
                      </div>
                      
                      <div className="mb-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeClasses(asset.grade)}`}
                        >
                          {asset.grade || '-'}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between gap-1">
                          <span className="text-gray-600 shrink-0">Location:</span>
                          <span className="font-medium text-right truncate">{asset.location}</span>
                        </div>
                        
                        <div className="flex justify-between gap-1">
                          <span className="text-gray-600 shrink-0">Category:</span>
                          <span className="font-medium text-right truncate">{asset.category}</span>
                        </div>
                        
                        <div className="flex justify-between items-center gap-1">
                          <span className="text-gray-600 shrink-0">Status:</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                              asset.status === 'Available' || asset.status === 'Available (kembali)'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {asset.status}
                          </span>
                        </div>
                        
                        <div className="flex justify-between gap-1">
                          <span className="text-gray-600 shrink-0">Owner:</span>
                          <span className="font-medium text-right truncate">{asset.owner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Modal Popup */}
            {selectedAsset && (
              <div 
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4"
                onClick={() => setSelectedAsset(null)}
              >
                <div 
                  className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Asset Details</h3>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ID: {selectedAsset.id}</div>
                      <div className="text-xl font-bold text-gray-800 mb-2">{selectedAsset.name}</div>
                      <span
                        className={`inline-block px-3 py-1.5 rounded text-sm font-semibold ${getGradeClasses(selectedAsset.grade)}`}
                      >
                        {selectedAsset.grade || '-'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Location:</span>
                        <span className="text-gray-800">{selectedAsset.location}</span>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Category:</span>
                        <span className="text-gray-800">{selectedAsset.category}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            selectedAsset.status === 'Available' || selectedAsset.status === 'Available (kembali)'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {selectedAsset.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Owner:</span>
                        <span className="text-gray-800">{selectedAsset.owner}</span>
                      </div>
                      
                      {selectedAsset.remarks && (
                        <div className="border-b pb-2">
                          <span className="text-gray-600 font-medium block mb-1">Remarks:</span>
                          <p className="text-gray-800">{selectedAsset.remarks}</p>
                        </div>
                      )}
                      
                      <div className="border-b pb-2">
                        <span className="text-gray-600 font-medium block mb-1">Last Updated:</span>
                        <p className="text-gray-800">{selectedAsset.lastUpdated}</p>
                      </div>
                      
                      <div className="border-b pb-2">
                        <span className="text-gray-600 font-medium block mb-1">Updated By:</span>
                        <p className="text-gray-800">{selectedAsset.updatedBy}</p>
                      </div>
                      
                      <div className="pt-2">
                        <span className="text-gray-600 font-medium block mb-2">Photo:</span>
                        <AssetPhotoButton photoUrl={selectedAsset.photoUrl} assetId={selectedAsset.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
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