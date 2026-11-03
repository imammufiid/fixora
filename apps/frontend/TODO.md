# Mockup — TODO

Pekerjaan mockup yang belum selesai. Pemetaan layar ke FR ada di `docs/frd.md` §9, keputusan terbuka di `docs/decisions.md`.

## Bug & inkonsistensi

- [ ] Booking dikaitkan ke customer lewat **nama**, bukan ID (`b.customer === me.name`). Dua customer bernama sama saling melihat pesanan; ganti nama harus menyalin ke semua booking. Ganti ke `customerId`.
- [ ] Finance Admin masih bisa membatalkan booking dan menugaskan mitra di detail booking. Seharusnya hanya lihat (FRD §2 matriks akses).
- [ ] Login admin menampilkan "Email tidak terdaftar sebagai admin" — membocorkan keberadaan akun (NFR-074).
- [ ] Search bar di beranda customer tidak berfungsi.
- [ ] Tombol chat/telepon (customer & mitra) tidak berfungsi dan tanpa label aksesibel (FR-136, NFR-083).
- [ ] Tombol "Reset demo" tidak menghapus sesi admin di localStorage.

## Menunggu keputusan

- [ ] Rework gratis: harga customer Rp0 tetapi payout mitra tetap → margin negatif (DEC-042).
- [ ] Biaya tambahan masuk ke total customer tanpa alur penagihan (DEC-041).
- [ ] Biaya tambahan 100% ke mitra, tanpa komisi (DEC-040).
- [ ] Tidak ada auto-confirm di status `Waiting Confirmation` (DEC-043).

## Requirement yang belum ada di mockup

- [ ] FR-014 — ketersediaan mitra berbasis jadwal. Sekarang hanya toggle online; matching booking besok memakai status online saat ini.
- [ ] FR-017/018 — membuat & mengedit layanan baru. Katalog baru bisa aktif/nonaktif.
- [ ] FR-023 — kelola wilayah. Daftar area masih hard-coded di `store.jsx`.
- [ ] FR-079 — reminder jadwal (H-1 / 1 jam sebelum kunjungan).
- [ ] FR-059/FR-061 — pembayaran gagal/kedaluwarsa; status `Pending Payment` belum dipakai (DEC-061).
- [ ] FR-070 — moderasi review (P1).
- B2B (FRD §4) — di luar cakupan MVP mockup.
