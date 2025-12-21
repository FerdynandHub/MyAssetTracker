import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-3 bg-blue-500 text-white rounded-lg md:hidden shadow-lg"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-40 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } md:hidden`}
      >
        <div className="p-6 flex flex-col gap-4">
          <button
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-blue-500 transition"
          >
            Overview
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-green-500 transition"
          >
            Check Info
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-purple-500 transition"
          >
            Export
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-orange-500 transition"
          >
            Update
          </button>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {open && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
        />
      )}
    </>
  );
};

export default MobileMenu;
