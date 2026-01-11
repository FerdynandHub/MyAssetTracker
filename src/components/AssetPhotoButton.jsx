import React from 'react';
import { Image } from 'lucide-react';

const AssetPhotoButton = ({ photoUrl }) => {
  // Disabled if no photo
  if (!photoUrl) {
    return (
      <button
        disabled
        className="px-3 py-1 bg-gray-200 text-gray-400 rounded-lg text-sm cursor-not-allowed flex items-center gap-1"
        title="No photo available"
      >
        <Image className="w-4 h-4" />
        No Photo
      </button>
    );
  }

  return (
    <button
      onClick={() => window.open(photoUrl, '_blank', 'noopener,noreferrer')}
      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center gap-1"
      title="Open photo in new tab"
    >
      <Image className="w-4 h-4" />
      View
    </button>
  );
};

export default AssetPhotoButton;
