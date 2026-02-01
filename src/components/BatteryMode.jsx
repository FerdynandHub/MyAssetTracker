import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

const BatteryMode = ({ userName, SCRIPT_URL, userRole }) => {
  const [formData, setFormData] = useState({
    name: userName || '',
    batteryType: 'AA',
    quantity: '',
    eventName: '',
    eventLocation: ''
  });
  const [inventory, setInventory] = useState({ AA: 0, '9V': 0 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    batteryType: 'AA',
    quantity: ''
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Check if user can add batteries
  const canAddBattery = userName === 'Ivan' || userName === 'Dwiki' || userRole === ROLES.ADMIN;

  // Fetch current battery inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      console.log('Fetching inventory from:', `${SCRIPT_URL}?action=getBatteryInventory`);
      const response = await fetch(`${SCRIPT_URL}?action=getBatteryInventory`);
      const data = await response.json();
      console.log('Raw API response:', data);
      console.log('Inventory data:', data.inventory);
      
      if (data.inventory) {
        console.log('Setting inventory to:', data.inventory);
        setInventory(data.inventory);
      } else {
        console.error('No inventory field in response');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
    setLoading(false);
  };

  // Fetch recent battery transactions
  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getBatteryHistory&limit=5`);
      const data = await response.json();
      
      if (data.history) {
        setRecentTransactions(data.history);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchRecentTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.quantity || !formData.eventName || !formData.eventLocation) {
      alert('Please fill in all fields');
      return;
    }

    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // Check if enough inventory
    if (qty > inventory[formData.batteryType]) {
      alert(`Not enough ${formData.batteryType} batteries in stock! Available: ${inventory[formData.batteryType]}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'checkoutBattery',
          name: formData.name,
          batteryType: formData.batteryType,
          quantity: -qty, // Negative to subtract from inventory
          eventName: formData.eventName,
          eventLocation: formData.eventLocation
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Battery checkout successful!');
        // Reset form except name and battery type
        setFormData({
          ...formData,
          quantity: '',
          eventName: '',
          eventLocation: ''
        });
        // Refresh inventory and transactions
        fetchInventory();
        fetchRecentTransactions();
      } else {
        alert(data.error || 'Error checking out battery');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting request');
    }
    setSubmitting(false);
  };

  const handleAddBattery = async (e) => {
    e.preventDefault();
    
    const qty = parseInt(addFormData.quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'checkoutBattery',
          name: userName || 'Admin',
          batteryType: addFormData.batteryType,
          quantity: qty,  // Positive to ADD to inventory
          eventName: 'Inventory Restock',
          eventLocation: 'Warehouse'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Battery added successfully!');
        setAddFormData({ batteryType: 'AA', quantity: '' });
        setShowAddForm(false);
        fetchInventory();
        fetchRecentTransactions();
      } else {
        alert(data.error || 'Error adding battery');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting request');
    }
    setSubmitting(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Inventory Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">AA Battery Stock</h3>
            {loading ? (
              <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600">{inventory.AA}</span>
                <span className="text-gray-500">units</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">9V Battery Stock</h3>
            {loading ? (
              <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">{inventory['9V']}</span>
                <span className="text-gray-500">units</span>
              </div>
            )}
          </div>
        </div>

{/* Add Battery Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Battery to Inventory</h2>
            
            <form onSubmit={handleAddBattery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Baterai <span className="text-red-500">*</span>
                </label>
                <select
                  value={addFormData.batteryType}
                  onChange={(e) => setAddFormData({ ...addFormData, batteryType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AA">AA</option>
                  <option value="9V">9V</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qty to Add <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={addFormData.quantity}
                  onChange={(e) => setAddFormData({ ...addFormData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity to add"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                >
                  {submitting ? 'Adding...' : 'Add to Inventory'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Checkout Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Battery Checkout</h2>
            <div className="flex gap-2">
              <button
                onClick={() => canAddBattery && setShowAddForm(!showAddForm)}
                disabled={!canAddBattery}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  canAddBattery 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!canAddBattery ? 'Only Ivan and Dwiki can add batteries' : ''}
              >
                Add Battery
              </button>
              <button
                onClick={fetchInventory}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Baterai <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.batteryType}
                onChange={(e) => setFormData({ ...formData, batteryType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AA">AA</option>
                <option value="9V">9V</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qty <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {inventory[formData.batteryType]} units
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.eventLocation}
                onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event location"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Submit Checkout'
              )}
            </button>
          </form>
        </div>

        {/* Recent Transactions Log - Now at the bottom */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
            <button
              onClick={fetchRecentTransactions}
              className="text-sm text-blue-500 hover:text-blue-600 transition"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              recentTransactions.map((transaction, index) => {
                const isCheckout = transaction.quantity < 0;
                const absQty = Math.abs(transaction.quantity);
                
                return (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-2 ${
                      isCheckout ? 'bg-white border-red-400' : 'bg-white border-green-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{transaction.name}</span>
                          <span className={`text-sm px-2 py-0.5 rounded ${
isCheckout ? 'bg-white text-black' : 'bg-white text-black'
                          }`}>
                            {isCheckout ? 'Checkout' : 'Restock'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {absQty}x {transaction.batteryType} • {transaction.eventName}
                        </p>
                        {transaction.eventLocation && (
                          <p className="text-xs text-gray-500">{transaction.eventLocation}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryMode;