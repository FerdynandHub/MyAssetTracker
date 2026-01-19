import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const BatteryMode = ({ userName, SCRIPT_URL }) => {
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

  // Fetch current battery inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getBatteryInventory`);
      const data = await response.json();
      if (data.inventory) {
        setInventory(data.inventory);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
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
        // Refresh inventory
        fetchInventory();
      } else {
        alert(data.error || 'Error checking out battery');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting request');
    }
    setSubmitting(false);
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

        {/* Checkout Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Battery Checkout</h2>
            <button
              onClick={fetchInventory}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                required
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
      </div>
    </div>
  );
};

export default BatteryMode;