# HitungPesangon

Website micro tools untuk membantu pekerja Indonesia yang terdampak PHK menghitung hak finansialnya. Ini situs statis 100% client-side, tanpa build step dan tanpa server aplikasi.

## Tools

1. **Kalkulator Pesangon PHK** (`pesangon.html`) - UP, UPMK, dan UPH sesuai UU Cipta Kerja & PP 35/2021.
2. **Kalkulator JKP & JHT** (`jkp-jht.html`) - estimasi manfaat tunai Jaminan Kehilangan Pekerjaan dan saldo JHT BPJS Ketenagakerjaan.
3. **Kalkulator Daya Tahan Dana** (`burn-rate.html`) - berapa lama tabungan + pesangon bertahan, plus saran penghematan.
4. **Kalkulator THR** (`thr.html`) - hitung THR proporsional atau penuh sesuai masa kerja.
5. **Kalkulator PPh 21** (`pph21.html`) - estimasi pajak penghasilan pasal 21 dengan PTKP dan tarif progresif.
6. **Kalkulator BPJS Kesehatan** (`bpjs-kesehatan.html`) - hitung iuran pekerja dan perusahaan berdasarkan upah dan tanggungan.
7. **Kalkulator Gaji Bersih** (`gaji-bersih.html`) - hitung take-home pay setelah PPh 21, BPJS Kesehatan, JHT, dan JP.
8. **Kalkulator Dana Darurat** (`dana-darurat.html`) - rekomendasi dana darurat berdasarkan tanggungan dan status kerja.
9. **Simulasi Pensiun** (`simulasi-pensiun.html`) - proyeksi kebutuhan dan saldo pensiun dengan asumsi inflasi.
10. **Kalkulator Uang Sakit & Cuti Tahunan** (`uang-sakit-cuti.html`) - estimasi hak uang sakit dan cuti tahunan.

## Deploy ke GitHub Pages

Situs dipublish otomatis ke GitHub Pages melalui workflow `.github/workflows/pages.yml` setiap push ke branch `main`. File `CNAME` berisi custom domain `hitungpesangon.my.id`.

Setelah push ke GitHub, buka **Settings > Pages** di repository, lalu pastikan **Source** menggunakan **GitHub Actions** dan custom domain berisi `hitungpesangon.my.id`.

Untuk domain root `hitungpesangon.my.id`, tambahkan A record berikut di panel DNS domain:

```text
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

Opsional, untuk `www.hitungpesangon.my.id`, tambahkan:

```text
Type: CNAME
Name: www
Value: bryyzxm.github.io
```

Tunggu propagasi DNS, lalu aktifkan **Enforce HTTPS** di **Settings > Pages** setelah sertifikat tersedia.

## Quality checks

Jalankan pemeriksaan ini sebelum publish:

```bash
npx --yes prettier --check --ignore-unknown "*.html" "css/**/*.css" "js/**/*.js" "README.md" ".github/workflows/**/*.yml" "robots.txt" "sitemap.xml"
npx --yes htmlhint "*.html"
python scripts/validate-static.py
npx --yes playwright test
```

## Disclaimer

Seluruh hasil perhitungan bersifat estimasi dan bukan nasihat hukum atau keuangan.
