# Kiriman Ayam — Timbangan Sample

App buat nyatet hasil timbangan sample ayam per pengiriman (PO), auto-ngitung
rata-rata / max / min, terus disimpen ke riwayat. Stack: Laravel (API) + Vue 3 (frontend).

## Struktur folder

```
kiriman-ayam/
├── backend/            -> file Laravel yang perlu ditempel ke instalasi Laravel-mu
│   ├── app/Models/
│   ├── app/Http/Controllers/Api/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/            -> project Vue 3 + Vite + Tailwind, sudah lengkap & bisa langsung jalan
└── database_updated.sql -> alternatif import manual lewat phpMyAdmin (kalau gak pakai migration)
```

## Setup Backend (Laravel)

Karena sandbox ini gak bisa akses Packagist, file backend dikasih dalam bentuk
**drop-in files**, bukan project Laravel utuh. Caranya:

1. Kalau belum ada project Laravel, bikin dulu di komputer/hosting kamu:
   ```bash
   composer create-project laravel/laravel kiriman-ayam-api
   ```
2. Copy folder `backend/app/Models`, `backend/app/Http/Controllers/Api`, dan
   `backend/database/migrations` ke lokasi yang sama di project Laravel kamu.
3. Buka `routes/api.php` punya project Laravel-mu, tempel isi dari
   `backend/routes/api.php` (dua route resource-nya).
4. Set koneksi DB di `.env`, lalu migrasi:
   ```bash
   php artisan migrate
   ```
   *(atau kalau mau manual, import `database_updated.sql` langsung ke phpMyAdmin)*
5. Aktifkan CORS kalau frontend beda origin — tinggal set
   `SANCTUM_STATEFUL_DOMAINS` / config `cors.php` sesuai domain frontend-mu,
   sama pola yang udah kamu pakai di project `client-erp`.
6. Jalankan: `php artisan serve` → default `http://127.0.0.1:8000/api`.

### Endpoint yang tersedia

| Method | Endpoint                    | Fungsi                                  |
|--------|------------------------------|------------------------------------------|
| GET    | /api/master-kiriman          | List nama kiriman                        |
| POST   | /api/master-kiriman          | Tambah nama kiriman                      |
| PUT    | /api/master-kiriman/{id}     | Edit nama kiriman                        |
| DELETE | /api/master-kiriman/{id}     | Hapus nama kiriman                       |
| GET    | /api/riwayat-input           | List riwayat (support filter & pagination) |
| POST   | /api/riwayat-input           | Simpan sesi timbangan (hitung stats di server) |
| GET    | /api/riwayat-input/{id}      | Detail satu riwayat                      |
| DELETE | /api/riwayat-input/{id}      | Hapus riwayat                            |

Body untuk `POST /api/riwayat-input`:
```json
{
  "nama_kiriman": "Onigiri Cipete",
  "nomer_po": "PO-2026-0708-01",
  "nilai": [4.1, 4.5, 5.0, 5.8]
}
```
`total_data`, `rata_rata`, `nilai_max`, `nilai_min` dihitung otomatis di backend
(gak percaya angka dari client), jadi tetap akurat walau ada yang iseng edit request-nya.

## Setup Frontend (Vue)

Folder `frontend/` udah lengkap, tinggal:

```bash
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_BASE_URL
npm run dev
```

Buka `http://localhost:5173`. Sudah dicoba `npm run build` dan sukses tanpa error.

## Alur pakai

1. **Mulai** — pilih/tambah nama kiriman, isi nomor PO, pilih presisi (1 atau 2 desimal).
2. **Input**:
   - Presisi 1 desimal → tap tombol cepat 4.1–6.0.
   - Presisi 2 desimal → geser slider (4.10–6.00) lalu tap "Tambahkan".
   - Total / rata-rata / max / min ke-update live, bisa undo/reset/hapus per item.
   - "Simpan & Selesai" → data + statistik kekirim ke `riwayat_input`.
3. **Riwayat** — lihat semua sesi tersimpan, filter by nama kiriman / no PO, lihat data mentah, hapus.
4. **Kiriman** — CRUD master nama kiriman.

## Catatan skema

`nilai_max` dan `nilai_min` di SQL aslimu itu `decimal(3,1)` (cuma muat 1 desimal).
Karena kamu minta ada mode 2 desimal, kolomnya gue lebarin ke `decimal(4,2)` di
migration & `database_updated.sql`. Kolom lain persis sama kayak dump aslimu.
