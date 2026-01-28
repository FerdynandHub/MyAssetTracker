import React, { useState } from 'react';
import { Edit, List, Boxes, Package } from 'lucide-react';
import SingleUpdateMode from './SingleUpdateMode';
import BatchUpdateMode from './BatchUpdateMode';



const UpdateMode = ({ onBack, userRole, userName, ROLES, SCRIPT_URL, CATEGORIES, GRADES }) => {
  const [updateMode, setUpdateMode] = useState(null);

  if (!updateMode) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {userRole === ROLES.ADMIN ? 'Update Information' : 'Request Update'}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => setUpdateMode('single')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 cursor-pointer transform hover:scale-105 transition text-white"
            >
              <Package className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-center">Update Satuan</h2>

              <p className="text-center opacity-90">
                {userRole === ROLES.ADMIN
                  ? 'Perbarui satu data aset. Pastikan ID sudah benar (case-sensitive)'
                  : 'Ajukan pembaruan untuk satu aset. Pastikan ID sudah benar (case-sensitive)'}
              </p>
            </div>

            <div
              onClick={() => setUpdateMode('batch')}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 cursor-pointer transform hover:scale-105 transition text-white"
            >
              <Boxes className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-center">Update Massal</h2>

              <p className="text-center opacity-90">
                {userRole === ROLES.ADMIN
                  ? 'Perbarui banyak data sekaligus. Pastikan semua ID sudah benar (case-sensitive)'
                  : 'Ajukan pembaruan untuk beberapa aset. Pastikan semua ID sudah benar (case-sensitive)'}
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (updateMode === 'single') {
    return (
      <SingleUpdateMode
        onBack={() => setUpdateMode(null)}
        userRole={userRole}
        userName={userName}
        ROLES={ROLES}
        SCRIPT_URL={SCRIPT_URL}
        CATEGORIES={CATEGORIES}
        GRADES={GRADES}
      />
    );
  }

  if (updateMode === 'batch') {
    return (
      <BatchUpdateMode
        onBack={() => setUpdateMode(null)}
        userRole={userRole}
        userName={userName}
        ROLES={ROLES}
        SCRIPT_URL={SCRIPT_URL}
        CATEGORIES={CATEGORIES}
        GRADES={GRADES}
      />
    );
  }

};

export default UpdateMode;