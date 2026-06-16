// Kalkulator PPh 21 Pajak Penghasilan Karyawan
// PTKP dan hitungPPh21 dimuat dari js/pph21-core.js

document.getElementById("form-pph21").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-pph21");
  const hasilEl = document.getElementById("hasil-pph21");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const gaji = parseFloat(document.getElementById("gaji").value) || 0;
  const tunjanganTetap =
    parseFloat(document.getElementById("tunjangan-tetap").value) || 0;
  const tunjanganTidakTetap =
    parseFloat(document.getElementById("tunjangan-tidak-tetap").value) || 0;
  const statusPTKP = document.getElementById("status-ptkp").value;

  if (gaji <= 0) {
    errorEl.textContent = "Mohon isi gaji pokok dengan angka lebih dari 0.";
    document.getElementById("gaji").setAttribute("aria-invalid", "true");
    document.getElementById("gaji").focus();
    return;
  }

  const brutoBulanan = gaji + tunjanganTetap + tunjanganTidakTetap;
  const brutoTahunan = brutoBulanan * 12;
  const ptkp = PTKP[statusPTKP];
  const penghasilanKenaPajak = brutoTahunan - ptkp;
  const pph21Tahunan = hitungPPh21(penghasilanKenaPajak);
  const pph21Bulanan = Math.round(pph21Tahunan / 12);
  const takeHomePay = brutoBulanan - pph21Bulanan;

  hasilEl.innerHTML = `
    <h2>Estimasi PPh 21 Anda</h2>
    <p class="big-number">${formatRupiah(takeHomePay)} <span class="result-sublabel">/ bulan</span></p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>Penghasilan bruto per bulan</td><td>Gaji + tunjangan</td><td>${formatRupiah(brutoBulanan)}</td></tr>
      <tr><td>Penghasilan bruto per tahun</td><td>${formatRupiah(brutoBulanan)} × 12</td><td>${formatRupiah(brutoTahunan)}</td></tr>
      <tr><td>PTKP (${statusPTKP})</td><td>Pengurangan wajib</td><td>${formatRupiah(ptkp)}</td></tr>
      <tr><td>Penghasilan kena pajak</td><td>Bruto - PTKP</td><td>${formatRupiah(Math.max(0, penghasilanKenaPajak))}</td></tr>
      <tr><td>PPh 21 per tahun</td><td>Tarif progresif Pasal 17</td><td>${formatRupiah(pph21Tahunan)}</td></tr>
      <tr><td>PPh 21 per bulan</td><td>Tahunan ÷ 12</td><td>${formatRupiah(pph21Bulanan)}</td></tr>
      <tr class="total"><td colspan="2">Take-Home Pay per bulan</td><td>${formatRupiah(takeHomePay)}</td></tr>
    </table>
    <p class="result-aside">Lihat rincian potongan lengkap di <a href="gaji-bersih.html">Kalkulator Gaji Bersih</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
