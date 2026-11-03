# Fixora — Product & Development Planning

**Document status:** Initial Planning Draft  
**Version:** 1.0  
**Related documents:** PRD v2.0, FRD v2.0, NFRD v2.0

---

## 1. Planning Objectives

Planning ini menjadi panduan untuk membawa Fixora dari tahap ide hingga peluncuran marketplace MVP, kemudian mengembangkan recurring maintenance dan B2B platform.

Tujuan utama:

1. Memvalidasi kebutuhan pasar sebelum investasi development terlalu besar.
2. Meluncurkan marketplace dengan operasional yang dapat dikendalikan.
3. Memastikan supply worker tersedia dan berkualitas.
4. Membuktikan unit economics dan repeat usage.
5. Mempersiapkan fondasi produk untuk B2B tanpa membangun seluruh fitur enterprise di awal.

---

## 2. Product Development Strategy

Fixora dikembangkan melalui empat fase.

| Phase | Product | Fokus |
|---|---|---|
| 0 | Validation & Preparation | Validasi bisnis dan operasional |
| 1 | B2C Marketplace MVP | Booking, worker, matching, payment |
| 2 | Recurring Maintenance | Repeat order, reminder, maintenance plan |
| 3 | B2B Maintenance Management | Organization, asset, work order, SLA |
| 4 | Enterprise | Integrasi, approval, reporting lanjutan |

**Prinsip:** Setiap fase harus memiliki exit criteria. Fase berikutnya tidak otomatis dimulai hanya karena development fase sebelumnya selesai.

---

## 3. Phase 0 — Validation & Preparation

**Estimasi:** 2–4 minggu  
**Tujuan:** Memastikan model bisnis dan operasional dapat dijalankan.

### Activities

**Market validation**
- Menentukan kota atau wilayah pilot.
- Melakukan wawancara calon customer.
- Mengidentifikasi kategori layanan dengan permintaan yang nyata.
- Membandingkan harga layanan dan alternatif kompetitor.
- Menguji willingness to pay.

**Worker validation**
- Mengidentifikasi calon teknisi dan service partner.
- Menguji proses verifikasi.
- Memvalidasi area layanan dan ketersediaan.
- Memastikan struktur payout menarik bagi worker.

**Business validation**
- Menyusun simulasi komisi dan service fee.
- Menghitung biaya payment gateway.
- Menghitung biaya akuisisi customer.
- Mengestimasi biaya operasional per booking.
- Menyusun cancellation, refund, dan complaint policy.

**Product preparation**
- Finalisasi PRD, FRD, dan NFRD.
- Membuat user flow.
- Membuat wireframe dan prototype.
- Menentukan platform MVP.
- Menyusun backlog dan acceptance criteria.

### Deliverables

- Market validation report.
- Initial pricing catalog.
- Worker onboarding procedure.
- Business model dan unit economics assumptions.
- Finalized MVP scope.
- UX/UI prototype — draft interaktif tersedia di `apps/frontend/` (aplikasi customer, aplikasi mitra, admin console). Pemetaan layar ke requirement ada di FRD §9.
- Development backlog.
- Risk register.

### Exit Criteria

- Target customer dan area pilot sudah ditentukan.
- Kategori layanan awal sudah dipilih.
- Calon worker awal tersedia.
- Struktur harga dan payout dapat dijalankan.
- Payment dan complaint flow sudah ditentukan.
- Tim memahami scope MVP dan acceptance criteria.

---

## 4. Phase 1 — B2C Marketplace MVP

**Estimasi:** 8–12 minggu setelah Phase 0  
**Tujuan:** Membuktikan Fixora dapat menghasilkan dan menyelesaikan transaksi maintenance.

### Workstream A — Platform Foundation

- Project setup.
- Authentication dan authorization.
- User profile.
- Role management.
- Database foundation.
- File upload.
- Notification foundation.
- Logging dan monitoring.
- Deployment pipeline.

### Workstream B — Service & Pricing

- Service category.
- Service detail.
- Regional hierarchy.
- Regional pricing.
- Price calculation.
- Price snapshot.
- Additional cost approval.

### Workstream C — Worker Management

- Worker registration.
- Skill management.
- Area service.
- Document verification.
- Availability management.
- Admin verification dashboard.

### Workstream D — Booking & Matching

- Customer booking.
- Address management.
- Schedule selection.
- Booking status.
- Matching engine.
- Job offer.
- Worker acceptance.
- Matching timeout dan fallback.
- Admin intervention.

### Workstream E — Job Execution

- Worker job dashboard.
- Job status update.
- Before/after evidence.
- Customer completion confirmation.
- Rating dan review.
- Complaint handling.

### Workstream F — Payment & Operations

- Payment provider integration.
- Payment status.
- Commission calculation.
- Payout record.
- Admin booking monitoring.
- Transaction dashboard.
- Cancellation dan refund workflow sesuai policy.

### Deliverables

- Customer-facing application.
- Worker-facing application atau interface.
- Admin dashboard.
- Working booking-to-completion flow.
- Payment integration.
- Initial service catalog dan regional pricing.
- Automated test suite.
- UAT report.
- Production deployment.

### MVP Release Gate

MVP belum boleh diluncurkan sebelum:

- Critical booking flow berhasil diuji.
- Payment dan callback tidak menghasilkan transaksi duplikat.
- Worker verification berjalan.
- Matching dan fallback telah diuji.
- Customer dapat melihat harga sebelum konfirmasi.
- Complaint dan cancellation dapat ditangani.
- Security dan backup baseline telah divalidasi.
- Operasional memiliki SOP untuk menangani booking bermasalah.

---

## 5. Phase 1.1 — Pilot Operation

**Estimasi:** 4–8 minggu setelah MVP release  
**Tujuan:** Menguji marketplace dalam kondisi operasional nyata.

### Pilot Scope

- Satu kota atau area terbatas.
- 3–4 kategori layanan awal, jika supply mencukupi.
- Target awal 20–30 worker terverifikasi sebagai hipotesis operasional.
- Customer onboarding terbatas.
- Admin-assisted operations.

### Operational Activities

- Memantau setiap booking.
- Mengukur waktu pencarian worker.
- Memeriksa ketepatan kedatangan.
- Memantau cancellation dan no-show.
- Mengumpulkan feedback customer.
- Mengevaluasi kualitas pekerjaan.
- Mengukur biaya operasional per order.
- Memvalidasi harga dan payout.

### KPI to Monitor

| KPI | Purpose |
|---|---|
| Booking conversion | Mengukur keberhasilan customer membuat booking |
| Acceptance rate | Mengukur kesiapan supply worker |
| Completion rate | Mengukur keberhasilan penyelesaian |
| On-time arrival | Mengukur reliabilitas worker |
| Cancellation rate | Mengukur gangguan operasional |
| Complaint rate | Mengukur kualitas layanan |
| Repeat booking | Mengukur customer retention |
| Contribution margin/order | Mengukur kelayakan ekonomi transaksi |

Target numerik ditentukan setelah baseline pilot tersedia.

### Exit Criteria

- Alur booking dapat berjalan secara konsisten.
- Worker supply mencukupi untuk area pilot.
- Keluhan dapat ditangani dengan SOP.
- Ada bukti customer bersedia menggunakan layanan kembali.
- Contribution margin memiliki jalur yang masuk akal menuju positif.
- Masalah operasional utama telah memiliki tindakan perbaikan.

---

## 6. Phase 2 — Recurring Maintenance

**Estimasi:** 6–10 minggu  
**Tujuan:** Meningkatkan repeat order dan recurring revenue.

### Features

- Maintenance reminder.
- Repeat booking.
- Recurring booking.
- Maintenance package.
- Basic asset record.
- Maintenance history.
- Customer subscription.
- Subscription billing.
- Reminder dan renewal notification.

### Business Experiments

- Menguji paket maintenance AC.
- Menguji paket maintenance rumah.
- Mengukur subscription conversion.
- Mengukur repeat booking rate.
- Membandingkan margin transaksi satu kali dengan paket berulang.

### Deliverables

- Recurring booking flow.
- Subscription management.
- Basic maintenance record.
- Revenue experiment report.
- Retention report.

### Exit Criteria

- Customer menggunakan fitur repeat atau recurring.
- Paket maintenance memiliki demand yang dapat dibuktikan.
- Biaya layanan berulang dapat diprediksi.
- Proses pembatalan dan perubahan jadwal berjalan dengan baik.

---

## 7. Phase 3 — B2B Maintenance Management

**Estimasi:** 10–16 minggu  
**Tujuan:** Mengubah Fixora dari marketplace transaksi menjadi platform pengelolaan maintenance perusahaan.

### Workstream A — Organization Management

- Business registration.
- Organization profile.
- Member invitation.
- Role dan permission.
- Branch/property management.
- Organization data isolation.

### Workstream B — Asset Management

- Asset registry.
- Asset category.
- Asset identification.
- Asset location.
- Asset status.
- Warranty information.
- Maintenance history.

### Workstream C — Work Order

- Create work order.
- Priority management.
- Assign worker/vendor.
- Work order status.
- Work evidence.
- Work completion verification.

### Workstream D — Preventive Maintenance

- Maintenance plan.
- Recurring schedule.
- Automatic work order generation.
- Maintenance reminder.
- Schedule monitoring.
- Overdue tracking.

### Workstream E — Approval & SLA

- Approval workflow.
- Cost approval.
- Work authorization.
- Response time measurement.
- Resolution time measurement.
- SLA dashboard.

### Workstream F — Reporting

- Work order report.
- Maintenance history report.
- Expense report.
- Asset maintenance report.
- Vendor performance report.
- Preventive versus corrective maintenance report.

### B2B Pilot Strategy

Jangan langsung menargetkan enterprise besar.

Mulai dengan satu atau dua perusahaan yang memiliki beberapa lokasi dan kebutuhan maintenance berulang.

Contoh pilot:

- Perusahaan dengan 2–5 cabang.
- Office building dengan beberapa kategori aset.
- Retail business dengan beberapa outlet.
- Property manager dengan beberapa gedung.

Pilot harus memiliki ruang lingkup, jumlah aset, jenis layanan, frekuensi, dan SLA yang disepakati.

### Deliverables

- B2B dashboard.
- Organization dan property management.
- Asset registry.
- Work order management.
- Preventive maintenance.
- Approval workflow.
- Reporting.
- B2B pilot report.

### Exit Criteria

- Perusahaan dapat mengelola lokasi dan aset.
- Work order dapat dibuat dan diselesaikan.
- Riwayat pekerjaan tercatat.
- Preventive maintenance menghasilkan pekerjaan sesuai jadwal.
- Data antar-organization terisolasi.
- Customer B2B memperoleh manfaat yang dapat diukur.
- Model subscription atau maintenance contract tervalidasi.

---

## 8. Phase 4 — Enterprise Platform

**Estimasi:** Berdasarkan kebutuhan dan kontrak pelanggan.

### Potential Features

- Advanced approval hierarchy.
- Budget control.
- Enterprise SLA.
- Vendor contract management.
- Advanced analytics.
- API integration.
- ERP/accounting integration.
- Multi-organization reporting.
- Custom workflow.
- Enterprise access control.

Fitur enterprise dikembangkan berdasarkan kebutuhan pelanggan berbayar, bukan sekadar asumsi bahwa perusahaan besar membutuhkan semuanya.

---

## 9. High-level Timeline

Timeline berikut merupakan estimasi awal dan bukan komitmen delivery.

| Phase | Estimasi | Milestone |
|---|---|---|
| Phase 0 | Week 1–4 | Validation complete |
| Phase 1 | Week 5–16 | MVP ready |
| Phase 1.1 | Week 17–24 | Pilot evaluation |
| Phase 2 | Setelah pilot | Recurring maintenance |
| Phase 3 | Setelah B2B validation | B2B pilot |
| Phase 4 | Berdasarkan kontrak | Enterprise expansion |

Timeline aktual ditentukan setelah jumlah developer, designer, QA, dan kapasitas operasional diketahui.

---

## 10. Priority Framework

Gunakan prioritas berikut untuk mengontrol scope.

### P0 — Must Have

Tanpa fitur ini, MVP tidak dapat menjalankan alur bisnis utama.

Contoh:
- Authentication.
- Service catalog.
- Pricing.
- Booking.
- Matching.
- Worker job lifecycle.
- Payment.
- Admin operations.

### P1 — Should Have

Penting untuk meningkatkan kualitas atau membuka fase pertumbuhan.

Contoh:
- Recurring booking.
- Subscription.
- Asset management.
- Work order.
- Preventive maintenance.
- SLA.

### P2 — Future

Dapat dikembangkan setelah kebutuhan tervalidasi.

Contoh:
- Enterprise API.
- Advanced analytics.
- Complex approval hierarchy.
- Supplier marketplace.
- Advanced procurement integration.

---

## 11. Dependencies

| Dependency | Required For |
|---|---|
| Market research | Final scope dan target segment |
| Worker supply | Marketplace launch |
| Pricing validation | Booking dan revenue |
| Payment provider | Payment dan payout |
| Notification provider | Booking dan job updates |
| Map/geolocation provider | Location dan matching |
| Legal review | Terms, payment, worker relationship, liability |
| UX/UI prototype | Development readiness |
| Security review | Production launch |
| B2B pilot customer | B2B roadmap validation |

---

## 12. Team & Responsibilities

Tim minimum yang disarankan:

| Role | Responsibility |
|---|---|
| Product Manager | Scope, priority, stakeholder, roadmap |
| UI/UX Designer | User flow, prototype, usability |
| Backend Developer | API, business logic, integration |
| Frontend Developer | Customer, worker, admin interface |
| QA Engineer | Test planning, functional dan regression testing |
| Operations | Worker onboarding, booking support, complaint |
| Business Development | Customer acquisition dan B2B partnership |

Satu orang dapat memegang lebih dari satu peran pada tahap awal, tetapi tanggung jawabnya harus tetap jelas.

---

## 13. Release & Quality Gates

Setiap release harus melewati:

1. Requirement review.
2. Development completion.
3. Code review.
4. Unit dan integration test.
5. Feature-level end-to-end test.
6. Regression test.
7. Security dan access review sesuai perubahan.
8. UAT.
9. Release approval.
10. Post-release monitoring.

Critical defects harus diselesaikan sebelum production release. Defect non-critical harus memiliki workaround, owner, dan target perbaikan.

---

## 14. Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope MVP terlalu besar | Delay dan biaya meningkat | Scope freeze dan phased delivery |
| Worker supply kurang | Booking gagal | Pilot terbatas dan onboarding terencana |
| Harga tidak kompetitif | Conversion rendah | Pricing validation |
| Kualitas pekerjaan tidak konsisten | Retention rendah | Verification, checklist, complaint handling |
| Unit economics negatif | Bisnis tidak sustainable | Contribution margin monitoring |
| Customer bypass platform | Commission leakage | Trust, support, warranty, repeat convenience |
| B2B terlalu kompleks | Development overrun | Pilot satu segmen dan scope terbatas |
| Data B2B bocor antar-tenant | Risiko serius | Tenant isolation dan authorization testing |

---

## 15. Planning Decisions to Finalize

Keputusan planning beserta gate *Diperlukan sebelum* dicatat di [decisions.md](decisions.md). ID lama `PLAN-001` – `PLAN-013` dipetakan ke `DEC-xxx` di §5 dokumen tersebut.

---

## 16. Definition of Success

Fixora tidak dinilai hanya dari jumlah fitur atau jumlah booking.

Keberhasilan harus dibuktikan melalui tiga aspek:

**Product**
- Customer berhasil memesan layanan.
- Worker berhasil menyelesaikan pekerjaan.
- Kualitas dan pengalaman pengguna dapat dipertahankan.

**Business**
- Transaksi menghasilkan contribution margin yang sehat.
- Customer melakukan repeat booking.
- Revenue tidak hanya bergantung pada customer baru.
- B2B customer bersedia membayar subscription atau maintenance contract.

**Operations**
- Worker supply tersedia.
- Booking dapat dipenuhi.
- Komplain dapat diselesaikan.
- Kualitas layanan dan SLA dapat dimonitor.

---

## 17. Final Planning Principle

Urutan pengembangan Fixora:

`Validate Demand → Build Marketplace → Prove Operations → Improve Retention → Validate B2B → Build Maintenance Management → Expand Enterprise`

Jangan membangun platform enterprise sebelum Fixora memiliki bukti bahwa marketplace dan operasional maintenance dapat berjalan dengan baik.

Dokumen ini harus diperbarui setelah Phase 0 selesai dan setiap kali scope, estimasi, atau keputusan bisnis berubah.