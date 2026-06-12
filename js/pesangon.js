// Kalkulator Pesangon PHK sesuai PP 35/2021

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
}

// Bulan upah uang pesangon (Pasal 40 ayat 2)
function bulanPesangon(masaKerjaTahun) {
  if (masaKerjaTahun < 1) return 1;
  if (masaKerjaTahun < 2) return 2;
  if (masaKerjaTahun < 3) return 3;
  if (masaKerjaTahun < 4) return 4;
  if (masaKerjaTahun < 5) return 5;
  if (masaKerjaTahun < 6) return 6;
  if (masaKerjaTahun < 7) return 7;
  if (masaKerjaTahun < 8) return 8;
  return 9;
}

// Bulan upah UPMK (Pasal 40 ayat 3)
function bulanUPMK(masaKerjaTahun) {
  if (masaKerjaTahun < 3) return 0;
  if (masaKerjaTahun < 6) return 2;
  if (masaKerjaTahun < 9) return 3;
  if (masaKerjaTahun < 12) return 4;
  if (masaKerjaTahun < 15) return 5;
  if (masaKerjaTahun < 18) return 6;
  if (masaKerjaTahun < 21) return 7;
  if (masaKerjaTahun < 24) return 8;
  return 10;
}

// Faktor pengali uang pesangon sesuai alasan PHK
const PENGALI = {
  'efisiensi-rugi': 0.5,
  'efisiensi-cegah': 1,
  'tutup-rugi': 0.5,
  'tutup-bukan-rugi': 1,
  'pailit': 0.5,
  'pensiun': 1.75,
  'meninggal': 2
};

document.getElementById('form-pesangon').addEventListener('submit', function (e) {
  e.preventDefault();
  const errorEl = document.getElementById('error-pesangon');
  const hasilEl = document.getElementById('hasil-pesangon');
  errorEl.textContent = '';
  hasilEl.classList.add('hidden');

  const gaji = parseFloat(document.getElementById('gaji').value);
  const tahun = parseInt(document.getElementById('masa-tahun').value, 10);
  const bulan = parseInt(document.getElementById('masa-bulan').value, 10) || 0;
  const sisaCuti = parseInt(document.getElementById('sisa-cuti').value, 10) || 0;
  const alasan = document.getElementById('alasan').value;

  if (!gaji || gaji <= 0) { errorEl.textContent = 'Mohon isi gaji dengan angka lebih dari 0.'; return; }
  if (isNaN(tahun) || tahun < 0 || bulan < 0 || bulan > 11) { errorEl.textContent = 'Mohon isi masa kerja dengan benar (bulan 0-11).'; return; }
  if (sisaCuti < 0) { errorEl.textContent = 'Sisa cuti tidak boleh negatif.'; return; }

  const masaKerja = tahun + bulan / 12;
  const pengali = PENGALI[alasan];

  const up = bulanPesangon(masaKerja) * gaji * pengali;
  const upmk = bulanUPMK(masaKerja) * gaji; // UPMK tidak dikali faktor pengali
  const uph = sisaCuti * (gaji / 25); // kompensasi cuti: upah harian = gaji / 25 hari kerja
  const total = up + upmk + uph;

  hasilEl.innerHTML = `
    <h2>Estimasi Hak Anda</h2>
    <p class="big-number">${formatRupiah(total)}</p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>Uang Pesangon (UP)</td><td>${bulanPesangon(masaKerja)} bln upah × ${pengali}x</td><td>${formatRupiah(up)}</td></tr>
      <tr><td>Penghargaan Masa Kerja (UPMK)</td><td>${bulanUPMK(masaKerja)} bln upah</td><td>${formatRupiah(upmk)}</td></tr>
      <tr><td>Penggantian Hak (UPH)</td><td>${sisaCuti} hari cuti</td><td>${formatRupiah(uph)}</td></tr>
      <tr class="total"><td colspan="2">Total Estimasi</td><td>${formatRupiah(total)}</td></tr>
    </table>
    <p style="margin-top:0.75rem;font-size:0.88rem;color:#5d6f68;">Lanjutkan ke <a href="jkp-jht.html">Kalkulator JKP & JHT</a> untuk menghitung hak BPJS Ketenagakerjaan Anda.</p>
  `;
  hasilEl.classList.remove('hidden');
  hasilEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
