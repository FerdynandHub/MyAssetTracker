// chatbot-config.js
// Easy-to-update knowledge base for Portal AVM Assistant
// Add new features here and chatbot automatically learns them!

export const CHATBOT_CONFIG = {
  // Base features (available to all)
  overview: {
    name: 'Daftar Data',
    menuId: 'overview',
    description: 'Lihat semua aset dengan filter kategori',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: ['daftar', 'overview', 'list', 'semua data', 'lihat semua'],
    instructions: `Untuk melihat daftar data:

1. Buka menu "Daftar Data" di sidebar
2. Gunakan filter kategori untuk mempersempit pencarian
3. Scroll untuk lihat semua aset
4. Klik pada aset untuk detail lengkap

💡 Tips: Gunakan filter untuk pencarian lebih cepat!`
  },

  check: {
    name: 'Cek Data',
    menuId: 'check',
    description: 'Cari aset spesifik dengan ID atau scan barcode',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: ['cek', 'check', 'search', 'cari', 'find', 'lihat'],
    instructions: `Untuk cek data aset, ada 2 cara:

1. Lewat Daftar Data:
• Buka menu "Daftar Data" di sidebar
• Gunakan filter kategori
• Klik pada aset untuk detail

2. Lewat Cek Data (Lebih Cepat):
• Buka menu "Cek Data"
• Masukkan ID aset atau scan barcode 📷
• Detail langsung muncul!

Mau coba yang mana? 🔍`
  },

  export: {
    name: 'Unduh Data',
    menuId: 'export',
    description: 'Export aset ke CSV dengan scan multiple barcode',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: ['export', 'unduh', 'download', 'csv', 'file'],
    instructions: `Untuk export data ke CSV:

1. Buka menu "Unduh Data" di sidebar
2. Tambahkan ID aset:
   • Ketik manual lalu klik "Add", atau
   • Klik "Scan Barcode" 📷
3. Scan beberapa aset (bisa banyak!)
4. Klik "Export to CSV" 📥
5. File akan terdownload!

💡 Tips: Scan banyak aset sekaligus untuk laporan lengkap!`
  },

  history: {
    name: 'Riwayat Data',
    menuId: 'history',
    description: 'Lihat history perubahan aset',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: ['history', 'riwayat', 'log', 'perubahan', 'audit', 'tracking'],
    instructions: `Untuk lihat riwayat perubahan:

1. Buka menu "Riwayat Data" di sidebar
2. Masukkan ID aset
   • Ketik atau scan
3. Lihat semua history 📜
   • Semua perubahan tercatat
   • Siapa yang ubah
   • Kapan diubah

Berguna untuk audit dan tracking!`
  },

  battery: {
    name: 'Baterai',
    menuId: 'battery',
    description: 'Checkout baterai AA/9V untuk event',
    roleRequired: ['editor', 'admin'],
    keywords: ['baterai', 'battery', 'batre', 'aa', '9v', 'checkout'],
    instructions: `Untuk checkout baterai:

1. Buka menu "Baterai" di sidebar
2. Pilih jenis baterai:
   • AA (baterai kecil)
   • 9V (baterai kotak)
3. Isi form:
   • Nama Anda
   • Jumlah (berapa pcs?)
   • Nama Event (untuk acara apa?)
   • Lokasi (di mana?)
4. Checkout 🔋

Sistem otomatis kurangi inventory!

Jenis baterai tersedia: AA dan 9V`,
    showLiveData: true // Will show current battery inventory
  },

  update: {
    name: 'Update Data',
    menuId: 'update',
    description: 'Update atau ajukan perubahan data aset',
    roleRequired: ['editor', 'admin'],
    keywords: ['update', 'ubah', 'edit', 'ganti', 'perbarui', 'change'],
    instructions: {
      editor: `Untuk mengajukan update data (Editor):

1. Buka menu "Ajukan Ubah Data" di sidebar
2. Pilih mode:
   • Single Update (1 aset)
   • Batch Update (banyak aset)
3. Masukkan ID aset
   • Ketik manual, atau
   • Scan barcode
4. Isi data yang ingin diubah
5. Submit → Menunggu approval admin

📋 Cek status di menu "Pengajuan Saya"`,
      admin: `Untuk update data (Admin - langsung approve):

1. Buka menu "Perbarui Data" di sidebar
2. Pilih mode:
   • Single Update (1 aset)
   • Batch Update (banyak aset sekaligus)
3. Masukkan ID aset
   • Ketik manual, atau
   • Scan barcode 📷
4. Isi data yang ingin diubah:
   • Category, Status, Location, dll
5. Update! ✅ (langsung tersimpan)

💡 Tip: Gunakan Batch Update untuk efisiensi!`
    },
    showLiveData: true // Will show pending requests count
  },

  loan: {
    name: 'Pinjam Barang',
    menuId: 'loan',
    description: 'Update status peminjaman/pengembalian barang',
    roleRequired: ['editor', 'admin'],
    keywords: ['pinjam', 'loan', 'kembalikan', 'return', 'borrow'],
    instructions: {
      editor: `Untuk pinjam/kembalikan barang:

PINJAM:
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Pinjam"
3. Scan/input ID barang
4. Isi detail peminjam
5. Submit (tunggu approval admin)

KEMBALIKAN:
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Kembali"
3. Scan/input ID barang
4. Submit

Status otomatis terupdate! 📦`,
      admin: `Untuk pinjam/kembalikan barang:

PINJAM:
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Pinjam"
3. Scan/input ID barang
4. Isi detail peminjam
5. Submit (langsung approve)

KEMBALIKAN:
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Kembali"
3. Scan/input ID barang
4. Submit

Status otomatis terupdate! 📦`
    }
  },

  myRequests: {
    name: 'Pengajuan Saya',
    menuId: 'myRequests',
    description: 'Lihat status request update yang diajukan',
    roleRequired: ['editor'],
    keywords: ['pengajuan saya', 'my request', 'status', 'request saya'],
    instructions: `Untuk cek status pengajuan Anda:

1. Buka menu "Pengajuan Saya"
2. Lihat semua request yang pernah diajukan
3. Cek status:
   • 🟡 Pending - Menunggu review admin
   • ✅ Approved - Sudah disetujui & applied
   • ❌ Rejected - Ditolak admin

💡 Jika lama pending, follow up ke admin!`,
    showLiveData: true // Will show my requests count
  },

  approvals: {
    name: 'Persetujuan Pending',
    menuId: 'approvals',
    description: 'Approve/reject request dari editor',
    roleRequired: ['admin'],
    keywords: ['approval', 'approve', 'persetujuan', 'pending', 'request'],
    instructions: `Untuk kelola approval (Admin):

1. Buka menu "Persetujuan Pending"
2. Lihat semua request dari Editor
   • Detail perubahan
   • Siapa yang mengajukan
3. Review dan putuskan:
   • ✅ Approve → Data langsung terupdate
   • ❌ Reject → Request ditolak

📋 Best practice:
• Review dengan teliti
• Pastikan data valid
• Beri feedback jika reject`,
    showLiveData: true // Will show pending requests count
  },

  scan: {
    name: 'Scan Barcode',
    menuId: null, // Not a menu, it's a feature in other menus
    description: 'Cara menggunakan barcode scanner',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: ['scan', 'barcode', 'qr', 'kamera', 'camera'],
    instructions: `Cara scan barcode:

1. Di fitur apa pun (Cek Data, Update, Export, dll)
2. Cari tombol "Scan Barcode" 📷
3. Klik → Kamera terbuka
4. Arahkan ke barcode aset
5. ID otomatis terdeteksi! ✨

💡 Tips:
• Pastikan pencahayaan cukup
• Barcode harus jelas/tidak rusak
• Pegang stabil saat scan

Lebih detail? Cek "Cara Pakai Scanner" di sidebar!`
  }
};

// General responses that don't need config
export const GENERAL_RESPONSES = {
  greeting: (userName) => 
    `Halo ${userName}! 😊 Saya AIMing, saya di sini untuk membantu Anda menggunakan Portal AVM.\n\nBeberapa hal yang bisa saya bantu:\n• Cara cek data aset\n• Cara update data\n• Cara checkout baterai\n• Cara export data\n• Dan lainnya!\n\nAda yang bisa saya bantu?`,
  
  thanks: (userName) => 
    `Sama-sama ${userName}! 😊\n\nSenang bisa membantu! Jangan ragu tanya lagi kalau ada yang perlu bantuan.\n\nSemangat kelola aset! 🚀`,
  
  help: `Saya bisa bantu dengan:

🔍 Cek Data - Cara search & lihat aset
✏️ Update Data - Cara ubah informasi
🔋 Baterai - Cara checkout baterai
📥 Export - Cara download data CSV
📦 Pinjam Barang - Cara pinjam/kembalikan
📜 Riwayat - Cara lihat history
📷 Scan - Cara pakai barcode scanner
👤 Role - Info hak akses Anda
📊 Status - Lihat statistik sistem

Ketik topik yang ingin ditanyakan!`,

  roleInfo: {
    viewer: `Role Anda: Viewer 👁️

Yang BISA dilakukan:
✅ Lihat semua data
✅ Cek informasi aset
✅ Export data ke CSV
✅ Lihat riwayat

Yang TIDAK BISA:
❌ Update data
❌ Checkout baterai
❌ Pinjam barang

Perlu akses lebih? Hubungi admin!`,

    editor: `Role Anda: Editor ✏️

Yang BISA dilakukan:
✅ Semua akses Viewer
✅ Ajukan update data (perlu approval)
✅ Checkout baterai
✅ Pinjam/kembalikan barang
✅ Lihat status pengajuan

Yang TIDAK BISA:
❌ Update langsung (harus request)
❌ Approve request

Request Anda akan direview admin!`,

    admin: `Role Anda: Admin 👑

FULL ACCESS! 🎉
✅ Update data langsung
✅ Approve/reject request
✅ Semua fitur tersedia
✅ Kelola seluruh sistem

Dengan kekuatan besar datang tanggung jawab besar! 💪`
  },

  notFound: `Hmm, saya belum paham pertanyaan ini. 🤔

Coba tanyakan tentang:
• Cara cek data
• Cara update data
• Cara checkout baterai
• Cara export data
• Status sistem
• Fitur yang tersedia

Atau ketik "help" untuk bantuan lengkap!`
};

// HOW TO ADD NEW FEATURES:
// Just add a new object above like this:
/*
  yourNewFeature: {
    name: 'Feature Name',
    menuId: 'menuId', // or null if no menu
    description: 'Short description',
    roleRequired: ['editor', 'admin'], // who can access
    keywords: ['keyword1', 'keyword2'], // trigger words
    instructions: `Step by step guide here`, // or object for role-based
    showLiveData: true // optional, if needs live data
  }
*/

export default CHATBOT_CONFIG;
