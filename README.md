# Aksara Eksponensial Satoshi — Portfolio Website

Website portofolio resmi Aksara Eksponensial Satoshi, perusahaan pengembang
teknologi AI. Dibangun sepenuhnya dengan HTML, CSS, dan JavaScript vanilla —
tanpa framework, backend, atau database — sehingga siap di-deploy sebagai
static website di GitHub Pages.

## Struktur Proyek

```
aksara-eksponensial-satoshi/
├── index.html          # Halaman utama (hero, about, systems, projects, dst.)
├── style.css           # Seluruh styling
├── script.js           # Interaksi: menu mobile, reveal, filter proyek, copy-to-clipboard
├── robots.txt          # Aturan crawler + lokasi sitemap
├── sitemap.xml         # Peta URL untuk search engine
├── assets/
│   ├── images/         # Gambar (og-cover, screenshot proyek, dll.)
│   └── icons/          # favicon.svg
└── README.md
```

## Menjalankan Secara Lokal

Karena ini murni static site, tidak ada proses build. Cukup buka
`index.html` langsung di browser, atau jalankan local server sederhana
agar path relatif (`fetch`, module, dll.) bekerja normal:

```bash
# Python 3
python3 -m http.server 8000

# atau Node.js (http-server)
npx http-server .
```

Lalu buka `http://localhost:8000` di browser.

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `aksara-eksponensial-satoshi`.
2. Push seluruh isi folder ini ke branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[USERNAME]/aksara-eksponensial-satoshi.git
   git push -u origin main
   ```
3. Di repository GitHub: buka **Settings → Pages**.
4. Pada **Source**, pilih branch `main` dan folder `/ (root)`.
5. Simpan. GitHub akan menerbitkan situs di:
   `https://[USERNAME].github.io/aksara-eksponensial-satoshi/`
6. Setelah URL final diketahui, ganti seluruh placeholder `[USERNAME]` pada
   `index.html`, `robots.txt`, dan `sitemap.xml` dengan username GitHub yang
   sebenarnya.

## Placeholder yang Perlu Diisi

Konten berikut sengaja dikosongkan sebagai placeholder karena datanya belum
tersedia saat pembuatan. Tidak ada data yang dikarang:

- `[USERNAME]`, `[GITHUB_ORG_URL]`, `[GITHUB_PROFILE_URL]` — URL GitHub
- `[EMAIL]`, `[X_PROFILE_URL]`, `[LINKEDIN_URL]` — kontak
- `[PROJECT NAME]`, `[DESCRIPTION]`, `[TECH STACK]`, `[DEMO URL]` — detail proyek pada bagian Projects
- `[JUDUL EKSPERIMEN]`, `[YYYY-MM-DD]`, tag — entri pada Lab Notes
- `[LOKASI]`, `[TAHUN]` — pada bagian About
- `assets/images/og-cover.png` — gambar Open Graph/Twitter, belum disertakan

Isi setiap placeholder dengan data nyata sebelum publish, atau hapus section
terkait apabila memang belum relevan.

## Catatan Teknis

- Tidak ada dependency eksternal (tanpa font/CDN pihak ketiga) — semua
  tipografi memakai system font stack agar loading cepat dan tetap berfungsi
  offline.
- Reveal animation menghormati `prefers-reduced-motion`.
- Navigasi mobile, filter proyek, dan copy-to-clipboard murni JavaScript
  vanilla, tanpa library.
