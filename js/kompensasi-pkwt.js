// Kalkulator Kompensasi PKWT (Kontrak) per PP 35/2021 + Putusan MK 168/2023

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

function hitungBulan(start, end) {
  if (!start || !end) return 0;
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const dayAdjust = end.getDate() >= start.getDate() ? 0 : -1;
  return Math.max(0, months + dayAdjust);
}

function formatMasaKerja(bulan) {
  if (bulan < 1) return `${bulan} bulan (sangat pendek)`;
  const tahun = Math.floor(bulan / 12);
  const sisaBulan = bulan % 12;
  if (tahun === 0) return `${sisaBulan} bulan`;
  if (sisaBulan === 0) return `${tahun} tahun`;
  return `${tahun} tahun ${sisaBulan} bulan`;
}

function bangunSaran(diangkat) {
  if (diangkat) {
    return '<p class="result-aside">Setelah diangkat PKWTT, Anda akan mendapat benefit penuh termasuk pesangon progresif jika nanti di-PHK. Cek <a href="pesangon.html">kalkulator pesangon</a> untuk simulasi benefit PKWTT.</p>';
  }
  return '<p class="result-aside">Pertimbangkan untuk meminta diangkat PKWTT setelah kontrak berakhir, agar mendapat benefit penuh (pesangon, JKP, JHT lebih besar).</p>';
}

function bangunPenjelasanTambahan(sisaBulan) {
  if (sisaBulan <= 0) return "";
  return `<p class="result-aside">ℹ️ Tambahan kompensasi dihitung dari sisa kontrak (${formatMasaKerja(sisaBulan)}) × upah. Formula ini estimasi umum PP 35/2021; untuk kasus spesifik, konsultasi ahli hukum atau cek Perjanjian Kerja Bersama (PKB) Anda.</p>`;
}

document.getElementById("form-pkwt").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-pkwt");
  const hasilEl = document.getElementById("hasil-pkwt");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const upah = parseFloat(document.getElementById("upah").value);
  const tglMulai = parseDate(document.getElementById("tanggal-mulai").value);
  const tglAkhirRencana = parseDate(
    document.getElementById("tanggal-akhir-rencana").value,
  );
  const tglAkhirAktual = parseDate(
    document.getElementById("tanggal-akhir-aktual").value,
  );
  const status = document.getElementById("status").value;
  const diangkat = document.getElementById("diangkat-pkwtt").checked;

  if (!upah || upah <= 0) {
    errorEl.textContent = "Mohon isi upah dengan angka lebih dari 0.";
    document.getElementById("upah").setAttribute("aria-invalid", "true");
    document.getElementById("upah").focus();
    return;
  }
  if (!tglMulai) {
    errorEl.textContent = "Mohon isi tanggal mulai kontrak.";
    document
      .getElementById("tanggal-mulai")
      .setAttribute("aria-invalid", "true");
    document.getElementById("tanggal-mulai").focus();
    return;
  }
  if (!tglAkhirRencana) {
    errorEl.textContent = "Mohon isi tanggal akhir rencana.";
    document
      .getElementById("tanggal-akhir-rencana")
      .setAttribute("aria-invalid", "true");
    document.getElementById("tanggal-akhir-rencana").focus();
    return;
  }
  if (!tglAkhirAktual) {
    errorEl.textContent = "Mohon isi tanggal akhir aktual.";
    document
      .getElementById("tanggal-akhir-aktual")
      .setAttribute("aria-invalid", "true");
    document.getElementById("tanggal-akhir-aktual").focus();
    return;
  }
  if (!status) {
    errorEl.textContent = "Mohon pilih status kontrak.";
    document.getElementById("status").setAttribute("aria-invalid", "true");
    document.getElementById("status").focus();
    return;
  }
  if (tglAkhirAktual <= tglMulai) {
    errorEl.textContent = "Tanggal akhir aktual harus setelah tanggal mulai.";
    document
      .getElementById("tanggal-akhir-aktual")
      .setAttribute("aria-invalid", "true");
    document.getElementById("tanggal-akhir-aktual").focus();
    return;
  }
  if (tglAkhirRencana <= tglMulai) {
    errorEl.textContent = "Tanggal akhir rencana harus setelah tanggal mulai.";
    document
      .getElementById("tanggal-akhir-rencana")
      .setAttribute("aria-invalid", "true");
    document.getElementById("tanggal-akhir-rencana").focus();
    return;
  }
  if (status === "diputus_perusahaan" && tglAkhirAktual >= tglAkhirRencana) {
    errorEl.textContent =
      "Untuk status 'diputus perusahaan', tanggal akhir aktual harus sebelum tanggal akhir rencana. Jika PHK di/Setelah tanggal akhir rencana, gunakan status 'Habis sesuai rencana'.";
    document
      .getElementById("tanggal-akhir-aktual")
      .setAttribute("aria-invalid", "true");
    document.getElementById("tanggal-akhir-aktual").focus();
    return;
  }

  const masaKerjaBulan = hitungBulan(tglMulai, tglAkhirAktual);
  const kompensasiNormal = (masaKerjaBulan / 12) * upah;
  let kompensasiTambahan = 0;
  let sisaBulan = 0;
  let barisTambahan = "";

  if (status === "diputus_perusahaan") {
    sisaBulan = hitungBulan(tglAkhirAktual, tglAkhirRencana);
    const sisaTahun = sisaBulan / 12;
    if (sisaTahun > 0) {
      kompensasiTambahan = sisaTahun * upah;
      barisTambahan = `
        <tr><td>Sisa kontrak (diakhiri lebih awal)</td><td>${formatMasaKerja(sisaBulan)}</td><td>—</td></tr>
        <tr><td>Tambahan kompensasi</td><td>${formatMasaKerja(sisaBulan)} × ${formatRupiah(upah)}</td><td>${formatRupiah(kompensasiTambahan)}</td></tr>
      `;
    }
  }

  const total = kompensasiNormal + kompensasiTambahan;
  const labelStatus =
    status === "diputus_perusahaan"
      ? "Diputus perusahaan sebelum habis"
      : "Habis sesuai rencana";
  const penjelasanTambahan =
    status === "diputus_perusahaan" ? bangunPenjelasanTambahan(sisaBulan) : "";
  const saran = bangunSaran(diangkat);

  hasilEl.innerHTML = `
    <h2>Estimasi Kompensasi Anda</h2>
    <p class="big-number">${formatRupiah(total)}</p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>Status</td><td>${labelStatus}</td><td>—</td></tr>
      <tr><td>Masa kerja</td><td>${formatMasaKerja(masaKerjaBulan)}</td><td>—</td></tr>
      <tr><td>Upah dipakai</td><td>Upah bulanan terakhir</td><td>${formatRupiah(upah)}</td></tr>
      <tr><td>Kompensasi normal</td><td>(Masa kerja / 12) × ${formatRupiah(upah)}</td><td>${formatRupiah(kompensasiNormal)}</td></tr>
      ${barisTambahan}
      <tr class="total"><td colspan="2">Total kompensasi</td><td>${formatRupiah(total)}</td></tr>
    </table>
    ${penjelasanTambahan}
    ${saran}
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
