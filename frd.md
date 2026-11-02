# Fixora — Functional Requirements Document (FRD)

**Document status:** Draft — Updated  
**Version:** 2.0  
**Related document:** PRD v2.0

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
| Platform Admin | Mengelola keseluruhan platform |
| Operations Admin | Mengelola booking dan operasional |
| Finance Admin | Mengelola pembayaran dan payout |
| Business Admin | Mengelola organization dan lokasi |
| Business Approver | Menyetujui pekerjaan atau biaya |
| Business Viewer | Melihat laporan dan status |

Hak akses harus dikendalikan menggunakan role dan permission.

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

### 3.3 Service Catalog

| ID | Priority | Requirement |
|---|---|---|
| FR-017 | P0 | Admin dapat membuat dan mengelola kategori layanan. |
| FR-018 | P0 | Admin dapat membuat detail layanan dan deskripsi pekerjaan. |
| FR-019 | P0 | Customer dapat melihat layanan yang tersedia berdasarkan area. |
| FR-020 | P0 | Customer dapat mengisi parameter pekerjaan yang diperlukan. |
| FR-021 | P0 | Customer dapat mengunggah foto atau video kondisi pekerjaan. |
| FR-022 | P1 | Admin dapat menentukan persyaratan kompetensi per layanan. |

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

Usulan status:

`Pending Payment → Searching Worker → Worker Assigned → Accepted → On The Way → Arrived → In Progress → Waiting Approval (if applicable) → Completed`

Status alternatif:

`Cancelled`, `Rejected`, `Expired`, `Disputed`, `Failed`.

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

Payment settlement dan payout harus menggunakan skema yang sesuai dengan ketentuan provider dan regulasi. Jangan mengasumsikan platform boleh menahan dana customer sendiri tanpa peninjauan legal dan payment compliance.

### 3.9 Rating & Review

| ID | Priority | Requirement |
|---|---|---|
| FR-067 | P0 | Customer dapat memberi rating setelah pekerjaan selesai. |
| FR-068 | P0 | Customer dapat menulis review. |
| FR-069 | P0 | Sistem menghitung dan menampilkan rating worker. |
| FR-070 | P1 | Admin dapat memoderasi review yang melanggar kebijakan. |

### 3.10 Complaint & Warranty

| ID | Priority | Requirement |
|---|---|---|
| FR-071 | P0 | Customer dapat membuat komplain terhadap pekerjaan. |
| FR-072 | P0 | Customer dapat melampirkan bukti komplain. |
| FR-073 | P0 | Admin dapat mengelola status dan penyelesaian komplain. |
| FR-074 | P1 | Sistem mendukung kebijakan warranty berdasarkan kategori layanan. |
| FR-075 | P1 | Sistem dapat membuat rework order jika komplain disetujui. |

Durasi warranty belum ditentukan. Kebijakan harus divalidasi per jenis layanan dan tidak boleh diasumsikan sama untuk seluruh pekerjaan.

### 3.11 Notification

| ID | Priority | Requirement |
|---|---|---|
| FR-076 | P0 | Sistem mengirim notifikasi booking dan perubahan status. |
| FR-077 | P0 | Worker menerima notifikasi job offer. |
| FR-078 | P0 | Customer menerima notifikasi penugasan worker. |
| FR-079 | P0 | Sistem mengirim reminder jadwal pekerjaan. |
| FR-080 | P1 | Sistem mendukung konfigurasi channel notifikasi. |

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

---

## 8. Dependencies & Open Decisions

| Topic | Dependency / Decision |
|---|---|
| Payment | Payment gateway, settlement, payout, refund |
| Pricing | Regional price granularity dan price validation |
| Inspection | Fee, quotation, dan approval flow |
| Worker | Verification, skill taxonomy, safety requirements |
| Cancellation | Cancellation window, refund, worker compensation |
| Warranty | Per-category policy dan rework flow |
| B2B pricing | Subscription metric dan contract pricing |
| SLA | Business hours, pause conditions, resolution definition |
| B2B approval | Threshold dan role hierarchy |
| Platform | Web/mobile scope dan release strategy |

Dokumen ini menjadi dasar functional design, backlog, dan acceptance testing. Semua requirement P0 harus memiliki acceptance criteria sebelum dinyatakan ready for development.