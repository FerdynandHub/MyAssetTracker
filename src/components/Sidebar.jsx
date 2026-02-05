import React from 'react';
import {
  Menu,
  X,
  Eye,
  Search,
  Download,
  History,
  Edit,
  Battery,
  RefreshCw,
  BookOpenText,
  ArrowLeftRight,
  FileText,
  List,
  Moon,
  Sun,
  Tickets,
  Package,
  Boxes,
  ChevronDown,
  ClipboardList,
  Clock,
  LayoutGrid
} from 'lucide-react';

const SidebarItem = ({ icon, label, active, onClick, disabled, hasSubmenu, submenuOpen, isSubmenu }) => {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
        ${isSubmenu ? 'pl-8' : ''}
        ${active 
          ? 'bg-blue-500 text-white' 
          : disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      {hasSubmenu && (
        <div className={`transform transition-transform duration-500 ${submenuOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      )}
    </button>
  );
};

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  currentTime,
  getGreeting,
  userName,
  userRole,
  mode,
  setMode,
  ROLES,
  updateSubmenuOpen,
  setUpdateSubmenuOpen,
  loanSubmenuOpen,
  setLoanSubmenuOpen,
  approvalsSubmenuOpen,
  setApprovalsSubmenuOpen,
  batterySubmenuOpen,
  setBatterySubmenuOpen,
  dataSubmenuOpen,
  setDataSubmenuOpen,
  closeAllDropdowns,
  toggleDarkMode,
  handleLogout
}) => {
  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-[60]
      w-64 shadow-lg flex flex-col
      transform transition-transform duration-1000 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      bg-white
    `}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 relative">
        <div className="flex justify-between items-start mb-4">
          {/* User Info */}
          <div>
            <p className="text-sm text-gray-500 mb-1">{getGreeting()}</p>
            <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
            <p className="text-xs text-gray-500">({userRole})</p>
          </div>

          {/* Date/Time + Close Button */}
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-500">
              {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </p>
            <p className="text-sm font-medium text-gray-600">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
            </p>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden mt-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {/* Data Dropdown - Converted from standalone Overview */}
          <SidebarItem
            icon={<Eye className="w-5 h-5" />}
            label="Daftar Data"
            active={mode === 'overview' || mode === 'recent-updates'}
            onClick={() => {
              setUpdateSubmenuOpen(false);
              setLoanSubmenuOpen(false);
              setApprovalsSubmenuOpen(false);
              setBatterySubmenuOpen(false);
              setDataSubmenuOpen(!dataSubmenuOpen);
            }}
            hasSubmenu={true}
            submenuOpen={dataSubmenuOpen}
          />
          
          {/* Data Submenu items */}
          {dataSubmenuOpen && (
            <div className="space-y-2 overflow-hidden transition-all duration-300 ease-in-out">
              <SidebarItem
                icon={<LayoutGrid className="w-4 h-4" />}
                label="Overview"
                active={mode === 'overview'}
                onClick={() => {
                  setMode('overview');
                  setSidebarOpen(false);
                }}
                isSubmenu={true}
              />
              <SidebarItem
                icon={<Clock className="w-4 h-4" />}
                label="Recent Updates"
                active={mode === 'recent-updates'}
                onClick={() => {
                  setMode('recent-updates');
                  setSidebarOpen(false);
                }}
                isSubmenu={true}
              />
            </div>
          )}

          <SidebarItem
            icon={<Search className="w-5 h-5" />}
            label="Cek Data"
            active={mode === 'check'}
            onClick={() => {
              setMode('check');
              setSidebarOpen(false);
              closeAllDropdowns();
            }}
          />

          <SidebarItem
            icon={<Download className="w-5 h-5" />}
            label="Unduh Data"
            active={mode === 'export'}
            onClick={() => {
              setMode('export');
              setSidebarOpen(false);
              closeAllDropdowns();
            }}
          />

          <SidebarItem
            icon={<History className="w-5 h-5" />}
            label="Riwayat Data"
            active={mode === 'history'}
            onClick={() => {
              setMode('history');
              setSidebarOpen(false);
              closeAllDropdowns();
            }}
          />

          {/* Battery with Dropdown - Hidden from VIEWER */}
          {userRole !== ROLES.VIEWER && (
            <>
              <SidebarItem
                icon={<Battery className="w-5 h-5" />}
                label="Baterai"
                active={mode === 'battery' || mode === 'battery-history'}
                onClick={() => {
                  setUpdateSubmenuOpen(false);
                  setLoanSubmenuOpen(false);
                  setApprovalsSubmenuOpen(false);
                  setDataSubmenuOpen(false);
                  setBatterySubmenuOpen(!batterySubmenuOpen);
                }}
                hasSubmenu={true}
                submenuOpen={batterySubmenuOpen}
              />
              
              {/* Submenu items */}
              {batterySubmenuOpen && (
                <div className="space-y-2 overflow-hidden transition-all duration-300 ease-in-out">
                  <SidebarItem
                    icon={<Edit className="w-4 h-4" />}
                    label="Checkout"
                    active={mode === 'battery'}
                    onClick={() => {
                      setMode('battery');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                  <SidebarItem
                    icon={<History className="w-4 h-4" />}
                    label="Riwayat"
                    active={mode === 'battery-history'}
                    onClick={() => {
                      setMode('battery-history');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                </div>
              )}
            </>
          )}

          {/* Pending Approvals with Dropdown - ADMIN only */}
          {userRole === ROLES.ADMIN && (
            <>
              <SidebarItem
                icon={<RefreshCw className="w-5 h-5" />}
                label="Persetujuan"
                active={mode === 'approvals-pending' || mode === 'approvals-history'}
                onClick={() => {
                  setUpdateSubmenuOpen(false);
                  setLoanSubmenuOpen(false);
                  setBatterySubmenuOpen(false);
                  setDataSubmenuOpen(false);
                  setApprovalsSubmenuOpen(!approvalsSubmenuOpen);
                }}
                hasSubmenu={true}
                submenuOpen={approvalsSubmenuOpen}
              />
              
              {/* Submenu items */}
              {approvalsSubmenuOpen && (
                <div className="space-y-2 overflow-hidden transition-all duration-300 ease-in-out">
                  <SidebarItem
                    icon={<ClipboardList className="w-4 h-4" />}
                    label="Pending"
                    active={mode === 'approvals-pending'}
                    onClick={() => {
                      setMode('approvals-pending');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                  <SidebarItem
                    icon={<History className="w-4 h-4" />}
                    label="Riwayat"
                    active={mode === 'approvals-history'}
                    onClick={() => {
                      setMode('approvals-history');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                </div>
              )}
            </>
          )}

          {/* Update Data with Dropdown - Hidden from VIEWER */}
          {userRole !== ROLES.VIEWER && (
            <>
              <SidebarItem
                icon={<Edit className="w-5 h-5" />}
                label={userRole === ROLES.ADMIN ? "Perbarui Data" : "Ajukan Ubah Data"}
                active={mode === 'update-single' || mode === 'update-batch'}
                onClick={() => {
                  setLoanSubmenuOpen(false);
                  setApprovalsSubmenuOpen(false);
                  setBatterySubmenuOpen(false);
                  setDataSubmenuOpen(false);
                  setUpdateSubmenuOpen(!updateSubmenuOpen);
                }}
                hasSubmenu={true}
                submenuOpen={updateSubmenuOpen}
              />
              
              {/* Submenu items */}
              {updateSubmenuOpen && (
                <div className="space-y-2 overflow-hidden transition-all duration-300 ease-in-out">
                  <SidebarItem
                    icon={<Package className="w-4 h-4" />}
                    label="Update Satuan"
                    active={mode === 'update-single'}
                    onClick={() => {
                      setMode('update-single');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                  <SidebarItem
                    icon={<Boxes className="w-4 h-4" />}
                    label="Update Massal"
                    active={mode === 'update-batch'}
                    onClick={() => {
                      setMode('update-batch');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                </div>
              )}
            </>
          )}

          {/* Loan with Dropdown - Hidden from VIEWER */}
          {userRole !== ROLES.VIEWER && (
            <>
              <SidebarItem
                icon={<ArrowLeftRight className="w-5 h-5" />}
                label="Pinjam Barang"
                active={mode === 'loan-create' || mode === 'loan-history'}
                onClick={() => {
                  setUpdateSubmenuOpen(false);
                  setApprovalsSubmenuOpen(false);
                  setBatterySubmenuOpen(false);
                  setDataSubmenuOpen(false);
                  setLoanSubmenuOpen(!loanSubmenuOpen);
                }}
                hasSubmenu={true}
                submenuOpen={loanSubmenuOpen}
              />
              
              {/* Submenu items */}
              {loanSubmenuOpen && (
                <div className="space-y-2 overflow-hidden transition-all duration-300 ease-in-out">
                  <SidebarItem
                    icon={<Edit className="w-4 h-4" />}
                    label="Buat Pinjaman"
                    active={mode === 'loan-create'}
                    onClick={() => {
                      setMode('loan-create');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                  <SidebarItem
                    icon={<List className="w-4 h-4" />}
                    label="Riwayat Pinjam"
                    active={mode === 'loan-history'}
                    onClick={() => {
                      setMode('loan-history');
                      setSidebarOpen(false);
                    }}
                    isSubmenu={true}
                  />
                </div>
              )}
            </>
          )}

          {/* My Requests - For EDITOR only */}
          {userRole === ROLES.EDITOR && (
            <SidebarItem
              icon={<FileText className="w-5 h-5" />}
              label="Pengajuan Saya"
              active={mode === 'myRequests'}
              onClick={() => {
                setMode('myRequests');
                setSidebarOpen(false);
                closeAllDropdowns();
              }}
            />
          )}

          {/* Classroom Center - Hidden from VIEWER */}
          {userRole !== ROLES.VIEWER && (
            <SidebarItem
              icon={<BookOpenText className="w-5 h-5" />}
              label="Pusat Classroom"
              active={false}
              onClick={() => {
                window.open(
                  "https://docs.google.com/document/d/1nQZMGHu7H5A4cRY08elEqtDZfLe-NB-ySr3_jbc3Nbs/edit?tab=t.ajkay86zze5j",
                  "_blank"
                );
                setSidebarOpen(false);
                closeAllDropdowns();
              }}
            />
          )}

          <SidebarItem
            icon={<BookOpenText className="w-5 h-5" />}
            label="Cara Pakai Scanner"
            active={false}
            onClick={() => {
              window.open(
                "https://docs.google.com/document/d/1fUivFvMW9HVQ_ht3nKEDjVCSI4Pq2G-dlQD7cCDKtjo/edit?tab=t.0",
                "_blank"
              );
              setSidebarOpen(false);
              closeAllDropdowns();
            }}
          />

          <SidebarItem
            icon={<Tickets className="w-5 h-5" />}
            label="Buka Tiket"
            active={false}
            onClick={() => {
              window.open(
                "https://onestopservice.uph.edu",
                "_blank"
              );
              setSidebarOpen(false);
              closeAllDropdowns();
            }}
          />
        </div>
      </nav>

      {/* Logout & Dark Mode Toggle */}
      <div className={`p-4 border-t space-y-2 border-gray-200`}>
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition
            bg-gray-200 text-gray-700 hover:bg-gray-300
          `}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;