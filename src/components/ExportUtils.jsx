// ./components/ExportUtils.js

export const exportToCSV = async (scannedIds, SCRIPT_URL) => {
  if (!scannedIds || scannedIds.length === 0) {
    alert('No assets to export');
    return;
  }

  try {
    // Try the batch endpoint first
    let response = await fetch(`${SCRIPT_URL}?action=getAssetsByIds&ids=${scannedIds.join(',')}`);
    let data = await response.json();
    
    console.log('API Response:', data); // Debug log
    
    let assets = [];
    
    // Handle different response formats
    if (Array.isArray(data)) {
      assets = data;
    } else if (data.assets && Array.isArray(data.assets)) {
      assets = data.assets;
    } else if (data.data && Array.isArray(data.data)) {
      assets = data.data;
    } else {
      // Fallback: Fetch assets individually
      console.log('Batch endpoint not available, fetching assets individually...');
      alert('Sabar yh agak lama emang ini...');
      
      for (const id of scannedIds) {
        try {
          const assetResponse = await fetch(`${SCRIPT_URL}?action=getAsset&id=${id}`);
          const assetData = await assetResponse.json();
          if (assetData && assetData.id) {
            assets.push(assetData);
          }
        } catch (err) {
          console.error(`Error fetching asset ${id}:`, err);
        }
      }
    }

    if (!assets || assets.length === 0) {
      alert('No assets found for the scanned IDs');
      return;
    }

    const headers = ['id', 'name', 'location', 'category', 'status', 'owner', 'grade', 'lastUpdated', 'updatedBy', 'remarks'];
    const csvContent = [
      headers.join(','),
      ...assets.map(asset => 
        headers.map(h => {
          const value = String(asset[h] || '').replace(/"/g, '""');
          return `"${value}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `assets_export_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Successfully exported ${assets.length} asset(s)`);
  } catch (error) {
    console.error('Error exporting:', error);
    alert('Error exporting assets: ' + error.message);
  }
};