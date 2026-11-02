# Fixora — Product Requirements Document (PRD)

**Document status:** Draft — Updated  
**Product:** Fixora  
**Product direction:** On-demand Property Maintenance Marketplace → Property Maintenance Management Platform  
**Version:** 2.1

---

## 1. Product Overview

Fixora adalah platform digital yang menghubungkan pemilik properti atau customer dengan tenaga profesional untuk kebutuhan perawatan dan perbaikan properti.

Fixora dimulai sebagai marketplace on-demand untuk layanan seperti AC service, plumbing, electrical, dan general handyman. Dalam pengembangan berikutnya, Fixora akan berevolusi menjadi platform pengelolaan maintenance bagi perusahaan, property manager, dan pemilik banyak properti.

Visi produk:

> Make property maintenance easier, more reliable, and manageable for everyone.

### Product positioning

Fixora bukan hanya platform untuk mencari teknisi. Fixora bertujuan membantu customer mendapatkan layanan maintenance yang terpercaya dan membantu perusahaan memastikan aset serta properti mereka tetap terawat.

Dua segmen utama:

- **B2C:** Individual customer yang membutuhkan jasa maintenance untuk rumah atau properti pribadi.
- **B2B:** Perusahaan dan property manager yang membutuhkan pengelolaan maintenance untuk satu atau banyak lokasi.

---

## 2. Problem Statement

### Customer / B2C

- Kesulitan menemukan teknisi yang terpercaya.
- Tidak mengetahui estimasi harga sebelum pekerjaan dilakukan.
- Sulit memastikan teknisi datang sesuai jadwal.
- Tidak memiliki dokumentasi riwayat pekerjaan.
- Sulit menyelesaikan komplain ketika hasil pekerjaan tidak sesuai.

### Worker / Service Provider

- Kesulitan mendapatkan customer secara konsisten.
- Tidak memiliki sistem untuk mengelola order dan jadwal.
- Sulit membangun reputasi profesional.
- Pengelolaan pembayaran dan riwayat pekerjaan belum terpusat.

### Business / B2B

- Maintenance banyak dilakukan secara manual melalui chat, telepon, atau spreadsheet.
- Tidak memiliki inventaris aset dan riwayat perawatan yang terpusat.
- Sulit memonitor pekerjaan lintas gedung atau cabang.
- Sulit mengukur biaya maintenance dan performa vendor.
- Preventive maintenance sering terlewat karena tidak ada sistem pengingat dan penjadwalan.

---

## 3. Product Objectives

1. Mempermudah customer menemukan dan memesan layanan maintenance.
2. Membangun jaringan worker yang terverifikasi dan dapat diandalkan.
3. Menyediakan transparansi harga, status pekerjaan, dan pembayaran.
4. Meningkatkan repeat order dan recurring revenue.
5. Mengembangkan layanan pengelolaan maintenance untuk customer B2B.
6. Membangun pendapatan yang tidak hanya bergantung pada komisi transaksi.

### Non-goals MVP

- Menjadi marketplace material atau spare part berskala besar.
- Menyediakan CMMS enterprise lengkap.
- Mengelola seluruh jenis pekerjaan konstruksi dan renovasi.
- Menjamin semua jenis pekerjaan memiliki harga fixed.
- Menyediakan sistem procurement dan accounting enterprise.
- Mengembangkan integrasi ERP khusus sebelum kebutuhan pelanggan tervalidasi.

---

## 4. Target Users

| User | Kebutuhan utama |
|---|---|
| Individual Customer | Memesan layanan maintenance dengan mudah |
| Worker | Mendapatkan dan mengelola pekerjaan |
| Service Partner | Mengelola tim teknisi dan pekerjaan |
| Admin / Operator | Mengelola layanan, harga, booking, dan komplain. Terdiri dari Super Admin, Operations Admin, dan Finance Admin (lihat matriks akses di FRD §2) |
| Business Customer | Mengelola maintenance perusahaan |
| Property Manager | Mengelola aset dan pekerjaan lintas lokasi |
| Business Approver | Menyetujui pekerjaan dan anggaran |

### Worker model

1. **Independent Worker:** Teknisi individu yang menerima pekerjaan.
2. **Service Partner:** Perusahaan atau tim penyedia layanan.
3. **Specialist Worker:** Tenaga spesialis dengan kompetensi atau sertifikasi tertentu.

Verifikasi kompetensi dan persyaratan keselamatan harus disesuaikan dengan kategori layanan.

---

## 5. Product Scope

### Phase 1 — B2C On-demand Marketplace (MVP)

Fitur utama:

- Customer registration dan login.
- Worker registration dan verification.
- Service catalog.
- Regional pricing.
- Booking dan scheduling.
- Worker matching.
- Job status tracking.
- Payment dan payout workflow.
- Rating dan review.
- Complaint handling.
- Admin dashboard.
- Notification.

Kategori layanan awal yang diusulkan:

- AC service.
- Plumbing.
- Electrical.
- General handyman.

Kategori yang membutuhkan sertifikasi atau kompetensi keselamatan khusus hanya dapat dibuka setelah mekanisme verifikasi tersedia.

### Phase 2 — Recurring Maintenance

- Maintenance reminder.
- Repeat booking.
- Recurring service package.
- Asset record sederhana.
- Riwayat perawatan.
- Customer subscription.
- Maintenance plan.

### Phase 3 — B2B Maintenance Management

- Business account.
- Organization dan branch management.
- Multi-property management.
- Asset registry.
- Preventive maintenance scheduling.
- Work order management.
- Approval workflow.
- Vendor management.
- SLA monitoring.
- Expense tracking.
- Business reporting.

### Phase 4 — Enterprise Platform

- Multi-level approval.
- Budget control.
- Custom SLA.
- API integration.
- Advanced reporting.
- Enterprise access control.
- Integrasi sistem bisnis sesuai kebutuhan pelanggan.

---

## 6. Business Model & Revenue Streams

Fixora menggunakan model pendapatan bertahap.

### 6.1 Transaction Commission

Fixora mengambil komisi dari setiap pekerjaan yang berhasil diselesaikan melalui platform.

Formula:

`Commission Revenue = Completed Order Value × Commission Rate`

Contoh simulasi:

- Average order value: Rp500.000.
- Commission rate: 15%.
- Completed orders: 300 per bulan.
- Gross commission revenue: Rp22.500.000 per bulan.

Angka tersebut adalah simulasi, bukan proyeksi final dan bukan laba bersih.

### 6.2 Customer Service Fee

Biaya layanan yang dikenakan kepada customer untuk penggunaan platform. Biaya harus ditampilkan sebelum customer melakukan konfirmasi pembayaran.

### 6.3 Emergency / Express Surcharge

Biaya tambahan untuk pekerjaan yang membutuhkan penanganan cepat, di luar jam normal, atau memiliki kebutuhan khusus.

Besaran surcharge harus transparan dan memperhitungkan kompensasi worker.

### 6.4 Customer Subscription

Paket berlangganan untuk customer yang sering menggunakan layanan Fixora.

Contoh konsep:

- Free: Booking dan pembayaran per pekerjaan.
- Plus: Prioritas booking, reminder, dan riwayat maintenance.
- Business: Multi-property dan laporan maintenance.

Harga paket belum ditetapkan dan perlu divalidasi melalui riset pasar.

### 6.5 Material & Spare-part Margin

Pendapatan dari penjualan atau kerja sama penyediaan material dan spare part.

MVP hanya perlu mendukung pencatatan material dan biaya tambahan yang disetujui customer. Marketplace material dikembangkan setelah kebutuhan tervalidasi.

### 6.6 B2B SaaS Subscription

Perusahaan membayar biaya berlangganan untuk menggunakan fitur pengelolaan maintenance.

Variabel paket dapat mencakup:

- Jumlah lokasi.
- Jumlah aset.
- Jumlah pengguna.
- Jumlah work order.
- Fitur reporting dan approval.

### 6.7 B2B Maintenance Contract

Fixora menyediakan kontrak maintenance berkala untuk perusahaan.

Contoh:

- AC preventive maintenance.
- Plumbing maintenance.
- Electrical maintenance.
- General building maintenance.

Setiap kontrak harus memiliki scope, frekuensi, SLA, material, pengecualian, dan mekanisme pekerjaan tambahan yang jelas.

### Revenue strategy

| Tahap | Revenue utama |
|---|---|
| MVP | Transaction commission |
| Growth | Commission + service fee + recurring packages |
| B2B | SaaS subscription + maintenance contract |
| Enterprise | Subscription + service contract + integration services |

---

## 7. Regional Pricing Strategy

Harga layanan dapat berbeda berdasarkan wilayah.

Hierarki wilayah:

`Country → Province → City/Regency → Service Zone (optional)`

Prioritas pemilihan harga:

1. Service zone price.
2. City/regency price.
3. Jika tidak tersedia, layanan tidak dapat dipesan di area tersebut.

Model harga:

- **Fixed Price:** Untuk pekerjaan standar.
- **Variable Price:** Berdasarkan parameter pekerjaan.
- **Inspection & Quotation:** Untuk pekerjaan kompleks yang membutuhkan pemeriksaan.

Formula:

`Customer Price = Base Service Price + Approved Adjustments + Materials`

Prinsip:

- Harga dasar dan payout worker dikonfigurasi oleh admin.
- Worker tidak dapat mengubah harga dasar.
- Biaya tambahan harus disertai alasan dan persetujuan customer.
- Harga yang sudah dikonfirmasi disimpan sebagai snapshot pada booking.
- Perubahan harga baru tidak mengubah booking yang sudah dikonfirmasi.

---

## 8. Core User Journeys

### B2C Customer

1. Customer membuat akun.
2. Memilih kategori layanan.
3. Memasukkan lokasi dan detail masalah.
4. Mengunggah foto atau video jika diperlukan.
5. Melihat estimasi harga.
6. Memilih jadwal.
7. Mengonfirmasi booking dan pembayaran sesuai metode yang tersedia.
8. Fixora mencari worker.
9. Worker menerima dan menyelesaikan pekerjaan.
10. Customer mengonfirmasi hasil pekerjaan.
11. Customer memberikan rating dan review.

### Worker

1. Worker mendaftar.
2. Melengkapi profil, keahlian, dan area layanan.
3. Mengunggah dokumen verifikasi.
4. Admin melakukan verifikasi.
5. Worker mengatur ketersediaan.
6. Worker menerima atau menolak tawaran pekerjaan.
7. Worker melakukan pekerjaan.
8. Worker mengunggah bukti penyelesaian.
9. Pekerjaan dikonfirmasi dan payout diproses.

### B2B Business Customer

1. Perusahaan membuat organization account.
2. Admin perusahaan menambahkan lokasi atau cabang.
3. Perusahaan mencatat aset.
4. Perusahaan membuat jadwal preventive maintenance.
5. Sistem membuat work order.
6. Work order ditugaskan kepada worker atau service partner.
7. Approver menyetujui pekerjaan jika diperlukan.
8. Worker menyelesaikan pekerjaan dan mengunggah bukti.
9. Perusahaan memeriksa hasil dan biaya.
10. Dashboard menampilkan riwayat, SLA, dan pengeluaran.

---

## 9. Matching Strategy

Matching mempertimbangkan:

- Skill fit.
- Distance.
- Rating dan kualitas pekerjaan.
- Availability.
- Completion history.

Bobot awal yang dapat diuji:

| Faktor | Bobot awal |
|---|---:|
| Skill fit | 35% |
| Distance | 25% |
| Rating | 20% |
| Availability | 10% |
| Completion history | 10% |

Bobot tersebut adalah hipotesis awal dan harus dievaluasi menggunakan data operasional.

Strategi fallback:

1. Menawarkan pekerjaan kepada worker yang memenuhi syarat.
2. Menunggu respons sampai timeout.
3. Memperluas radius pencarian.
4. Menawarkan jadwal alternatif.
5. Melibatkan admin jika belum ada worker yang tersedia.

---

## 10. Success Metrics / KPIs

### Marketplace

- Booking conversion rate.
- Booking acceptance rate.
- Job completion rate.
- Cancellation rate.
- Average response time.
- On-time arrival rate.
- Complaint rate.
- Rework rate.
- Repeat customer rate.

### Business

- Gross merchandise value (GMV).
- Gross commission revenue.
- Revenue per completed order.
- Contribution margin per order.
- Customer acquisition cost (CAC).
- Customer lifetime value (LTV).
- Worker utilization.
- Monthly recurring revenue (MRR).
- B2B customer retention.
- Contract renewal rate.

Target angka belum ditetapkan. Baseline harus diperoleh dari pilot.

---

## 11. Risks & Mitigation

| Risiko | Mitigasi |
|---|---|
| Worker tidak hadir | Reminder, reconfirmation, reassignment, reliability tracking |
| Kualitas pekerjaan buruk | Checklist, foto before/after, complaint dan warranty workflow |
| Customer dan worker bertransaksi di luar platform | Garansi sesuai ketentuan, histori, support, pembayaran tercatat |
| Harga tidak sesuai kondisi aktual | Inspection flow dan customer approval |
| Supply worker tidak mencukupi | Launch terbatas per area dan kategori |
| Biaya operasional terlalu tinggi | Monitoring contribution margin per order |
| B2B scope terlalu kompleks | Validasi melalui pilot dan pengembangan bertahap |
| Risiko pekerjaan berbahaya | Verifikasi kompetensi, pembatasan kategori, dan prosedur keselamatan |

---

## 12. Open Decisions / Decision Register

Seluruh keputusan produk, bisnis, teknis, dan planning dicatat di satu tempat: [decisions.md](decisions.md). ID `DEC-001` – `DEC-044` yang sebelumnya ada di bagian ini tetap sama.

---

## 13. Pre-development Gate

Sebelum development MVP dimulai, minimal harus tersedia:

- Target area dan segmen customer.
- Kategori layanan yang benar-benar akan diluncurkan.
- Daftar worker awal dan proses verifikasinya.
- Struktur harga dan payout.
- Aturan cancellation, refund, dan complaint.
- Payment flow yang telah ditinjau.
- Customer journey dan worker journey.
- Acceptance criteria untuk fitur MVP.
- Kebijakan privasi dan ketentuan layanan awal.

PRD ini merupakan dasar product direction. Detail implementasi dan acceptance criteria dijelaskan dalam FRD, sedangkan target kualitas sistem dijelaskan dalam NFRD.