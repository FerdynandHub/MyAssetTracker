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
    keywords: [
      // Formal
      'daftar', 'overview', 'list', 'semua data', 'lihat semua', 'tampilkan semua',
      // Casual
      'liat semua', 'mau liat data', 'tunjukin semua', 'data apa aja', 'ada apa aja',
      'mau liat list', 'show all', 'tampil semua', 'daftar aset', 'list aset',
      // Questions
      'gimana cara liat semua', 'gimana liat daftar', 'cara liat semua data',
      'dimana liat semua', 'dimana daftar', 'mau tau semua data'
    ],
    instructions: `Oke, gampang! Buat liat daftar semua data:

1. Buka menu "Daftar Data" di sidebar (yang di kiri itu lho)
2. Mau lebih spesifik? Pakai filter kategori aja biar ga ribet
3. Scroll aja buat liat semuanya
4. Klik aset yang mau dilihat detailnya

💡 Pro tips: Pakai filter biar ga pusing nyari! Jauh lebih cepet 😉`
  },

  check: {
    name: 'Cek Data',
    menuId: 'check',
    description: 'Cari aset spesifik dengan ID atau scan barcode',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: [
      // Formal
      'cek', 'check', 'search', 'cari', 'find', 'lihat', 'periksa', 'telusuri',
      // Casual
      'nyari', 'cari barang', 'mau cek', 'mau cari', 'mau liat', 'liat data',
      'cek aset', 'cari aset', 'nyari aset', 'dimana barang', 'ada dimana',
      // With ID
      'cek id', 'cari id', 'search by id', 'pakai id', 'input id',
      // Questions
      'gimana cara cek', 'gimana cari barang', 'cara search', 'cara cek data',
      'mau tau info barang', 'info aset', 'detail barang', 'detail aset',
      'barang apa', 'aset apa'
    ],
    instructions: `Ada 2 cara nih buat cek data aset, pilih yang cocok aja:

**Cara 1: Lewat Daftar Data** (kalau ga tau ID-nya)
• Buka menu "Daftar Data" di sidebar
• Filter kategori yang kamu cari
• Klik asetnya langsung deh!

**Cara 2: Lewat Cek Data** (kalau udah tau ID)
• Buka menu "Cek Data"
• Tinggal masukin ID aset atau scan barcode-nya 📷
• Boom! Detail langsung muncul 🎯

Yang mana nih? Cara 2 lebih cepet kalau udah tau ID-nya!`
  },

  export: {
    name: 'Unduh Data',
    menuId: 'export',
    description: 'Export aset ke CSV dengan scan multiple barcode',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: [
      // Formal
      'export', 'unduh', 'download', 'csv', 'file', 'ekspor',
      // Casual
      'donlot', 'bikin file', 'mau download', 'mau unduh', 'ambil data',
      'save data', 'simpan data', 'extract data',
      // Actions
      'export csv', 'download csv', 'bikin csv', 'buat file csv',
      'mau file', 'butuh file', 'perlu file',
      // Questions
      'gimana download', 'gimana export', 'cara unduh', 'cara download data',
      'bisa download', 'bisa export', 'bisa unduh'
    ],
    instructions: `Mau download data ke CSV? Gampang banget!

1. Buka menu "Unduh Data" di sidebar
2. Masukin ID aset yang mau di-export:
   • Bisa ketik manual terus klik "Add", atau
   • Langsung scan barcode aja 📷 (lebih praktis!)
3. Mau banyak? Scan terus aja, ga ada limit!
4. Udah selesai? Klik "Export to CSV" 📥
5. File langsung ke-download otomatis!

💡 Pro tips: Scan banyak sekalian biar langsung komplit laporannya! Efisien kan? 😎`
  },

  history: {
    name: 'Riwayat Data',
    menuId: 'history',
    description: 'Lihat history perubahan aset',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: [
      // Formal
      'history', 'riwayat', 'log', 'perubahan', 'audit', 'tracking', 'jejak',
      // Casual
      'histori', 'liat history', 'cek history', 'liat riwayat', 'track',
      'lihat perubahan', 'cek perubahan', 'log perubahan',
      // Questions
      'siapa yang ubah', 'kapan diubah', 'apa yang berubah', 'perubahan apa',
      'gimana cek history', 'cara liat riwayat', 'mau tau history',
      'ada perubahan', 'udah diubah', 'pernah diubah',
      // Actions
      'tracking aset', 'audit trail', 'cek audit', 'monitor perubahan'
    ],
    instructions: `Mau tau siapa yang ngubah apa? History lengkap ada di sini!

1. Buka menu "Riwayat Data" di sidebar
2. Masukin ID aset yang mau dicek
   • Bisa ketik atau scan langsung
3. Jreng! Semua history muncul 📜
   • Semua perubahan dari awal tercatat
   • Siapa yang ngubah (nama user-nya)
   • Kapan tepatnya diubah

Berguna banget buat audit sama tracking! Jadi kalau ada yang aneh, langsung ketahuan deh 🕵️`
  },

  battery: {
    name: 'Baterai',
    menuId: 'battery',
    description: 'Checkout baterai AA/9V untuk event',
    roleRequired: ['editor', 'admin'],
    keywords: [
      // Formal
      'baterai', 'battery', 'batre', 'aa', '9v', 'checkout', 'ambil baterai',
      // Casual
      'batere', 'batrei', 'mau ambil baterai', 'pinjam baterai', 'butuh baterai',
      'perlu baterai', 'checkout batre', 'ambil batre',
      // Types
      'baterai aa', 'baterai 9v', 'batre aa', 'batre 9v', 'battery aa', 'battery 9v',
      // Actions
      'checkout battery', 'mau checkout', 'gimana checkout', 'cara ambil baterai',
      // Questions
      'ada baterai', 'stok baterai', 'baterai masih ada', 'sisa baterai',
      'baterai habis', 'bisa ambil baterai'
    ],
    instructions: `Butuh baterai buat event? Tinggal checkout aja!

1. Buka menu "Baterai" di sidebar
2. Pilih jenis baterainya:
   • AA (yang kecil, buat mic biasanya)
   • 9V (yang kotak, buat sound system)
3. Isi formnya ya:
   • Nama kamu (biar ada yang tanggung jawab hehe)
   • Jumlah (berapa pcs yang dibutuhin?)
   • Nama Event (buat acara apa nih?)
   • Lokasi (eventnya di mana?)
4. Klik checkout dan selesai! 🔋

Sistem otomatis ngurangin inventory, jadi stok selalu update!

**Jenis baterai tersedia:** AA dan 9V aja ya! ⚡`,
    showLiveData: true // Will show current battery inventory
  },

  update: {
    name: 'Update Data',
    menuId: 'update',
    description: 'Update atau ajukan perubahan data aset',
    roleRequired: ['editor', 'admin'],
    keywords: [
      // Formal
      'update', 'ubah', 'edit', 'ganti', 'perbarui', 'change', 'modify', 'revisi',
      // Casual
      'ubah data', 'edit data', 'ganti data', 'update data', 'mau ubah',
      'mau edit', 'mau ganti', 'mau update', 'perlu ubah', 'butuh ubah',
      // Actions
      'ubah status', 'ganti lokasi', 'update kategori', 'edit info',
      'koreksi data', 'perbaiki data', 'benerin data',
      // Questions
      'gimana ubah', 'gimana edit', 'gimana update', 'cara ubah data',
      'cara edit', 'cara update', 'bisa ubah', 'bisa edit', 'bisa update',
      // Batch
      'batch update', 'update banyak', 'ubah banyak', 'mass update',
      'update sekaligus', 'ubah bareng'
    ],
    instructions: {
      editor: `Mau update data? Sebagai Editor, kamu bisa ajuin request dulu ya!

1. Buka menu "Ajukan Ubah Data" di sidebar
2. Pilih mode yang cocok:
   • **Single Update** - Kalau cuma 1 aset
   • **Batch Update** - Kalau mau ubah banyak sekaligus (lebih efisien!)
3. Masukin ID aset:
   • Bisa ketik manual, atau
   • Langsung scan barcode 📷
4. Isi data yang mau diubah (yang perlu aja)
5. Submit → Request masuk ke admin deh!

📋 Mau tau statusnya? Cek aja di menu "Pengajuan Saya"!

*Note: Request kamu bakal direview admin dulu sebelum di-apply ya. Sabar dikit! 😊*`,
      admin: `Sebagai Admin, kamu bisa langsung update tanpa approval!

1. Buka menu "Perbarui Data" di sidebar
2. Pilih mode sesuai kebutuhan:
   • **Single Update** - Kalau cuma 1 aset
   • **Batch Update** - Kalau mau ubah banyak aset sekaligus
3. Masukin ID aset:
   • Ketik manual, atau
   • Scan barcode langsung 📷
4. Isi data yang mau diubah:
   • Category, Status, Location, dll
   • Yang perlu diubah aja, sisanya bisa dikosongkan
5. Klik Update dan langsung tersimpan! ✅

💡 Pro tips: Pakai Batch Update kalau ada banyak aset yang perlu diubah bareng. Hemat waktu banget!`
    },
    showLiveData: true // Will show pending requests count
  },

  loan: {
    name: 'Pinjam Barang',
    menuId: 'loan',
    description: 'Update status peminjaman/pengembalian barang',
    roleRequired: ['editor', 'admin'],
    keywords: [
      // Formal
      'pinjam', 'loan', 'kembalikan', 'return', 'borrow', 'peminjaman', 'pengembalian',
      // Casual
      'pinjem', 'minjam', 'balikin', 'ambil barang', 'pake barang',
      'mau pinjam', 'mau pinjem', 'butuh pinjam', 'perlu pinjam',
      // Actions
      'pinjam barang', 'kembalikan barang', 'return barang', 'balikin barang',
      'checkout barang', 'checkin barang',
      // Status
      'status pinjam', 'barang dipinjam', 'lagi dipinjam', 'udah dipinjam',
      // Questions
      'gimana pinjam', 'gimana kembalikan', 'cara pinjam', 'cara return',
      'bisa pinjam', 'bisa kembalikan', 'udah balik', 'udah dikembalikan',
      'siapa yang pinjam', 'dipinjam siapa'
    ],
    instructions: {
      editor: `Mau pinjam atau balikin barang? Ini caranya:

**PINJAM BARANG:**
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Pinjam"
3. Scan atau ketik ID barangnya
4. Isi detail peminjam (nama, keperluan, dll)
5. Submit → Nunggu approval admin dulu ya!

**KEMBALIKAN BARANG:**
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Kembali"
3. Scan atau ketik ID barang yang mau dibalikin
4. Submit dan selesai!

Status bakal otomatis ke-update kok! 📦

*Note: Sebagai Editor, request pinjam kamu perlu di-approve admin dulu. Tapi buat kembalikan barang langsung bisa!*`,
      admin: `Pinjam/balikin barang gampang, langsung approved:

**PINJAM BARANG:**
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Pinjam"
3. Scan atau input ID barang
4. Isi detail peminjam lengkap ya
5. Submit → Langsung approved! ✅

**KEMBALIKAN BARANG:**
1. Buka menu "Pinjam Barang"
2. Pilih "Update Status Kembali"
3. Scan atau input ID barang
4. Submit dan kelar!

Sistem otomatis update status-nya, jadi ga perlu manual tracking! 📦`
    }
  },

  myRequests: {
    name: 'Pengajuan Saya',
    menuId: 'myRequests',
    description: 'Lihat status request update yang diajukan',
    roleRequired: ['editor'],
    keywords: [
      // Formal
      'pengajuan saya', 'my request', 'status request', 'request saya', 'ajuan saya',
      // Casual
      'pengajuan gue', 'request gue', 'ajuan gue', 'status ajuan',
      'cek pengajuan', 'liat pengajuan', 'cek request', 'liat request',
      // Questions
      'udah approve', 'udah disetujui', 'udah di-approve', 'sudah approve',
      'request approve', 'pengajuan approve', 'udah masuk', 'udah diproses',
      'ditolak', 'di-reject', 'pending', 'masih pending', 'lagi pending',
      // Status checks
      'gimana status', 'statusnya gimana', 'udah oke', 'udah jalan',
      'mana pengajuan', 'mana request', 'ada berapa', 'berapa pending'
    ],
    instructions: `Mau cek status pengajuan kamu? Gampang!

1. Buka menu "Pengajuan Saya"
2. Lihat semua request yang pernah kamu ajukan
3. Cek statusnya:
   • 🟡 **Pending** - Lagi nunggu review admin nih
   • ✅ **Approved** - Yeay! Udah disetujui & data sudah ter-update
   • ❌ **Rejected** - Ditolak admin (mungkin ada yang salah)

💡 Pro tips: Kalau udah lama pending dan urgent, chat admin aja buat follow up! Kadang mereka lupa cek, normal kok 😅`,
    showLiveData: true // Will show my requests count
  },

  approvals: {
    name: 'Persetujuan Pending',
    menuId: 'approvals',
    description: 'Approve/reject request dari editor',
    roleRequired: ['admin'],
    keywords: [
      // Formal
      'approval', 'approve', 'persetujuan', 'pending', 'request', 'setuju',
      // Casual
      'approve request', 'terima request', 'tolak request', 'reject',
      'pending request', 'ada pending', 'ada request',
      // Actions
      'approve pengajuan', 'terima pengajuan', 'tolak pengajuan',
      'review request', 'cek request', 'liat request',
      // Questions
      'ada berapa pending', 'berapa yang pending', 'ada request baru',
      'siapa yang ngajuin', 'request dari siapa', 'gimana approve',
      'cara approve', 'cara reject', 'bisa approve'
    ],
    instructions: `Sebagai Admin, ini cara kelola approval request:

1. Buka menu "Persetujuan Pending"
2. Lihat semua request dari Editor:
   • Detail lengkap perubahan yang diajukan
   • Siapa yang ngajuin
   • Kapan diajukan
3. Review dengan teliti, terus putuskan:
   • ✅ **Approve** → Data langsung ter-update otomatis
   • ❌ **Reject** → Request ditolak & data ga berubah

📋 Best practices buat Admin:
• Review dengan teliti ya, jangan asal approve
• Pastikan data yang diajukan valid & masuk akal
• Kalau reject, kasih tau alasannya (biar mereka paham)
`,
    showLiveData: true // Will show pending requests count
  },

  scan: {
    name: 'Scan Barcode',
    menuId: null, // Not a menu, it's a feature in other menus
    description: 'Cara menggunakan barcode scanner',
    roleRequired: ['viewer', 'editor', 'admin'],
    keywords: [
      // Formal
      'scan', 'barcode', 'qr', 'kamera', 'camera', 'scanner', 'scanning',
      // Casual
      'scan barcode', 'pake scanner', 'gimana scan', 'cara scan',
      'mau scan', 'butuh scan', 'pakai kamera', 'buka kamera',
      // Issues
      'ga bisa scan', 'scan error', 'kamera ga jalan', 'scanner ga bisa',
      'barcode ga ke-detect', 'ga kebaca', 'error scan',
      // Questions
      'gimana pake scanner', 'cara pakai scanner', 'cara scan barcode',
      'scanner dimana', 'tombol scan', 'ada scanner'
    ],
    instructions: `Scanner barcode ada di hampir semua fitur! Ini cara pakainya:

1. Di fitur apa pun (Cek Data, Update, Export, dll)
2. Cari tombol **"Scan Barcode"** 📷 (biasanya ada icon kamera)
3. Klik → Kamera langsung kebuka
4. Arahkan ke barcode aset dengan stabil
5. Tunggu sebentar → ID otomatis ke-detect! ✨

💡 **Tips biar lancar:**
• Pastikan pencahayaan cukup (jangan terlalu gelap/silau)
• Barcode harus jelas & ga rusak
• Pegang HP stabil, jangan goyang-goyang
• Jarak ideal: sekitar 10-15cm dari barcode
• Kalau ga kebaca, coba geser sedikit

Masih bingung? Cek "Cara Pakai Scanner" di sidebar buat tutorial lebih detail!

**Troubleshooting:**
• Kamera ga mau buka? → Cek permission browser
• Barcode ga ke-detect? → Coba zoom in/out
• Masih error? → Ketik manual ID-nya aja! 😊`
  }
};

// General responses that don't need config
export const GENERAL_RESPONSES = {
  greeting: (userName) => 
    `Halo ${userName}! 😊 Gue AIMing, asisten virtual kamu di Portal AVM.\n\nGue bisa bantu kamu dengan:\n• Cara cek & cari data aset\n• Update atau ubah data\n• Checkout baterai buat event\n• Download data ke CSV\n• Dan masih banyak lagi!\n\nMau tanya apa nih? tanya apa pun!`,
  
  thanks: (userName) => 
    `Sama-sama ${userName}! 😊\n\nSeneng bisa bantu! Kalau ada yang masih bingung atau perlu bantuan lagi, langsung tanya aja ya. Gue di sini kok!\n\nSemangat kelola asetnya`,
  
  help: `Nih beberapa hal yang bisa gue bantu:

🔍 **Cek Data** - Cara search & liat detail aset
✏️ **Update Data** - Cara ubah informasi aset
🔋 **Baterai** - Cara checkout baterai buat event
📥 **Export** - Cara download data ke CSV
📦 **Pinjam Barang** - Cara pinjam/kembalikan barang
📜 **Riwayat** - Cara liat history perubahan
📷 **Scan** - Cara pakai barcode scanner
👤 **Role** - Info hak akses kamu
📊 **Status** - Lihat statistik sistem real-time

Tinggal ketik topik yang mau ditanyain! Atau langsung aja tanya dengan bahasa sehari-hari, gue ngerti kok 😉`,

  roleInfo: {
    viewer: `**Role kamu: Viewer** 👁️

**Yang BISA kamu lakuin:**
✅ Lihat semua data aset
✅ Cek informasi detail aset
✅ Export data ke CSV (download file)
✅ Lihat riwayat perubahan

**Yang TIDAK BISA:**
❌ Update atau ubah data
❌ Checkout baterai
❌ Pinjam barang
❌ Approve request

`,

    editor: `**Role kamu: Editor** ✏️

**Yang BISA kamu lakuin:**
✅ Semua akses Viewer (cek, export, dll)
✅ Ajukan update data (tapi perlu approval admin)
✅ Checkout baterai buat event
✅ Pinjam & kembalikan barang
✅ Lihat status pengajuan kamu

**Yang TIDAK BISA:**
❌ Update data langsung tanpa approval
❌ Approve/reject request orang lain

*Note: Request update kamu bakal direview admin dulu sebelum di-apply. Jadi kalau urgent, follow up ya! 😊*`,

    admin: `**Role kamu: Admin** 👑

**FULL ACCESS!** 🎉
✅ Update data langsung (tanpa approval)
✅ Approve/reject request dari Editor
✅ Semua fitur tersedia lengkap
✅ Kelola seluruh sistem
✅ Kontrol penuh atas data


*Tips: Rajin cek pending approval biar Editor ga nunggu lama!*`
  },

  notFound: `Hmm, gue belum paham maksud kamu nih. 🤔

Coba deh tanya tentang:
• Cara cek atau cari data
• Cara update atau ubah data
• Cara checkout baterai
• Cara export atau download data
• Status sistem atau statistik
• Fitur apa aja yang tersedia
• Cara pakai scanner

Atau kalau bingung, ketik **"help"** aja buat bantuan lengkap!`
};

// Additional contextual responses for natural conversation
export const CONTEXTUAL_RESPONSES = {
  // Status checks
  checkStatus: (userName, pendingCount) => 
    `Halo ${userName}! Gue cek ya...\n\n${pendingCount > 0 ? `Kamu ada **${pendingCount} pengajuan** yang masih pending nih. Mau liat detail-nya?` : `Kayaknya semua pengajuan kamu udah di-approve atau belum ada yang pending. All good! ✅`}`,
  
  // When user seems frustrated
  frustrated: (userName) =>
    `${userName}, sorry ya kalau bikin bingung! 😅\n\nCoba jelasin lagi deh mau ngapain? Gue bantuin step by step.`,
  
  // When asking about capabilities
  capabilities: `Gue bisa bantuin kamu dengan berbagai hal di Portal AVM:

📱 **Fitur Utama:**
• Cek & search data aset (pakai ID atau scan)
• Update data (langsung atau request dulu)
• Download/export data ke CSV
• Checkout baterai AA/9V
• Pinjam & kembalikan barang
• Tracking history perubahan

🔧 **Tools:**
• Barcode scanner (scan langsung dari HP)
• Filter & search advanced
• Batch operations (ubah banyak sekaligus)

Mau tau lebih detail tentang salah satu fitur? Tanya aja!`,

genZ: {
  exact: {
    'anjir': 'anjir',
    'njir': 'njir',
    'bjir': 'bjir',
    'jir': 'jir',

    'ok gas': 'ok gas ok gas',
    'gas': 'gaskeun',
    'yaudah gas': 'nah gitu dong',
    'gass': 'GASS',
    'gasss': 'GASSS 🔥',
    'gaspol': 'GASPOL 🚀',

    'sip': 'y',
    'mantap': 'mantul',
    'keren': 'ok sekarang belikan saya babi rica',
    'cakep': 'valid 🔥',
    'setuju': 'valid',
    'setuju banget': 'valid no debat',

    'santai': 'santuy',
    'serius': 'fr fr',
    'bener': 'real',
    'bener banget': 'real no fake',

    'capek': 'capeeek',
    'lelah': 'mental drop',
    'pusing': 'otw migrain',

    'lucu': 'ngakak',
    'wkwk':'wkwk',
    'ketawa': 'WKWKWK',
    'parah': 'ngaco sih',
    'parah banget': 'kelewatan sih',

    'malas': 'mager',
    'males banget': 'mager akut',

    'oke': 'okey',
    'iya': 'iy',
    'tidak': 'ga dulu',
    'nanti': 'ntar aja',

    'bohong': 'cap',
    'bohong ah': 'cap lu',
    'lebay': 'overproud',

    'gg': 'GG',
    'kalah': 'mental kena',
    'menang': 'auto senyum'
  }
},



  // Encouragement
  encouragement: [
    "Ayo coba! Ga susah kok 😊",
    "Pasti bisa! Ikutin step-nya aja",
    "Gampang kok ini, tenang!",
    "Santai, gue bantuin sampai selesai!"
  ]
};

// HOW TO ADD NEW FEATURES:
// Just add a new object above like this:
/*
  yourNewFeature: {
    name: 'Feature Name',
    menuId: 'menuId', // or null if no menu
    description: 'Short description',
    roleRequired: ['editor', 'admin'], // who can access
    keywords: [
      // Add LOTS of variations here:
      // - Formal terms
      // - Casual/slang
      // - Questions
      // - Actions
      // - Common typos
      'keyword1', 'keyword2', 'variasi kata', 'gimana cara', 'mau tau'
    ],
    instructions: `Step by step guide here in casual Indonesian`, 
    // or object for role-based:
    // instructions: {
    //   editor: "Instructions for editors...",
    //   admin: "Instructions for admins..."
    // },
    showLiveData: true // optional, if needs live data
  }
*/

export default CHATBOT_CONFIG;