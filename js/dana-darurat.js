// Kalkulator Dana Darurat Ideal

document.getElementById("form-dana").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-dana");
  const hasilEl = document.getElementById("hasil-dana");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const pengeluaran = parseFloat(document.getElementById("pengeluaran").value);
  const tanggungan = parseInt(document.getElementById("tanggungan").value, 10);
  const statusKerja = document.getElementById("status-kerja").value;
  const danaSaatIni =
    parseFloat(document.getElementById("dana-saat-ini").value) || 0;

  if (!pengeluaran || pengeluaran <= 0) {
    errorEl.textContent =
      "Mohon isi pengeluaran bulanan dengan angka lebih dari 0.";
    document.getElementById("pengeluaran").setAttribute("aria-invalid", "true");
    document.getElementById("pengeluaran").focus();
    return;
  }

  // Hitung bulan minimum, ideal, nyaman berdasarkan tanggungan
  let bulanMin, bulanIdeal, bulanNyaman;
  if (tanggungan === 0) {
    bulanMin = 3;
    bulanIdeal = 6;
    bulanNyaman = 9;
  } else if (tanggungan === 1) {
    bulanMin = 6;
    bulanIdeal = 9;
    bulanNyaman = 12;
  } else {
    bulanMin = 9;
    bulanIdeal = 12;
    bulanNyaman = 18;
  }

  // Jika sedang cari kerja, tambah 3 bulan
  if (statusKerja === "cari-kerja") {
    bulanMin += 3;
    bulanIdeal += 3;
    bulanNyaman += 3;
  }

  const targetMin = bulanMin * pengeluaran;
  const targetIdeal = bulanIdeal * pengeluaran;
  const targetNyaman = bulanNyaman * pengeluaran;

  // Progress bar: berapa % target tercapai
  const persen =
    danaSaatIni > 0 ? Math.min((danaSaatIni / targetIdeal) * 100, 100) : 0;
  let kelasMeter = "";
  if (persen >= 100) {
    /* hijau, default */
  } else if (persen >= 50) {
    kelasMeter = "warn";
  } else {
    kelasMeter = "danger";
  }

  // Saran nabung per bulan untuk capai target ideal dalam 12 bulan
  const sisaTarget = Math.max(0, targetIdeal - danaSaatIni);
  const saranPerBulan = Math.ceil(sisaTarget / 12);

  hasilEl.innerHTML = `
    <h2>Target Dana Darurat Anda</h2>
    <p class="big-number">${formatRupiah(targetIdeal)}</p>
    <div class="meter ${kelasMeter}"><div style="width:${persen}%"></div></div>
    ${danaSaatIni > 0 ? `<p>Saat ini Anda memiliki <strong>${formatRupiah(danaSaatIni)}</strong> (${persen.toFixed(0)}% dari target ideal).</p>` : ""}
    <table>
      <tr><th>Tingkat</th><th>Bulan</th><th>Target</th></tr>
      <tr><td>Minimum</td><td>${bulanMin} bulan</td><td>${formatRupiah(targetMin)}</td></tr>
      <tr class="total"><td>Ideal</td><td>${bulanIdeal} bulan</td><td>${formatRupiah(targetIdeal)}</td></tr>
      <tr><td>Nyaman</td><td>${bulanNyaman} bulan</td><td>${formatRupiah(targetNyaman)}</td></tr>
    </table>
    ${sisaTarget > 0 ? `<p class="result-note">Untuk mencapai target ideal dalam 12 bulan: tabung <strong>${formatRupiah(saranPerBulan)}/bulan</strong>.</p>` : '<p class="result-success">Target ideal sudah tercapai!</p>'}
    <p class="result-aside">Sudah punya dana? Cek <a href="burn-rate.html">berapa lama bisa bertahan</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
