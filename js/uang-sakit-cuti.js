// Kalkulator Uang Sakit & Cuti Tahunan

document.getElementById("form-cuti").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-cuti");
  const hasilEl = document.getElementById("hasil-cuti");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const gaji = parseFloat(document.getElementById("gaji").value);
  const hariSakit =
    parseInt(document.getElementById("hari-sakit").value, 10) || 0;
  const hariCuti =
    parseInt(document.getElementById("hari-cuti").value, 10) || 0;

  if (!gaji || gaji <= 0) {
    errorEl.textContent = "Mohon isi gaji pokok dengan angka lebih dari 0.";
    document.getElementById("gaji").setAttribute("aria-invalid", "true");
    document.getElementById("gaji").focus();
    return;
  }
  if (hariSakit < 0) {
    errorEl.textContent = "Jumlah hari sakit tidak boleh negatif.";
    document.getElementById("hari-sakit").setAttribute("aria-invalid", "true");
    document.getElementById("hari-sakit").focus();
    return;
  }
  if (hariCuti < 0) {
    errorEl.textContent = "Jumlah hari cuti tidak boleh negatif.";
    document.getElementById("hari-cuti").setAttribute("aria-invalid", "true");
    document.getElementById("hari-cuti").focus();
    return;
  }

  const upahHarian = gaji / 25; // 25 hari kerja per bulan

  // Uang sakit: 25% bulan 1-4, 50% bulan 5-8
  // Untuk simplifikasi: hitung berdasarkan total hari sakit
  // Asumsi: 1 bulan = 25 hari kerja
  let uangSakit = 0;
  const rincianSakit = [];
  if (hariSakit > 0) {
    // Fase 1: 4 bulan pertama (25% dari upah per hari)
    const hariFase1 = Math.min(hariSakit, 100); // max 4 × 25 = 100 hari
    const uangFase1 = hariFase1 * upahHarian * 0.25;
    if (hariFase1 > 0) {
      rincianSakit.push(
        "<tr><td>4 bulan pertama (25%)</td><td>" +
          hariFase1 +
          " hari × 25% × " +
          formatRupiah(upahHarian) +
          "</td><td>" +
          formatRupiah(uangFase1) +
          "</td></tr>",
      );
    }

    // Fase 2: bulan 5-8 (50% dari upah per hari)
    const hariFase2 = Math.max(0, hariSakit - 100);
    const uangFase2 = hariFase2 * upahHarian * 0.5;
    if (hariFase2 > 0) {
      rincianSakit.push(
        "<tr><td>Bulan ke-5 s/d ke-8 (50%)</td><td>" +
          hariFase2 +
          " hari × 50% × " +
          formatRupiah(upahHarian) +
          "</td><td>" +
          formatRupiah(uangFase2) +
          "</td></tr>",
      );
    }

    uangSakit = uangFase1 + uangFase2;

    // Info jika lebih dari 8 bulan
    if (hariSakit > 200) {
      rincianSakit.push(
        '<tr><td class="result-danger">Catatan</td><td colspan="2">Lebih dari 8 bulan sakit tidak dibayar</td></tr>',
      );
    }
  }

  // Uang cuti: 2× upah harian per hari cuti
  const uangCuti = hariCuti * 2 * upahHarian;

  const total = uangSakit + uangCuti;

  hasilEl.innerHTML = `
    <h2>Estimasi Uang Sakit & Cuti Anda</h2>
    <p class="big-number">${formatRupiah(total)}</p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      ${rincianSakit.join("")}
      ${hariSakit > 0 && rincianSakit.length === 0 ? "<tr><td>Uang sakit</td><td>" + hariSakit + " hari × 25% × " + formatRupiah(upahHarian) + "</td><td>" + formatRupiah(uangSakit) + "</td></tr>" : ""}
      <tr><td>Uang cuti tahunan</td><td>${hariCuti} hari × 2 × ${formatRupiah(upahHarian)}</td><td>${formatRupiah(uangCuti)}</td></tr>
      <tr class="total"><td colspan="2">Total</td><td>${formatRupiah(total)}</td></tr>
    </table>
    <p class="result-aside">Terdampak PHK? Hitung <a href="pesangon.html">pesangon Anda</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
