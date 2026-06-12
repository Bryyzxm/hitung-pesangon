// Kalkulator JKP & JHT BPJS Ketenagakerjaan

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
}

const BATAS_UPAH_JKP = 5000000; // batas atas upah untuk manfaat JKP
const IURAN_JHT = 0.057; // 5,7% dari upah per bulan (3,7% perusahaan + 2% pekerja)

document.getElementById('form-jkp').addEventListener('submit', function (e) {
  e.preventDefault();
  const errorEl = document.getElementById('error-jkp');
  const hasilEl = document.getElementById('hasil-jkp');
  errorEl.textContent = '';
  hasilEl.classList.add('hidden');

  const upah = parseFloat(document.getElementById('upah').value);
  const lamaIuran = parseFloat(document.getElementById('lama-iuran').value);

  if (!upah || upah <= 0) { errorEl.textContent = 'Mohon isi upah dengan angka lebih dari 0.'; return; }
  if (isNaN(lamaIuran) || lamaIuran < 0) { errorEl.textContent = 'Mohon isi lama kepesertaan dengan benar.'; return; }

  // JKP: 45% x upah (3 bulan pertama) + 25% x upah (3 bulan berikutnya), upah maks Rp5 juta
  const upahJKP = Math.min(upah, BATAS_UPAH_JKP);
  const jkpFase1 = 0.45 * upahJKP;
  const jkpFase2 = 0.25 * upahJKP;
  const totalJKP = jkpFase1 * 3 + jkpFase2 * 3;

  // JHT: akumulasi iuran sederhana (tanpa hasil pengembangan)
  const estimasiJHT = IURAN_JHT * upah * 12 * lamaIuran;

  hasilEl.innerHTML = `
    <h2>Estimasi Manfaat Anda</h2>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>JKP bulan ke-1 s.d. 3</td><td>45% × ${formatRupiah(upahJKP)} / bln</td><td>${formatRupiah(jkpFase1)} / bln</td></tr>
      <tr><td>JKP bulan ke-4 s.d. 6</td><td>25% × ${formatRupiah(upahJKP)} / bln</td><td>${formatRupiah(jkpFase2)} / bln</td></tr>
      <tr class="total"><td colspan="2">Total JKP (6 bulan)</td><td>${formatRupiah(totalJKP)}</td></tr>
    </table>
    <p class="big-number" style="margin-top:1rem;">${formatRupiah(estimasiJHT)}</p>
    <p>Estimasi minimal saldo JHT Anda dari akumulasi iuran selama ${lamaIuran} tahun. Saldo riil lebih besar karena ditambah hasil pengembangan investasi BPJS Ketenagakerjaan. Cek saldo pasti di aplikasi JMO.</p>
    <p style="margin-top:0.75rem;font-size:0.88rem;color:#5d6f68;">Sudah tahu total dana Anda? Cek <a href="burn-rate.html">berapa lama uang Anda bisa bertahan</a>.</p>
  `;
  hasilEl.classList.remove('hidden');
  hasilEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
