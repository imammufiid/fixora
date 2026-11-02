# Fixora — Non-Functional Requirements Document (NFRD)

**Document status:** Draft — Updated  
**Version:** 2.1

---

## 1. Purpose

NFRD mendefinisikan standar kualitas sistem Fixora. Persyaratan mencakup performa, keamanan, availability, scalability, data integrity, usability, observability, dan kesiapan pengembangan B2B.

Angka yang belum divalidasi ditandai sebagai **proposed target** dan harus dikonfirmasi sebelum production launch.

---

## 2. Performance

| ID | Requirement | Proposed Target |
|---|---|---|
| NFR-001 | API response untuk operasi normal | p95 ≤ 1.5 detik |
| NFR-002 | API response untuk operasi sederhana | p95 ≤ 800 ms |
| NFR-003 | Dashboard initial load | ≤ 3 detik pada koneksi memadai |
| NFR-004 | Sistem mendukung concurrent users | Baseline 100 concurrent users untuk MVP |
| NFR-005 | Sistem mendukung pagination untuk daftar data besar | Wajib |
| NFR-006 | Proses matching tidak memblokir request utama | Asynchronous processing |
| NFR-007 | Notification dan callback diproses secara asynchronous jika sesuai | Wajib |

Target harus diuji dengan workload yang mewakili pola penggunaan aktual, bukan hanya jumlah virtual users.

---

## 3. Availability & Reliability

| ID | Requirement | Proposed Target |
|---|---|---|
| NFR-008 | Production availability | 99.5% per bulan |
| NFR-009 | Sistem menangani kegagalan integrasi eksternal | Retry dan failure handling |
| NFR-010 | Payment callback harus idempotent | Wajib |
| NFR-011 | Background job harus dapat dipantau | Wajib |
| NFR-012 | Kegagalan job dapat di-retry secara aman | Wajib |
| NFR-013 | Data transaksi tidak boleh hilang akibat retry | Wajib |
| NFR-014 | Sistem menyediakan backup database | Wajib |

Target availability merupakan usulan awal. SLA aktual bergantung pada infrastruktur dan kontrak provider.

---

## 4. Security

| ID | Requirement |
|---|---|
| NFR-015 | Seluruh komunikasi client-server menggunakan HTTPS/TLS. |
| NFR-016 | Password disimpan menggunakan password hashing yang aman. |
| NFR-017 | Sistem menerapkan authentication dan authorization. |
| NFR-018 | Hak akses admin dan business user menerapkan least privilege. |
| NFR-019 | Data organization harus terisolasi secara konsisten. |
| NFR-020 | Sistem memvalidasi input untuk mencegah injection dan serangan umum. |
| NFR-021 | Upload file membatasi ukuran, tipe, dan memvalidasi konten. |
| NFR-022 | Secret dan credential tidak boleh disimpan dalam source code. |
| NFR-023 | Sistem mencatat aktivitas sensitif dan perubahan penting. |
| NFR-024 | Sistem membatasi request untuk mencegah abuse. |
| NFR-025 | Akses administratif harus dilindungi dengan kontrol keamanan tambahan yang sesuai risiko. |

### 4.1 Authentication controls (proposed)

| ID | Requirement | Proposed Target |
|---|---|---|
| NFR-071 | Login admin dikunci sementara setelah percobaan password gagal berturut-turut | 5 percobaan |
| NFR-072 | Kode OTP (HP dan email) memiliki masa berlaku, batas kirim ulang, dan rate limit per nomor/email | 6 digit, kirim ulang setelah 60 detik |
| NFR-073 | Tautan reset password admin sekali pakai dan memiliki masa berlaku | 30 menit |
| NFR-074 | Respons login dan lupa password tidak boleh membocorkan apakah akun terdaftar | Wajib |
| NFR-075 | Password admin memenuhi kebijakan minimum | ≥ 8 karakter, kombinasi huruf besar, angka, simbol |
| NFR-076 | Sesi admin dapat dicabut dari perangkat lain; opsi "ingat saya" memakai sesi persisten, selain itu sesi berakhir saat browser ditutup | Wajib |
| NFR-077 | Admin baru wajib memverifikasi email sebelum dapat mengakses konsol | Wajib |

Catatan mockup: halaman login admin menampilkan pesan "Email tidak terdaftar sebagai admin". Ini bertentangan dengan NFR-074 dan harus diganti dengan pesan generik pada implementasi.

Security review dan penetration testing harus dilakukan sebelum production launch, dengan prioritas pada authentication, payment, file upload, dan akses data bisnis.

---

## 5. Privacy & Data Protection

| ID | Requirement |
|---|---|
| NFR-026 | Sistem hanya mengumpulkan data yang dibutuhkan. |
| NFR-027 | Data pribadi hanya dapat diakses oleh role yang berwenang. |
| NFR-028 | Lokasi customer dan worker hanya digunakan sesuai tujuan layanan. |
| NFR-029 | Sistem menyediakan kebijakan privasi dan persetujuan yang relevan. |
| NFR-030 | Retensi dan penghapusan data mengikuti kebijakan dan ketentuan hukum yang berlaku. |
| NFR-031 | Data sensitif tidak boleh muncul pada log aplikasi secara tidak perlu. |
| NFR-032 | Akses dan perubahan data penting dapat diaudit. |
| NFR-078 | Nomor telepon customer dan worker tidak ditampilkan langsung satu sama lain; komunikasi melalui chat/telepon tersamar. |
| NFR-079 | Akses admin ke data kontak customer dan worker tercatat di audit log. |
| NFR-080 | Dokumen verifikasi worker (KTP, SKCK) disimpan terenkripsi dan hanya dapat dibuka oleh role verifikasi. |

Kebijakan privasi, retensi, consent, dan pengelolaan data harus ditinjau terhadap ketentuan perlindungan data pribadi di Indonesia.

---

## 6. Scalability

| ID | Requirement |
|---|---|
| NFR-033 | Sistem mendukung penambahan wilayah layanan tanpa perubahan besar pada struktur data. |
| NFR-034 | Sistem mendukung pertumbuhan jumlah worker, customer, dan booking. |
| NFR-035 | Sistem mendukung pemisahan proses asynchronous dari API utama. |
| NFR-036 | Sistem dapat dikembangkan untuk multi-property dan multi-organization. |
| NFR-037 | Query dan indexing harus mendukung pencarian berdasarkan area, status, dan waktu. |
| NFR-038 | Sistem mendukung pertumbuhan histori pekerjaan dan transaksi. |

Arsitektur MVP dapat sederhana, tetapi data model harus menghindari asumsi satu customer hanya memiliki satu lokasi atau satu perusahaan hanya memiliki satu properti.

---

## 7. Multi-tenancy & Data Integrity

| ID | Requirement |
|---|---|
| NFR-039 | Setiap data B2B harus memiliki konteks organization yang jelas. |
| NFR-040 | Authorization harus memverifikasi organization scope di server-side. |
| NFR-041 | Relasi booking, payment, work order, dan asset harus konsisten. |
| NFR-042 | Perubahan harga tidak mengubah snapshot transaksi yang sudah dikonfirmasi. |
| NFR-043 | Perubahan status transaksi harus tervalidasi dan dapat diaudit. |
| NFR-044 | Proses pembayaran dan payout harus konsisten serta dapat direkonsiliasi. |

---

## 8. Usability & Accessibility

| ID | Requirement |
|---|---|
| NFR-045 | Customer dapat memahami proses booking tanpa bantuan operator untuk alur normal. |
| NFR-046 | Worker dapat mengoperasikan alur pekerjaan melalui perangkat mobile. |
| NFR-047 | Status, harga, dan biaya tambahan ditampilkan secara jelas. |
| NFR-048 | Error message menjelaskan tindakan yang dapat dilakukan pengguna. |
| NFR-049 | Form menggunakan validasi dan instruksi yang jelas. |
| NFR-050 | Antarmuka mempertimbangkan aksesibilitas, termasuk kontras, label, dan navigasi keyboard. |
| NFR-081 | Aplikasi customer dan worker dirancang mobile-first, termasuk dukungan safe area perangkat. |
| NFR-082 | Operasi yang bergantung pada jaringan menampilkan status loading, sukses, dan gagal. |
| NFR-083 | Tombol yang hanya berisi ikon memiliki label aksesibel. |

Target aksesibilitas yang disarankan adalah WCAG 2.1 AA untuk antarmuka yang relevan.

---

## 9. Observability & Auditability

| ID | Requirement |
|---|---|
| NFR-051 | Sistem menyediakan centralized application logging. |
| NFR-052 | Error dan kegagalan background job dapat dimonitor. |
| NFR-053 | Sistem memonitor API latency dan error rate. |
| NFR-054 | Aktivitas penting memiliki actor, timestamp, dan perubahan yang relevan. |
| NFR-055 | Payment dan payout memiliki transaction reference yang dapat ditelusuri. |
| NFR-056 | Admin dapat menelusuri histori booking dan complaint. |
| NFR-057 | Sistem menyediakan alert untuk kegagalan proses kritis. |

---

## 10. Maintainability & Operability

| ID | Requirement |
|---|---|
| NFR-058 | Struktur aplikasi memiliki pemisahan tanggung jawab yang jelas. |
| NFR-059 | Perubahan database dikelola menggunakan migration. |
| NFR-060 | API memiliki dokumentasi. |
| NFR-061 | Sistem memiliki automated unit dan integration tests. |
| NFR-062 | Alur utama memiliki end-to-end tests. |
| NFR-063 | Deployment dapat dilakukan secara terkontrol dan memiliki rollback procedure. |
| NFR-064 | Konfigurasi environment dipisahkan dari source code. |
| NFR-065 | Sistem menyediakan health check untuk komponen utama. |

---

## 11. Integration Requirements

| ID | Requirement |
|---|---|
| NFR-066 | Integrasi payment menggunakan mekanisme autentikasi resmi provider. |
| NFR-067 | Webhook divalidasi dan diproses secara idempotent. |
| NFR-068 | Integrasi notification memiliki retry dan error handling. |
| NFR-069 | Integrasi peta/geolocation memiliki fallback jika provider tidak tersedia. |
| NFR-070 | Integrasi B2B di masa depan menggunakan API yang terdokumentasi dan access control. |

---

## 12. Backup & Disaster Recovery

Proposed baseline:

- Backup database terjadwal.
- Backup dienkripsi dan memiliki akses terbatas.
- Backup disimpan terpisah dari environment utama.
- Restore procedure diuji secara berkala.
- Monitoring backup failure.
- RPO dan RTO ditentukan berdasarkan dampak bisnis.

Target awal yang dapat dievaluasi:

| Parameter | Proposed Target |
|---|---|
| RPO | ≤ 24 jam |
| RTO | ≤ 8 jam |

Angka ini harus ditinjau berdasarkan biaya infrastruktur dan kebutuhan operasional. Untuk B2B dengan kontrak SLA lebih ketat, target dapat berbeda.

---

## 13. NFR Validation Plan

| Area | Validation |
|---|---|
| Performance | Load test dan stress test |
| Reliability | Failure simulation dan retry test |
| Security | Code review, vulnerability scan, penetration test |
| Privacy | Access review dan data handling review |
| Multi-tenancy | Cross-organization authorization test |
| Data integrity | Transaction consistency dan reconciliation test |
| Backup | Restore drill |
| Usability | User acceptance testing |
| Maintainability | Automated test dan deployment validation |

---

## 14. Open Decisions

Keputusan teknis dan NFR dicatat di [decisions.md](decisions.md). ID lama `NDEC-001` – `NDEC-012` dipetakan ke `DEC-xxx` di §5 dokumen tersebut. Contoh: target availability = DEC-046, RPO/RTO = DEC-048, payment provider = DEC-023.

NFR dianggap selesai hanya jika memiliki metode pengujian dan hasil validasi yang dapat ditelusuri.