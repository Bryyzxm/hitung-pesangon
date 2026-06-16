// Kalkulator Gaji Bersih (Take-Home Pay)
// PTKP dan hitungPPh21 dimuat dari js/pph21-core.js

document.getElementById("form-gaji").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-gaji");
  const hasilEl = document.getElementById("hasil-gaji");
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
  const bpjsOption = document.getElementById("bpjs-option").value;

  if (gaji <= 0) {
    errorEl.textContent = "Mohon isi gaji pokok dengan angka lebih dari 0.";
    document.getElementById("gaji").setAttribute("aria-invalid", "true");
    document.getElementById("gaji").focus();
    return;
  }

  const bruto = gaji + tunjanganTetap + tunjanganTidakTetap;

  // PPh 21
  const brutoTahunan = bruto * 12;
  const ptkp = PTKP[statusPTKP];
  const kenaPajak = brutoTahunan - ptkp;
  const pph21Tahunan = hitungPPh21(kenaPajak);
  const pph21Bulanan = Math.round(pph21Tahunan / 12);

  // BPJS Kesehatan (1% pekerja, cap upah 12jt)
  const upahBPJS = Math.min(bruto, 12000000);
  const bpjsPekerja =
    bpjsOption === "potong-gaji" ? Math.round(upahBPJS * 0.01) : 0;

  // JHT pekerja: 2% dari upah
  const jhtPekerja = Math.round(bruto * 0.02);

  // JP pekerja: 1% dari upah (max upah 9.555.600 → max JP 95.556)
  const upahJP = Math.min(bruto, 9555600);
  const jpPekerja = Math.round(upahJP * 0.01);

  const totalPotongan = pph21Bulanan + bpjsPekerja + jhtPekerja + jpPekerja;
  const takeHomePay = bruto - totalPotongan;
  const persenPotongan =
    bruto > 0 ? ((totalPotongan / bruto) * 100).toFixed(1) : 0;

  hasilEl.innerHTML = `
    <h2>Estimasi Gaji Bersih Anda</h2>
    <p class="big-number">${formatRupiah(takeHomePay)} <span class="result-sublabel">/ bulan</span></p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Potongan</th></tr>
      <tr><td>Gaji kotor (bruto)</td><td>Gaji + tunjangan</td><td>${formatRupiah(bruto)}</td></tr>
      <tr><td>PPh 21</td><td>Tarif progresif</td><td>-${formatRupiah(pph21Bulanan)}</td></tr>
      <tr><td>BPJS Kesehatan</td><td>${bpjsOption === "potong-gaji" ? "1% pekerja" : "Ditanggung perusahaan"}</td><td>-${formatRupiah(bpjsPekerja)}</td></tr>
      <tr><td>JHT (pekerja)</td><td>2% dari upah</td><td>-${formatRupiah(jhtPekerja)}</td></tr>
      <tr><td>JP (pekerja)</td><td>1% dari upah</td><td>-${formatRupiah(jpPekerja)}</td></tr>
      <tr><td>Total potongan</td><td>${persenPotongan}% dari bruto</td><td>-${formatRupiah(totalPotongan)}</td></tr>
      <tr class="total"><td colspan="2">Take-Home Pay</td><td>${formatRupiah(takeHomePay)}</td></tr>
    </table>
    <p class="result-aside">Rincian PPh 21: <a href="pph21.html">Kalkulator PPh 21</a> | Rincian BPJS: <a href="bpjs-kesehatan.html">Kalkulator BPJS Kesehatan</a></p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
