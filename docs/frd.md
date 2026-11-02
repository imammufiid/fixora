# Fixora — Functional Requirements Document (FRD)

**Document status:** Draft — Updated  
**Version:** 2.1  
**Related document:** PRD v2.1, mockup interaktif (`mockup/`)

---

## 1. Purpose

Dokumen ini menjelaskan kebutuhan fungsional Fixora, termasuk proses B2C marketplace, pengelolaan worker, operasional admin, serta pengembangan B2B maintenance management.

Prioritas:

- **P0:** Wajib untuk MVP.
- **P1:** Dibutuhkan untuk growth atau B2B pilot.
- **P2:** Pengembangan lanjutan.

---

## 2. User Roles

| Role | Description |
|---|---|
| Customer | Memesan layanan |
| Worker | Menerima dan menyelesaikan pekerjaan |
| Service Partner Admin | Mengelola tim teknisi |
| Platform Admin (Super Admin) | Mengelola keseluruhan platform |
| Operations Admin | Mengelola booking dan operasional |
| Finance Admin | Mengelola pembayaran dan payout |
| Business Admin | Mengelola organization dan lokasi |
| Business Approver | Menyetujui pekerjaan atau biaya |
| Business Viewer | Melihat laporan dan status |

Hak akses harus dikendalikan menggunakan role dan permission.

### Matriks akses Admin Console (MVP, proposed)

| Halaman | Super Admin | Operations Admin | Finance Admin |
|---|:-:|:-:|:-:|
| Dashboard | ✓ | ✓ | ✓ |
| Booking (daftar & detail) | ✓ | ✓ | ✓ (lihat) |
| Komplain | ✓ | ✓ | — |
| Verifikasi Mitra | ✓ | ✓ | — |
| Customer | ✓ | ✓ | ✓ |
| Transaksi & Payout | ✓ | — | ✓ |
| Katalog Layanan | ✓ | ✓ | — |
| Harga Regional | ✓ | ✓ | — |
| Profil & keamanan akun sendiri | ✓ | ✓ | ✓ |

Halaman di luar hak akses tidak tampil di navigasi dan menampilkan pesan "Akses terbatas" jika dibuka langsung. Pembatasan tetap wajib divalidasi di server (NFR-018).

---

## 3. Functional Requirements

### 3.1 Authentication & Account

| ID | Priority | Requirement |
|---|---|---|
| FR-001 | P0 | Sistem menyediakan registrasi dan login customer. |
| FR-002 | P0 | Sistem menyediakan registrasi dan login worker. |
| FR-003 | P0 | Sistem menyediakan logout dan password recovery. |
| FR-004 | P0 | Sistem mengelola profil dan informasi kontak pengguna. |
| FR-005 | P0 | Sistem menyediakan role-based access untuk admin. |
| FR-006 | P1 | Sistem mendukung organization account untuk B2B. |
| FR-007 | P1 | Business Admin dapat mengundang anggota organization. |
| FR-122 | P0 | Customer dan worker mendaftar dan masuk menggunakan nomor HP + OTP (tanpa password). Nomor yang belum terdaftar diarahkan ke registrasi. |
| FR-123 | P0 | Admin masuk menggunakan email kerja + password, diikuti verifikasi kode OTP yang dikirim ke email. SSO Google untuk domain perusahaan dapat digunakan sebagai alternatif. |
| FR-124 | P1 | Admin dapat mengubah password, mengaktifkan verifikasi dua langkah, melihat dan mencabut sesi aktif, serta melihat riwayat aktivitas akunnya. |
| FR-125 | P0 | Customer dapat menyimpan alamat utama yang terisi otomatis saat membuat booking. |

### 3.2 Worker Registration & Verification

| ID | Priority | Requirement |
|---|---|---|
| FR-008 | P0 | Worker dapat mengisi profil dan informasi identitas. |
| FR-009 | P0 | Worker dapat memilih kategori keahlian. |
| FR-010 | P0 | Worker dapat menentukan area layanan. |
| FR-011 | P0 | Worker dapat mengirim dokumen verifikasi. |
| FR-012 | P0 | Admin dapat menerima, menolak, atau meminta revisi verifikasi. |
| FR-013 | P0 | Sistem hanya menawarkan pekerjaan sesuai status verifikasi dan kompetensi worker. |
| FR-014 | P0 | Worker dapat mengatur ketersediaan kerja. |
| FR-015 | P1 | Service Partner Admin dapat mendaftarkan dan mengelola anggota tim. |
| FR-016 | P1 | Sistem mendukung dokumen kompetensi atau sertifikasi khusus. |
| FR-126 | P0 | Worker dapat melihat status pendaftaran (ditinjau, perlu revisi, ditolak, aktif) beserta catatan admin. |
| FR-127 | P0 | Worker yang diminta revisi dapat mengunggah ulang dokumen; pendaftaran kembali ke antrean verifikasi admin. |

Dokumen awal yang diusulkan: KTP (wajib), SKCK (wajib), sertifikat keahlian (opsional, wajib untuk kategori tertentu sesuai FR-022). Target waktu verifikasi: 1–2 hari kerja.

### 3.3 Service Catalog

| ID | Priority | Requirement |
|---|---|---|
| FR-017 | P0 | Admin dapat membuat dan mengelola kategori layanan. |
| FR-018 | P0 | Admin dapat membuat detail layanan dan deskripsi pekerjaan. |
| FR-019 | P0 | Customer dapat melihat layanan yang tersedia berdasarkan area. |
| FR-020 | P0 | Customer dapat mengisi parameter pekerjaan yang diperlukan. |
| FR-021 | P0 | Customer dapat mengunggah foto atau video kondisi pekerjaan. |
| FR-022 | P1 | Admin dapat menentukan persyaratan kompetensi per layanan. |
| FR-128 | P0 | Admin dapat mengaktifkan atau menonaktifkan layanan. Layanan nonaktif tidak tampil sebagai dapat dipesan dan tidak menerima booking baru; booking berjalan tidak terpengaruh. |
| FR-129 | P0 | Admin dapat melihat konfigurasi layanan: model harga, parameter variabel, jumlah aturan harga, jumlah worker terverifikasi, dan checklist pekerjaan. |

### 3.4 Regional Pricing

| ID | Priority | Requirement |
|---|---|---|
| FR-023 | P0 | Admin dapat mengelola wilayah country, province, city/regency, dan service zone. |
| FR-024 | P0 | Admin dapat menetapkan harga layanan berdasarkan wilayah. |
| FR-025 | P0 | Sistem menerapkan prioritas harga zone → city → unavailable. |
| FR-026 | P0 | Sistem mendukung fixed price untuk pekerjaan standar. |
| FR-027 | P0 | Sistem dapat menghitung variable price berdasarkan parameter yang dikonfigurasi. |
| FR-028 | P0 | Sistem menyimpan komponen harga, payout worker, dan komisi platform. |
| FR-029 | P0 | Sistem menyimpan snapshot harga saat booking dikonfirmasi. |
| FR-030 | P0 | Admin dapat mengatur tanggal berlaku dan riwayat versi harga. |
| FR-031 | P0 | Worker dapat mengajukan biaya tambahan disertai alasan dan bukti. |
| FR-032 | P0 | Customer harus menyetujui biaya tambahan sebelum pekerjaan dilanjutkan. |
| FR-033 | P1 | Sistem mendukung inspection fee dan quotation untuk pekerjaan kompleks. |
| FR-130 | P0 | Admin dapat melihat matriks cakupan harga area × layanan beserta level harga yang dipakai (zone, city, atau tidak tersedia). |
| FR-131 | P0 | Sistem menolak aturan harga yang payout worker-nya ≥ harga layanan, atau yang duplikat untuk kombinasi layanan + level + wilayah yang sama. Perubahan harga membuat versi baru; versi lama tetap dapat dilihat. |

### 3.5 Booking & Scheduling

| ID | Priority | Requirement |
|---|---|---|
| FR-034 | P0 | Customer dapat membuat booking dari layanan yang tersedia. |
| FR-035 | P0 | Customer dapat menentukan alamat dan jadwal pekerjaan. |
| FR-036 | P0 | Sistem menampilkan estimasi biaya sebelum konfirmasi. |
| FR-037 | P0 | Sistem memvalidasi ketersediaan layanan dan area. |
| FR-038 | P0 | Customer dapat melihat status booking. |
| FR-039 | P0 | Customer dapat membatalkan booking sesuai cancellation policy. |
| FR-040 | P1 | Customer dapat melakukan repeat booking. |
| FR-041 | P1 | Customer dapat membuat booking berulang. |
| FR-132 | P0 | Customer memilih tanggal kunjungan (hari ini hingga H+4) dan slot kedatangan dengan rentang 2 jam. Slot yang penuh atau terlalu dekat dengan waktu sekarang tidak dapat dipilih. |
| FR-133 | P0 | Ringkasan sebelum pembayaran menampilkan harga layanan (termasuk parameter), biaya layanan, total, wilayah harga yang dipakai, dan ketentuan pembatalan. |
| FR-134 | P0 | Customer dapat melihat timeline perubahan status booking. |
| FR-135 | P1 | Customer dapat melihat perkiraan waktu tiba dan posisi worker saat status On The Way. |
| FR-136 | P1 | Customer dan worker dapat saling menghubungi (chat/telepon) melalui aplikasi tanpa membuka nomor pribadi. |

Catatan FR-040: repeat booking menyalin layanan, area, alamat, detail, dan jumlah unit dari booking sebelumnya, tetapi harga dihitung ulang dari aturan harga yang berlaku saat ini.

### 3.6 Worker Matching

| ID | Priority | Requirement |
|---|---|---|
| FR-042 | P0 | Sistem mencari worker berdasarkan skill, area, dan availability. |
| FR-043 | P0 | Sistem menghitung ranking worker berdasarkan konfigurasi matching. |
| FR-044 | P0 | Sistem mengirimkan job offer kepada worker yang memenuhi syarat. |
| FR-045 | P0 | Worker dapat menerima atau menolak job offer. |
| FR-046 | P0 | Sistem menerapkan timeout untuk job offer. |
| FR-047 | P0 | Sistem dapat memperluas radius pencarian jika tidak ada worker yang menerima. |
| FR-048 | P0 | Admin dapat melakukan intervensi jika matching gagal. |
| FR-049 | P1 | Sistem menyimpan histori matching dan alasan pemilihan worker. |
| FR-137 | P0 | Job offer dikirim ke satu worker dalam satu waktu (urut skor tertinggi) dengan timeout 30 detik. Worker yang menolak atau timeout tidak ditawari ulang untuk booking yang sama. |
| FR-138 | P0 | Admin dapat melihat kandidat matching beserta skor, jarak, dan status (eligible, offline, di luar radius, menolak/timeout) serta menugaskan worker secara manual. |

Radius pencarian awal yang diusulkan: 5 km, diperluas ke 10 km sebelum eskalasi ke admin.

Worker baru tanpa rating diberi nilai rating netral (usulan: 4,5 dari 5) dalam perhitungan skor agar tetap mendapat kesempatan.

Matching score awal:

- Skill fit: 35%.
- Distance: 25%.
- Rating: 20%.
- Availability: 10%.
- Completion history: 10%.

Bobot dapat dikonfigurasi setelah evaluasi pilot. Worker baru harus tetap memperoleh kesempatan yang wajar meskipun belum memiliki rating atau histori.

### 3.7 Job Lifecycle

| ID | Priority | Requirement |
|---|---|---|
| FR-050 | P0 | Sistem mengelola status booking dan pekerjaan. |
| FR-051 | P0 | Worker dapat memperbarui status pekerjaan. |
| FR-052 | P0 | Worker dapat mengunggah bukti sebelum dan sesudah pekerjaan. |
| FR-053 | P0 | Sistem menyimpan waktu perubahan status. |
| FR-054 | P0 | Worker dapat mengajukan biaya tambahan. |
| FR-055 | P0 | Customer dapat mengonfirmasi penyelesaian pekerjaan. |
| FR-056 | P0 | Admin dapat memantau pekerjaan aktif dan bermasalah. |
| FR-057 | P1 | Sistem menyediakan checklist pekerjaan berdasarkan kategori layanan. |
| FR-139 | P0 | Worker tidak dapat memulai pekerjaan sebelum mengunggah foto kondisi sebelum. Worker tidak dapat menandai pekerjaan selesai sebelum foto hasil diunggah, checklist kategori lengkap (jika tersedia), dan tidak ada biaya tambahan yang menunggu persetujuan. |
| FR-140 | P0 | Worker dapat mengubah status online/offline. Hanya worker online yang menerima job offer. |

Usulan status (diselaraskan dengan mockup):

`Pending Payment → Searching Worker → Worker Assigned → On The Way → Arrived → In Progress → Waiting Confirmation → Completed`

Status alternatif:

`Cancelled`, `Disputed`, `Expired`, `Failed`.

Catatan:

- `Worker Assigned` sudah berarti worker menerima (atau ditugaskan admin); tidak ada status `Accepted` terpisah.
- `Rejected` adalah status job offer, bukan status booking.
- Persetujuan biaya tambahan adalah sub-status pada item biaya tambahan (menunggu, disetujui, ditolak), bukan status booking. Selama ada item yang menunggu, pekerjaan tidak dapat diselesaikan (FR-139).
- `Waiting Confirmation`: worker sudah menyelesaikan pekerjaan dan menunggu konfirmasi customer. Perlu ditentukan batas waktu konfirmasi otomatis (lihat bagian 8).
- `Disputed`: customer mengajukan komplain setelah pekerjaan selesai, sampai admin menyelesaikannya.

Transisi status harus divalidasi berdasarkan role dan kondisi pekerjaan.

### 3.8 Payment & Payout

| ID | Priority | Requirement |
|---|---|---|
| FR-058 | P0 | Sistem menghitung total tagihan customer. |
| FR-059 | P0 | Sistem mengintegrasikan payment provider yang dipilih. |
| FR-060 | P0 | Sistem menerima dan memproses payment notification secara idempotent. |
| FR-061 | P0 | Sistem mencatat transaksi dan status pembayaran. |
| FR-062 | P0 | Sistem menghitung komisi platform dan payout worker. |
| FR-063 | P0 | Sistem menyediakan histori transaksi. |
| FR-064 | P0 | Finance Admin dapat memantau transaksi dan payout. |
| FR-065 | P1 | Sistem mendukung refund sesuai kebijakan. |
| FR-066 | P1 | Sistem mendukung rekonsiliasi pembayaran dan payout. |
| FR-141 | P0 | Worker dapat melihat saldo menunggu payout, pendapatan yang ditahan karena komplain, riwayat pekerjaan, dan riwayat payout. |
| FR-142 | P0 | Finance Admin dapat memproses payout batch berkala untuk booking yang sudah selesai dan belum dibayar. Booking dengan status `Disputed` ditahan. |
| FR-143 | P0 | Sebelum customer mengonfirmasi pembatalan, sistem menampilkan biaya pembatalan dan nominal refund. |

Payment settlement dan payout harus menggunakan skema yang sesuai dengan ketentuan provider dan regulasi. Jangan mengasumsikan platform boleh menahan dana customer sendiri tanpa peninjauan legal dan payment compliance.

### 3.9 Rating & Review

| ID | Priority | Requirement |
|---|---|---|
| FR-067 | P0 | Customer dapat memberi rating setelah pekerjaan selesai. |
| FR-068 | P0 | Customer dapat menulis review. |
| FR-069 | P0 | Sistem menghitung dan menampilkan rating worker. |
| FR-070 | P1 | Admin dapat memoderasi review yang melanggar kebijakan. |
| FR-144 | P1 | Customer dapat memilih tag ulasan cepat (mis. tepat waktu, rapi, ramah). |

### 3.10 Complaint & Warranty

| ID | Priority | Requirement |
|---|---|---|
| FR-071 | P0 | Customer dapat membuat komplain terhadap pekerjaan. |
| FR-072 | P0 | Customer dapat melampirkan bukti komplain. |
| FR-073 | P0 | Admin dapat mengelola status dan penyelesaian komplain. |
| FR-074 | P1 | Sistem mendukung kebijakan warranty berdasarkan kategori layanan. |
| FR-075 | P1 | Sistem dapat membuat rework order jika komplain disetujui. |
| FR-145 | P0 | Admin menyelesaikan komplain dengan salah satu hasil: rework gratis, refund, atau tolak. Hasil dan alasannya terlihat oleh customer. |

Durasi warranty belum ditentukan. Kebijakan harus divalidasi per jenis layanan dan tidak boleh diasumsikan sama untuk seluruh pekerjaan.

### 3.11 Notification

| ID | Priority | Requirement |
|---|---|---|
| FR-076 | P0 | Sistem mengirim notifikasi booking dan perubahan status. |
| FR-077 | P0 | Worker menerima notifikasi job offer. |
| FR-078 | P0 | Customer menerima notifikasi penugasan worker. |
| FR-079 | P0 | Sistem mengirim reminder jadwal pekerjaan. |
| FR-080 | P1 | Sistem mendukung konfigurasi channel notifikasi. |
| FR-146 | P0 | Setiap role memiliki inbox notifikasi di aplikasi dengan penanda belum dibaca. |
| FR-147 | P1 | Customer dapat mengatur preferensi notifikasi (status pesanan, promo). |

### 3.12 Admin & Operations

| ID | Priority | Requirement |
|---|---|---|
| FR-081 | P0 | Admin dapat mengelola customer dan worker. |
| FR-082 | P0 | Admin dapat mengelola service catalog dan regional pricing. |
| FR-083 | P0 | Admin dapat melihat daftar dan detail booking. |
| FR-084 | P0 | Admin dapat melakukan intervensi matching. |
| FR-085 | P0 | Admin dapat menangani cancellation dan complaint. |
| FR-086 | P0 | Admin dapat melihat ringkasan transaksi. |
| FR-087 | P0 | Sistem mencatat aktivitas penting admin. |
| FR-088 | P1 | Admin dapat melihat metrik operasional dan revenue. |
| FR-148 | P0 | Dashboard admin menampilkan antrean "perlu tindakan": booking yang gagal matching, komplain terbuka, dan worker menunggu verifikasi. |
| FR-149 | P0 | Admin dapat mencari, memfilter (status, layanan), dan memuat daftar booking secara bertahap (pagination). |
| FR-150 | P1 | Admin dapat mengekspor daftar booking hasil filter ke CSV. |
| FR-151 | P0 | Admin dapat melihat daftar customer beserta jumlah pesanan, total belanja, dan komplain terbuka. |
| FR-152 | P0 | Admin dapat melihat daftar transaksi customer (pembayaran, biaya tambahan, refund) dengan referensi yang dapat ditelusuri ke booking. |

---

## 4. B2B Functional Requirements

Fitur berikut bukan bagian dari MVP B2C. Fitur menjadi prioritas saat memasuki B2B pilot.

### 4.1 Organization & Multi-property

| ID | Priority | Requirement |
|---|---|---|
| FR-089 | P1 | Business Admin dapat membuat organization. |
| FR-090 | P1 | Business Admin dapat menambahkan beberapa property atau branch. |
| FR-091 | P1 | Business Admin dapat mengatur anggota dan role per organization. |
| FR-092 | P1 | Data organization harus terisolasi dari organization lain. |
| FR-093 | P1 | Business Admin dapat mengelola informasi lokasi dan kontak operasional. |

### 4.2 Asset Management

| ID | Priority | Requirement |
|---|---|---|
| FR-094 | P1 | Business Admin dapat mencatat aset per property. |
| FR-095 | P1 | Sistem menyimpan kategori, identitas, lokasi, dan informasi aset. |
| FR-096 | P1 | Sistem menyimpan tanggal pemasangan dan informasi warranty jika tersedia. |
| FR-097 | P1 | Sistem menyimpan histori maintenance per aset. |
| FR-098 | P1 | Business Admin dapat mengubah status aset. |

Contoh aset: AC, pompa air, panel listrik, plumbing equipment, dan peralatan gedung.

### 4.3 Preventive Maintenance

| ID | Priority | Requirement |
|---|---|---|
| FR-099 | P1 | Business Admin dapat membuat maintenance schedule. |
| FR-100 | P1 | Sistem mendukung jadwal berkala. |
| FR-101 | P1 | Sistem dapat menghasilkan work order dari jadwal. |
| FR-102 | P1 | Sistem mengirim reminder sebelum jadwal. |
| FR-103 | P1 | Admin dapat mengubah atau menunda jadwal dengan alasan. |

### 4.4 Work Order Management

| ID | Priority | Requirement |
|---|---|---|
| FR-104 | P1 | Business User dapat membuat work order. |
| FR-105 | P1 | Work order dapat dikaitkan dengan property dan asset. |
| FR-106 | P1 | Business Admin dapat menentukan prioritas pekerjaan. |
| FR-107 | P1 | Work order dapat ditugaskan ke worker atau service partner. |
| FR-108 | P1 | Sistem menyimpan histori dan bukti pekerjaan. |
| FR-109 | P1 | Business User dapat memantau status work order. |

### 4.5 Approval & SLA

| ID | Priority | Requirement |
|---|---|---|
| FR-110 | P1 | Organization dapat mengatur approval workflow. |
| FR-111 | P1 | Sistem dapat meminta persetujuan untuk pekerjaan atau biaya tertentu. |
| FR-112 | P1 | Sistem mencatat approver, waktu, dan hasil persetujuan. |
| FR-113 | P1 | Sistem dapat mengukur response time dan resolution time. |
| FR-114 | P1 | Sistem dapat menampilkan pencapaian SLA. |

### 4.6 Vendor & Reporting

| ID | Priority | Requirement |
|---|---|---|
| FR-115 | P1 | Business Admin dapat melihat vendor dan worker yang ditugaskan. |
| FR-116 | P1 | Sistem menyimpan histori performa vendor. |
| FR-117 | P1 | Sistem menyediakan laporan pekerjaan per property. |
| FR-118 | P1 | Sistem menyediakan laporan biaya maintenance. |
| FR-119 | P1 | Sistem menyediakan ringkasan pekerjaan preventive dan corrective. |
| FR-120 | P2 | Sistem menyediakan export laporan. |
| FR-121 | P2 | Sistem menyediakan API integration untuk enterprise. |

---

## 5. Business Rules

### Pricing

1. Harga berasal dari konfigurasi platform.
2. Harga dapat berbeda per wilayah.
3. Harga zone memiliki prioritas di atas harga city.
4. Jika harga tidak tersedia, customer tidak dapat membuat booking untuk layanan tersebut.
5. Booking yang telah dikonfirmasi menyimpan snapshot harga.
6. Biaya tambahan tidak boleh diterapkan tanpa persetujuan customer.
7. Inspection dan quotation digunakan untuk pekerjaan yang tidak dapat dihitung secara fixed atau variable dengan akurat.

### Matching

1. Worker harus terverifikasi dan memiliki skill yang sesuai.
2. Worker harus berada dalam area layanan atau radius yang diizinkan.
3. Worker harus tersedia pada waktu pekerjaan.
4. Matching mempertimbangkan rating dan histori, tetapi tidak boleh menghilangkan kesempatan worker baru secara tidak adil.
5. Jika tidak ada worker yang menerima, sistem menjalankan fallback dan menyediakan intervensi admin.

### Job Completion

1. Worker wajib memperbarui status pekerjaan.
2. Bukti pekerjaan disimpan sesuai kategori layanan.
3. Customer dapat mengonfirmasi hasil pekerjaan.
4. Komplain mengikuti complaint policy.
5. Payout mengikuti status settlement dan aturan provider.

### Scheduling (proposed — DEC-039)

1. Booking dapat dijadwalkan dari hari ini hingga H+4.
2. Slot kedatangan: 08.00, 10.00, 13.00, 15.00, 17.00, masing-masing dengan rentang 2 jam.
3. Slot hari ini yang kurang dari 1 jam dari waktu sekarang tidak dapat dipilih.
4. Kapasitas slot ditentukan dari ketersediaan worker di area (mekanisme perhitungan: DEC-063).

### Cancellation (proposed — DEC-024)

1. Customer dapat membatalkan saat status `Searching Worker` atau `Worker Assigned`.
2. Pembatalan sebelum worker ditugaskan: gratis, refund penuh.
3. Pembatalan setelah worker ditugaskan: biaya pembatalan Rp25.000 sebagai kompensasi worker; sisanya direfund.
4. Setelah worker dalam perjalanan, pembatalan hanya melalui admin.
5. Pembatalan oleh admin: refund penuh.
6. Estimasi waktu refund ditampilkan ke customer (usulan: 1–3 hari kerja, tergantung payment provider).

### Warranty & Complaint (proposed — DEC-026)

1. Komplain dapat diajukan dalam masa garansi 7 hari setelah pekerjaan selesai.
2. Target respons admin: maksimal 2×24 jam.
3. Hasil penyelesaian: rework gratis (booking baru terhubung ke booking asal), refund, atau tolak.
4. Payout worker untuk booking dalam komplain ditahan sampai komplain diselesaikan.

### Payout (proposed — DEC-037)

1. Payout worker = payout snapshot + biaya tambahan yang disetujui.
2. Payout diproses mingguan (usulan: setiap Senin) ke rekening terverifikasi.
3. Setiap payout memiliki ID batch dan referensi transfer.

### B2B

1. Setiap data bisnis terikat pada organization.
2. User hanya dapat mengakses property sesuai permission.
3. Work order dapat dikaitkan dengan asset.
4. Preventive schedule dapat menghasilkan work order.
5. Pekerjaan yang membutuhkan approval tidak dapat dilanjutkan sebelum disetujui.
6. Perhitungan SLA harus memiliki definisi start, pause, dan end yang jelas.

---

## 6. Key Process Flows

### B2C Booking

`Select Service → Input Location & Details → Calculate Price → Select Schedule → Confirm Booking → Payment → Matching → Worker Assigned`

### Worker Job

`Receive Offer → Accept → Travel → Arrive → Start Job → Submit Evidence → Customer Confirmation → Completion → Payout`

### Matching Fallback

`Rank Candidates (radius 5 km) → Offer to Top Worker (30s) → Decline/Timeout → Next Worker → No Eligible Worker → Expand Radius (10 km) → Repeat → Escalate to Admin → Manual Assignment`

### Complaint

`Customer Submits Complaint + Evidence → Booking Disputed → Payout Held → Admin Reviews → Rework / Refund / Reject → Customer Notified → Payout Released or Adjusted`

### Additional Cost

`Worker Request → Provide Reason & Evidence → Customer Review → Approve / Reject → Update Job Cost`

### B2B Preventive Maintenance

`Register Asset → Create Maintenance Plan → Generate Schedule → Create Work Order → Approval (if required) → Assign Worker → Execute → Verify → Close Work Order → Update Asset History`

---

## 7. Acceptance Criteria Examples

### AC-01 — Regional Pricing

Given customer memilih layanan di suatu area, when sistem menghitung harga, then sistem menggunakan harga service zone jika tersedia, jika tidak menggunakan harga city, dan jika keduanya tidak tersedia maka booking tidak dapat dilanjutkan.

### AC-02 — Price Snapshot

Given booking telah dikonfirmasi, when admin mengubah harga layanan, then nilai booking lama tidak berubah.

### AC-03 — Additional Cost

Given worker mengajukan biaya tambahan, when customer belum menyetujui, then worker tidak dapat menandai biaya tersebut sebagai biaya final yang disetujui.

### AC-04 — Matching Eligibility

Given worker belum terverifikasi atau tidak memiliki kompetensi yang dibutuhkan, when sistem melakukan matching, then worker tidak menerima job offer untuk pekerjaan tersebut.

### AC-05 — Payment Notification

Given payment provider mengirim callback yang sama lebih dari satu kali, when sistem memproses callback, then transaksi tidak boleh tercatat ganda.

### AC-06 — Organization Isolation

Given user dari Organization A, when user mencoba mengakses data Organization B, then sistem menolak akses.

### AC-07 — Preventive Work Order

Given aset memiliki jadwal maintenance aktif, when jadwal mencapai tanggal eksekusi, then sistem membuat work order sesuai konfigurasi dan tidak membuat duplikasi untuk jadwal yang sama.

### AC-08 — Approval

Given work order membutuhkan approval, when belum ada persetujuan, then status pekerjaan tetap menunggu approval dan tidak dapat dieksekusi.

### AC-09 — Job Completion Gate

Given worker sedang mengerjakan pekerjaan, when foto hasil belum diunggah, checklist belum lengkap, atau ada biaya tambahan yang menunggu persetujuan, then tombol penyelesaian tidak aktif dan sistem menampilkan alasannya.

### AC-10 — Cancellation Fee

Given worker sudah ditugaskan, when customer membatalkan booking, then sistem menampilkan biaya pembatalan dan nominal refund sebelum konfirmasi, dan mencatat keduanya pada booking.

### AC-11 — Job Offer Timeout

Given job offer dikirim ke worker, when worker tidak merespons dalam 30 detik, then offer kedaluwarsa, worker dicatat sebagai timeout, dan offer dikirim ke kandidat berikutnya.

### AC-12 — Payout Hold

Given booking berstatus Disputed, when Finance Admin memproses payout, then booking tersebut tidak termasuk dalam batch payout.

### AC-13 — Role Access

Given admin dengan role Finance Admin, when membuka halaman Harga Regional, then sistem menolak akses dan halaman tidak tampil di navigasi.

---

## 8. Dependencies & Open Decisions

Semua keputusan yang masih terbuka dicatat di [decisions.md](decisions.md). Tabel ini hanya memetakan topik FRD ke ID keputusannya.

| Topic | Keputusan terkait |
|---|---|
| Payment | DEC-023, DEC-061 |
| Pricing | DEC-009, DEC-055 |
| Inspection | DEC-025 |
| Worker | DEC-059 |
| Cancellation | DEC-024 |
| Warranty | DEC-026 |
| Additional cost | DEC-040, DEC-041 |
| Rework | DEC-042 |
| Confirmation | DEC-043 |
| Scheduling | DEC-039, DEC-063 |
| Contact masking | DEC-062 |
| Platform | DEC-031 |
| B2B pricing | DEC-029 |
| B2B approval | DEC-028 |
| SLA | DEC-030, DEC-060 |

Dokumen ini menjadi dasar functional design, backlog, dan acceptance testing. Semua requirement P0 harus memiliki acceptance criteria sebelum dinyatakan ready for development.
---

## 9. Mockup Coverage

Pemetaan layar mockup interaktif (`mockup/`) ke requirement. Perbarui tabel ini setiap kali layar atau FR berubah. Pekerjaan mockup yang belum selesai dicatat di `mockup/TODO.md`.

| Layar | FR terkait |
|---|---|
| Customer — Welcome / OTP / Registrasi | FR-001, FR-122, FR-125 |
| Customer — Beranda | FR-019, FR-025, FR-128 |
| Customer — Booking (3 langkah) | FR-020, FR-021, FR-034 – FR-037, FR-132, FR-133 |
| Customer — Detail pesanan | FR-032, FR-038, FR-039, FR-055, FR-067, FR-071, FR-134, FR-135, FR-143, FR-040 |
| Mitra — Registrasi / Status pendaftaran | FR-002, FR-008 – FR-011, FR-126, FR-127 |
| Mitra — Pekerjaan & Job offer | FR-044 – FR-046, FR-137, FR-140 |
| Mitra — Detail pekerjaan | FR-051 – FR-054, FR-057, FR-139 |
| Mitra — Pendapatan | FR-063, FR-141 |
| Admin — Login / Verifikasi email / Profil | FR-005, FR-123, FR-124 |
| Admin — Dashboard | FR-056, FR-086, FR-148 |
| Admin — Booking & detail | FR-048, FR-083, FR-084, FR-087, FR-138, FR-149, FR-150 |
| Admin — Komplain | FR-073, FR-075, FR-085, FR-145 |
| Admin — Verifikasi Mitra | FR-012 |
| Admin — Customer | FR-081, FR-151 |
| Admin — Transaksi & Payout | FR-064, FR-086, FR-142, FR-152 |
| Admin — Katalog Layanan | FR-017, FR-018, FR-128, FR-129 |
| Admin — Harga Regional | FR-024, FR-028 – FR-030, FR-130, FR-131 |
