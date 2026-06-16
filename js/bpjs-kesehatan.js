// Kalkulator Iuran BPJS Kesehatan (PP 25/2015, PM 3/2023)

const UPAH_MAX = 12000000; // batas atas upah untuk iuran BPJS Kesehatan
const IURAN_PEKERJA = 0.01; // 1%
const IURAN_PERUSAHAAN = 0.03; // 3%

document.getElementById("form-bpjs").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-bpjs");
  const hasilEl = document.getElementById("hasil-bpjs");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const upah = parseFloat(document.getElementById("upah").value);
  const tanggungan =
    parseInt(document.getElementById("tanggungan").value, 10) || 0;

  if (!upah || upah <= 0) {
    errorEl.textContent = "Mohon isi upah dengan angka lebih dari 0.";
    document.getElementById("upah").setAttribute("aria-invalid", "true");
    document.getElementById("upah").focus();
    return;
  }
  if (tanggungan < 0 || tanggungan > 3) {
    errorEl.textContent = "Jumlah tanggungan maksimal 3.";
    document.getElementById("tanggungan").setAttribute("aria-invalid", "true");
    document.getElementById("tanggungan").focus();
    return;
  }

  const upahDikenakan = Math.min(upah, UPAH_MAX);
  const iuranPekerja = upahDikenakan * IURAN_PEKERJA;
  const iuranPerusahaan = upahDikenakan * IURAN_PERUSAHAAN;
  const iuranTanggungan = tanggungan * (upahDikenakan * IURAN_PEKERJA);
  const totalPotongGaji = iuranPekerja + iuranTanggungan;
  const totalIuran = iuranPekerja + iuranPerusahaan + iuranTanggungan;

  hasilEl.innerHTML = `
    <h2>Estimasi Iuran BPJS Kesehatan</h2>
    <p class="big-number">${formatRupiah(totalPotongGaji)} <span class="result-sublabel">/ bulan (potong gaji)</span></p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>Upah yang dikenakan</td><td>${upah > UPAH_MAX ? "Dibatasi maks Rp12jt" : "Sesuai upah"}</td><td>${formatRupiah(upahDikenakan)}</td></tr>
      <tr><td>Iuran pekerja (1%)</td><td>Dipotong dari gaji</td><td>${formatRupiah(iuranPekerja)}</td></tr>
      <tr><td>Iuran perusahaan (3%)</td><td>Ditanggung perusahaan</td><td>${formatRupiah(iuranPerusahaan)}</td></tr>
      ${tanggungan > 0 ? `<tr><td>Iuran tanggungan (${tanggungan} orang × 1%)</td><td>Ditambah ke potong gaji</td><td>${formatRupiah(iuranTanggungan)}</td></tr>` : ""}
      <tr class="total"><td colspan="2">Total iuran per bulan</td><td>${formatRupiah(totalIuran)}</td></tr>
    </table>
    <p class="result-aside">Lihat potongan gaji lengkap di <a href="gaji-bersih.html">Kalkulator Gaji Bersih</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
