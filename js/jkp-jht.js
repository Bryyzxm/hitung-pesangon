// Kalkulator JKP & JHT BPJS Ketenagakerjaan per PP 6/2025

const BATAS_UPAH_JKP = 5000000; // batas atas upah untuk manfaat JKP
const IURAN_JHT = 0.057; // 5,7% dari upah per bulan (3,7% perusahaan + 2% pekerja)

document.getElementById("form-jkp").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-jkp");
  const hasilEl = document.getElementById("hasil-jkp");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const upah = parseFloat(document.getElementById("upah").value);
  const lamaIuran = parseFloat(document.getElementById("lama-iuran").value);

  if (!upah || upah <= 0) {
    errorEl.textContent = "Mohon isi upah dengan angka lebih dari 0.";
    document.getElementById("upah").setAttribute("aria-invalid", "true");
    document.getElementById("upah").focus();
    return;
  }
  if (isNaN(lamaIuran) || lamaIuran < 0) {
    errorEl.textContent = "Mohon isi lama kepesertaan dengan benar.";
    document.getElementById("lama-iuran").setAttribute("aria-invalid", "true");
    document.getElementById("lama-iuran").focus();
    return;
  }

  // JKP per PP 6/2025
  const upahJKP = Math.min(upah, BATAS_UPAH_JKP);
  const jkpBulanan = 0.6 * upahJKP;
  const totalJKP = jkpBulanan * 6;

  // JHT: akumulasi iuran sederhana (tanpa hasil pengembangan)
  const estimasiJHT = IURAN_JHT * upah * 12 * lamaIuran;

  hasilEl.innerHTML = `
    <h2>Estimasi Manfaat Anda</h2>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>JKP per bulan (PP 6/2025)</td><td>60% × ${formatRupiah(upahJKP)} / bln</td><td>${formatRupiah(jkpBulanan)} / bln</td></tr>
      <tr class="total"><td colspan="2">Total JKP (6 bulan flat)</td><td>${formatRupiah(totalJKP)}</td></tr>
    </table>
    <p>Total manfaat JKP naik 71% dibanding aturan lama (45%×3 bulan + 25%×3 bulan). Untuk cek kelayakan klaim JKP berdasarkan status pekerjaan (PKWT/PKWTT) dan sebab PHK, lihat <a href="klaim-jkp-2025.html">Kalkulator Klaim JKP 2025</a>.</p>
    <p class="big-number">${formatRupiah(estimasiJHT)}</p>
    <p>Estimasi minimal saldo JHT Anda dari akumulasi iuran selama ${lamaIuran} tahun. Saldo riil lebih besar karena ditambah hasil pengembangan investasi BPJS Ketenagakerjaan. Cek saldo pasti di aplikasi JMO.</p>
    <p class="result-aside">Sudah tahu total dana Anda? Cek <a href="burn-rate.html">berapa lama uang Anda bisa bertahan</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
