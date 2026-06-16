// Kalkulator THR (Tunjangan Hari Raya) sesuai PP 36/2021

document.getElementById("form-thr").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-thr");
  const hasilEl = document.getElementById("hasil-thr");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const gaji = parseFloat(document.getElementById("gaji").value);
  const masaKerja = parseInt(document.getElementById("masa-kerja").value, 10);

  if (!gaji || gaji <= 0) {
    errorEl.textContent = "Mohon isi gaji dengan angka lebih dari 0.";
    document.getElementById("gaji").setAttribute("aria-invalid", "true");
    document.getElementById("gaji").focus();
    return;
  }
  if (isNaN(masaKerja) || masaKerja < 1 || masaKerja > 12) {
    errorEl.textContent = "Masa kerja harus antara 1-12 bulan.";
    document.getElementById("masa-kerja").setAttribute("aria-invalid", "true");
    document.getElementById("masa-kerja").focus();
    return;
  }

  // THR = 1 bulan upah jika ≥12 bulan, proporsional jika <12 bulan
  const thr = (masaKerja / 12) * gaji;

  hasilEl.innerHTML = `
    <h2>Estimasi THR Anda</h2>
    <p class="big-number">${formatRupiah(thr)}</p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>Upah per bulan</td><td>Gaji + tunjangan tetap</td><td>${formatRupiah(gaji)}</td></tr>
      <tr><td>Masa kerja</td><td>${masaKerja} dari 12 bulan</td><td>${((masaKerja / 12) * 100).toFixed(1)}%</td></tr>
      <tr class="total"><td colspan="2">Total THR</td><td>${formatRupiah(thr)}</td></tr>
    </table>
    <p class="result-aside">Terdampak PHK? Hitung <a href="pesangon.html">pesangon Anda</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
