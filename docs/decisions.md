# Fixora — Decision Register

**Status dokumen:** Single source of truth untuk semua keputusan produk, bisnis, teknis, dan planning  
**Terakhir diperbarui:** 2 November 2026  
**Menggantikan:** PRD §12 (DEC), NFRD §14 (NDEC), Planning §15 (PLAN), dan daftar keputusan di FRD §8

Semua keputusan dicatat di sini. Dokumen lain cukup merujuk ID `DEC-xxx`. Jangan membuat daftar keputusan baru di dokumen lain.

---

## 1. Cara pakai

**Status**

| Status | Arti |
|---|---|
| Decided | Keputusan final. Perubahan harus dicatat sebagai keputusan baru. |
| Proposed | Ada usulan (dari docs atau mockup), menunggu persetujuan. |
| TBD | Belum ada usulan. Perlu riset atau diskusi. |

**Kolom**

- **Usulan saat ini:** nilai yang sedang dipakai di docs atau mockup. Kosong (—) jika belum ada.
- **Diperlukan sebelum:** gate paling awal yang terblokir jika keputusan belum diambil.
- **Owner (usulan):** role yang bertanggung jawab mengambil keputusan, mengacu ke Planning §12. Perlu dikonfirmasi.
- **ID lama:** ID dari daftar sebelumnya yang digabung ke baris ini.

**Gate** (urut waktu): Phase 0 exit → Development start → MVP release → Pilot start → Phase 2 → Phase 3 start → Phase 4.

Saat sebuah keputusan diambil: ubah status menjadi **Decided**, isi nilai final di kolom *Usulan saat ini*, lalu catat tanggal dan pengambil keputusan di §4.

---

## 2. Ringkasan

| Status | Jumlah |
|---|---:|
| Decided | 2 |
| Proposed | 35 |
| TBD | 26 |
| **Total** | **63** |

Keputusan yang memblokir **Development start** dan masih TBD: DEC-023, DEC-031, DEC-033, DEC-040, DEC-041, DEC-042, DEC-045, DEC-051, DEC-052, DEC-055, DEC-056, DEC-059, DEC-061.

---

## 3. Register

| ID | Keputusan | Area | Status | Usulan saat ini | Diperlukan sebelum | Owner (usulan) | ID lama |
|---|---|---|---|---|---|---|---|
| DEC-001 | Nama produk | Produk | Decided | Fixora | — | PM | — |
| DEC-002 | Entry product | Produk | Proposed | B2C marketplace | Phase 0 exit | PM | — |
| DEC-003 | Arah pengembangan jangka panjang | Produk | Proposed | B2B property maintenance management | Phase 3 start | PM | — |
| DEC-004 | Kota dan area pilot | Operasional | Proposed | Satu kota/area terbatas. Mockup: Jakarta Selatan (Kebayoran Baru, Tebet) | Phase 0 exit | PM, Operations | PLAN-001 |
| DEC-005 | Kategori layanan MVP | Produk | Proposed | AC, plumbing, electrical, handyman | Phase 0 exit | PM, Operations | PLAN-002 |
| DEC-006 | Model worker | Operasional | Proposed | Independent, service partner, specialist | Development start | PM, Operations | — |
| DEC-007 | Pengelolaan harga | Pricing | Proposed | Harga dikelola terpusat oleh admin; worker tidak bisa mengubah harga dasar | Development start | PM | — |
| DEC-008 | Harga per wilayah | Pricing | Decided | Harga dapat berbeda per wilayah | — | PM | — |
| DEC-009 | Granularitas harga regional | Pricing | Proposed | Country → Province → City → Service Zone; validasi harga (payout < harga, tanpa duplikat — FR-131) | Development start | PM | FRD §8 Pricing |
| DEC-010 | Fallback harga | Pricing | Proposed | Zone → city → layanan tidak tersedia | Development start | PM | — |
| DEC-011 | Model harga | Pricing | Proposed | Fixed, variable, inspection & quotation | Development start | PM | — |
| DEC-012 | Persetujuan biaya tambahan | Pricing | Proposed | Wajib disetujui customer sebelum pekerjaan selesai | Development start | PM | — |
| DEC-013 | Price snapshot | Pricing | Proposed | Booking menyimpan snapshot harga saat dikonfirmasi | Development start | PM | — |
| DEC-014 | Metode matching | Matching | Proposed | Multi-factor scoring | Development start | PM, Tech Lead | — |
| DEC-015 | Bobot matching awal | Matching | Proposed | Skill 35, jarak 25, rating 20, availability 10, histori 10; worker baru rating netral 4,5 | Development start | PM | — |
| DEC-016 | Commission sebagai revenue MVP | Bisnis | Proposed | Komisi per transaksi. Rate belum final; simulasi & mockup memakai ±15% | Development start | PM, Business | — |
| DEC-017 | Service fee | Bisnis | Proposed | Ada service fee customer (nilai: DEC-034) | Development start | PM, Business | — |
| DEC-018 | Emergency/express surcharge | Bisnis | Proposed | Ada; besaran belum ditentukan | Phase 2 | PM, Business | — |
| DEC-019 | Customer subscription | Bisnis | Proposed | Free / Plus / Business; harga belum ditentukan | Phase 2 | PM, Business | — |
| DEC-020 | Material margin / supplier partnership | Bisnis | Proposed | MVP hanya mencatat material; marketplace setelah tervalidasi | Phase 2 | Business | — |
| DEC-021 | B2B SaaS subscription | Bisnis | Proposed | Ada | Phase 3 start | Business | — |
| DEC-022 | B2B maintenance contract | Bisnis | Proposed | Ada | Phase 3 start | Business | — |
| DEC-023 | Payment gateway, settlement, payout, dan refund provider | Payment | TBD | Mockup: QRIS, VA BCA, GoPay | Development start | PM, Tech Lead, Finance | NDEC-008, PLAN-006, FRD §8 Payment |
| DEC-024 | Kebijakan cancellation & refund | Kebijakan | Proposed | Gratis sebelum worker ditugaskan; Rp25.000 setelahnya untuk kompensasi worker; setelah On The Way hanya via admin; refund 1–3 hari kerja (FRD §5) | MVP release | PM, Operations | PLAN-007, FRD §8 Cancellation |
| DEC-025 | Inspection fee & mekanisme quotation | Pricing | TBD | — | MVP release | PM | FRD §8 Inspection |
| DEC-026 | Warranty per kategori layanan | Kebijakan | Proposed | Rework gratis 7 hari untuk semua kategori pilot; respons komplain 2×24 jam; ditinjau per kategori | Pilot start | PM, Operations | PLAN-008, FRD §8 Warranty |
| DEC-027 | Prosedur no-show & appeal worker | Operasional | Proposed | Belum ada detail prosedur | MVP release | Operations | — |
| DEC-028 | B2B approval workflow & threshold | B2B | Proposed | Ada approval; threshold & hierarki role belum ditentukan | Phase 3 start | PM | FRD §8 B2B approval |
| DEC-029 | B2B pricing metric | B2B | TBD | Kandidat: lokasi, aset, user, work order | Phase 3 start | Business | PLAN-012, FRD §8 B2B pricing |
| DEC-030 | B2B & enterprise contract scope dan SLA | B2B | TBD | — | Phase 3 start | Business | PLAN-013, NDEC-012 |
| DEC-031 | Platform MVP (web, mobile, atau kombinasi) | Teknis | TBD | Mockup: customer & mitra mobile-first web, admin desktop web | Development start | PM, Tech Lead | PLAN-003, FRD §8 Platform |
| DEC-032 | Kebijakan penyimpanan & retensi data | Privasi | TBD | — | MVP release | PM, Legal | NDEC-005 |
| DEC-033 | Legal, pajak, klasifikasi worker, liability | Legal | TBD | — | Development start | Legal | — |
| DEC-034 | Besaran customer service fee | Bisnis | Proposed | Flat Rp10.000 per booking | Development start | PM, Business | — |
| DEC-035 | Mekanisme job offer | Matching | Proposed | Berurutan ke satu worker, timeout 30 detik, tidak ditawarkan ulang ke worker yang menolak/timeout | Development start | PM | — |
| DEC-036 | Radius matching | Matching | Proposed | 5 km, diperluas ke 10 km, lalu eskalasi ke admin | Development start | PM, Operations | — |
| DEC-037 | Jadwal payout worker | Payment | Proposed | Mingguan (Senin); booking dalam komplain ditahan | Development start | Finance, Operations | — |
| DEC-038 | Metode autentikasi | Teknis | Proposed | Customer & worker: nomor HP + OTP. Admin: email + password + OTP email, opsi Google SSO | Development start | Tech Lead | — |
| DEC-039 | Slot jadwal kunjungan | Operasional | Proposed | Slot 2 jam (08/10/13/15/17), booking s.d. H+4 | Development start | PM, Operations | — |
| DEC-040 | Komisi atas biaya tambahan/material | Bisnis | TBD | Mockup: 100% ke worker, tanpa komisi | Development start | PM, Business | FRD §8 Additional cost |
| DEC-041 | Penagihan biaya tambahan ke customer | Payment | TBD | Opsi: charge terpisah saat disetujui vs digabung saat konfirmasi. Mockup belum punya alur penagihan | Development start | PM, Finance | FRD §8 Additional cost |
| DEC-042 | Penanggung payout worker pada rework gratis | Bisnis | TBD | Mockup: worker tetap dibayar, customer Rp0 (margin negatif) | Development start | PM, Finance | FRD §8 Rework |
| DEC-043 | Batas waktu auto-confirm hasil pekerjaan | Kebijakan | TBD | — | MVP release | PM, Operations | FRD §8 Confirmation |
| DEC-044 | Checklist pekerjaan wajib di MVP | Produk | Proposed | Wajib (FR-057 naik P1 → P0); mockup sudah mewajibkan | Development start | PM | — |
| DEC-045 | Cloud / infrastructure provider | Teknis | TBD | — | Development start | Tech Lead | NDEC-001 |
| DEC-046 | Target availability production | Teknis | Proposed | 99,5% per bulan (NFR-008) | MVP release | Tech Lead | NDEC-002 |
| DEC-047 | Target performa & workload | Teknis | Proposed | API p95 ≤ 1,5 s (normal), ≤ 800 ms (sederhana); 100 concurrent users (NFR-001 – NFR-004) | MVP release | Tech Lead | NDEC-003 |
| DEC-048 | RPO & RTO | Teknis | Proposed | RPO ≤ 24 jam, RTO ≤ 8 jam | MVP release | Tech Lead | NDEC-004 |
| DEC-049 | Retensi log | Teknis | TBD | — | MVP release | Tech Lead, Legal | NDEC-006 |
| DEC-050 | Cakupan security testing | Teknis | TBD | Prioritas: autentikasi, payment, file upload, akses data bisnis | MVP release | Tech Lead | NDEC-007 |
| DEC-051 | Notification provider (push, WhatsApp, email, SMS OTP) | Teknis | TBD | Mockup: push & WhatsApp untuk status pesanan, email untuk OTP admin | Development start | Tech Lead | NDEC-009 |
| DEC-052 | Map / geolocation provider | Teknis | TBD | — | Development start | Tech Lead | NDEC-010 |
| DEC-053 | Pendekatan tenant isolation B2B | Teknis | TBD | — | Phase 3 start | Tech Lead | NDEC-011 |
| DEC-054 | Target onboarding worker untuk pilot | Operasional | Proposed | 20–30 worker terverifikasi (hipotesis, Planning §5) | Pilot start | Operations | PLAN-004 |
| DEC-055 | Harga & payout final per layanan dan wilayah | Pricing | TBD | Mockup: contoh AC Rp150.000 (zone Kebayoran Baru) dengan payout 85% | Development start | PM, Business | PLAN-005 |
| DEC-056 | Tim & kapasitas development | Planning | TBD | Tim minimum di Planning §12 | Development start | PM | PLAN-009 |
| DEC-057 | Target KPI pilot | Planning | TBD | Ditentukan setelah baseline | Pilot start | PM | PLAN-010 |
| DEC-058 | Customer B2B untuk pilot | B2B | TBD | Kandidat: perusahaan 2–5 cabang, office building, retail, property manager | Phase 3 start | Business | PLAN-011 |
| DEC-059 | Verifikasi worker, taksonomi skill, & syarat keselamatan | Operasional | TBD | Mockup: KTP & SKCK wajib, sertifikat opsional; verifikasi 1–2 hari kerja | Development start | Operations | FRD §8 Worker |
| DEC-060 | Definisi perhitungan SLA | B2B | TBD | Perlu definisi jam kerja, kondisi pause, dan definisi resolusi | Phase 3 start | PM | FRD §8 SLA |
| DEC-061 | Alur pembayaran gagal / kedaluwarsa | Payment | TBD | Mockup: pembayaran selalu sukses; status `Pending Payment` belum dipakai | Development start | PM, Tech Lead | FRD §8 Payment failure |
| DEC-062 | Provider chat/telepon dengan nomor tersamar | Teknis | TBD | Dibutuhkan oleh FR-136 & NFR-078 | MVP release | Tech Lead | FRD §8 Contact masking |
| DEC-063 | Perhitungan kapasitas slot jadwal | Operasional | TBD | Mockup: slot "penuh" disimulasikan | MVP release | PM, Tech Lead | FRD §5 Scheduling |

---

## 4. Log keputusan

Catat setiap keputusan yang berubah menjadi **Decided**.

| Tanggal | ID | Keputusan final | Diputuskan oleh | Catatan |
|---|---|---|---|---|
| — | DEC-001 | Fixora | — | Tercatat sebelum register ini dibuat |
| — | DEC-008 | Harga dapat berbeda per wilayah | — | Tercatat sebelum register ini dibuat |

---

## 5. Pemetaan ID lama

| ID lama | Sekarang |
|---|---|
| NDEC-001 – NDEC-012 | DEC-045, DEC-046, DEC-047, DEC-048, DEC-032, DEC-049, DEC-050, DEC-023, DEC-051, DEC-052, DEC-053, DEC-030 (berurutan) |
| PLAN-001 – PLAN-013 | DEC-004, DEC-005, DEC-031, DEC-054, DEC-055, DEC-023, DEC-024, DEC-026, DEC-056, DEC-057, DEC-058, DEC-029, DEC-030 (berurutan) |
