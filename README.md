# HitungPesangon

Website micro tools untuk membantu pekerja Indonesia yang terdampak PHK menghitung hak finansialnya. 100% client-side (HTML, CSS, JavaScript) tanpa server.

## Tools

1. **Kalkulator Pesangon PHK** (`pesangon.html`) - UP, UPMK, dan UPH sesuai UU Cipta Kerja & PP 35/2021.
2. **Kalkulator JKP & JHT** (`jkp-jht.html`) - estimasi manfaat tunai Jaminan Kehilangan Pekerjaan dan saldo JHT BPJS Ketenagakerjaan.
3. **Kalkulator Daya Tahan Dana** (`burn-rate.html`) - berapa lama tabungan + pesangon bertahan, plus saran penghematan.

## Deploy ke GitLab Pages

Pipeline `.gitlab-ci.yml` otomatis mem-publish situs ke GitLab Pages setiap push ke branch default. Setelah pipeline pertama sukses, buka **Deploy > Pages** di sidebar proyek untuk melihat URL situs.

## Monetisasi (AdSense)

Slot iklan sudah disiapkan sebagai elemen `<div class="ad-slot">` di setiap halaman (bawah header dan bawah hasil perhitungan). Ganti placeholder tersebut dengan kode unit iklan AdSense setelah situs disetujui.

## Disclaimer

Seluruh hasil perhitungan bersifat estimasi dan bukan nasihat hukum atau keuangan.
