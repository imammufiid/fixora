# fixora

Monorepo dikelola dengan [pnpm workspaces](https://pnpm.io/workspaces). Semua platform dijalankan dari root.

## Struktur

- `apps/*` — aplikasi per platform (customer, mitra, admin, backend)
- `packages/*` — kode bersama antar aplikasi
- `apps/frontend/` — prototype UI interaktif (`fixora-frontend`)
- `docs/` — PRD, FRD, NFRD, planning, decision register

## Setup

```sh
corepack enable   # memakai versi pnpm dari field packageManager
pnpm install
```

## Perintah

```sh
pnpm dev            # jalankan script dev di semua package
pnpm build          # build semua package
pnpm frontend:dev   # hanya frontend
pnpm --filter <nama-package> <script>
```

Tambah dependency ke package tertentu: `pnpm --filter <nama-package> add <dep>`.
