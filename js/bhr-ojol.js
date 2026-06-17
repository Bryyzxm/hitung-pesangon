// Kalkulator BHR Ojol 2026 per Perpres 27/2026 dan SE Menaker M/1/HK.04.00/III/2026

const BHR_MIN_2026 = 150000;
const BHR_MAX_2026 = 900000;
const PERSENTASE_BHR_2026 = 0.25;
const PERSENTASE_BHR_2025 = 0.2;
const POTONGAN_APLIKATOR = 0.08;
const IURAN_BPJS_PERSEN = 0.0024;

const PLATFORM_LABEL = {
  gojek: "Gojek",
  grab: "Grab",
  shopee: "ShopeeFood / Shopee Express",
  maxim: "Maxim",
  indriver: "InDriver",
  lainnya: "Lainnya",
};

const HARI_LABEL = {
  5: "5 hari/minggu",
  6: "6 hari/minggu",
  7: "7 hari/minggu (full-time)",
  tidak_tentu: "Tidak tentu / paruh waktu",
};

function hitungBHR(pendapatanBruto, bonus, bpjsAktif) {
  const totalBruto = pendapatanBruto + (bonus || 0);
  const rataNetto = totalBruto * (1 - POTONGAN_APLIKATOR);
  let bhr2026 = rataNetto * PERSENTASE_BHR_2026;
  bhr2026 = Math.min(Math.max(bhr2026, BHR_MIN_2026), BHR_MAX_2026);
  const bhr2025 = rataNetto * PERSENTASE_BHR_2025;
  const kenaikan = bhr2026 - bhr2025;
  const iuranBPJS = bpjsAktif ? bhr2026 * IURAN_BPJS_PERSEN : 0;
  const bersihAkhir = bhr2026 - iuranBPJS;
  return { bhr2026, bhr2025, kenaikan, iuranBPJS, bersihAkhir, rataNetto };
}

function bangunPesanWarning(status) {
  if (status === "baru") {
    return '<p class="result-aside">⚠️ Status keaktifan Anda di bawah 3 bulan. BHR mungkin tidak berlaku. Hubungi platform Anda untuk konfirmasi eligibilitas.</p>';
  }
  return "";
}

document.getElementById("form-bhr").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-bhr");
  const hasilEl = document.getElementById("hasil-bhr");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const platform = document.getElementById("platform").value;
  const status = document.getElementById("status").value;
  const pendapatan = parseFloat(document.getElementById("pendapatan").value);
  const hari = document.getElementById("hari").value;
  const bonusRaw = document.getElementById("bonus").value;
  const bonus = bonusRaw ? parseFloat(bonusRaw) : 0;
  const bpjsAktif = document.getElementById("bpjs").checked;

  if (!platform) {
    errorEl.textContent = "Mohon pilih platform.";
    document.getElementById("platform").setAttribute("aria-invalid", "true");
    document.getElementById("platform").focus();
    return;
  }
  if (!status) {
    errorEl.textContent = "Mohon pilih status keaktifan.";
    document.getElementById("status").setAttribute("aria-invalid", "true");
    document.getElementById("status").focus();
    return;
  }
  if (!pendapatan || pendapatan <= 0) {
    errorEl.textContent = "Mohon isi pendapatan dengan angka lebih dari 0.";
    document.getElementById("pendapatan").setAttribute("aria-invalid", "true");
    document.getElementById("pendapatan").focus();
    return;
  }
  if (pendapatan > 50000000) {
    errorEl.textContent =
      "Pendapatan terlalu besar (maks Rp50 juta). Mohon cek ulang.";
    document.getElementById("pendapatan").setAttribute("aria-invalid", "true");
    document.getElementById("pendapatan").focus();
    return;
  }
  if (!hari) {
    errorEl.textContent = "Mohon pilih hari kerja.";
    document.getElementById("hari").setAttribute("aria-invalid", "true");
    document.getElementById("hari").focus();
    return;
  }
  if (bonus < 0) {
    errorEl.textContent = "Bonus tidak boleh negatif.";
    document.getElementById("bonus").setAttribute("aria-invalid", "true");
    document.getElementById("bonus").focus();
    return;
  }

  const { bhr2026, bhr2025, kenaikan, iuranBPJS, bersihAkhir, rataNetto } =
    hitungBHR(pendapatan, bonus, bpjsAktif);
  const warning = bangunPesanWarning(status);

  const barisBPJS = bpjsAktif
    ? `<tr><td>Iuran BPJS Ketenagakerjaan</td><td>~0,24% × BHR</td><td>-${formatRupiah(iuranBPJS)}</td></tr>`
    : "";

  const barisBersih = bpjsAktif
    ? `<tr class="total"><td colspan="2">Diterima setelah BPJS</td><td>${formatRupiah(bersihAkhir)}</td></tr>`
    : "";

  const platformLabel = PLATFORM_LABEL[platform] || platform;
  const hariLabel = HARI_LABEL[hari] || hari;

  hasilEl.innerHTML = `
    <h2>Estimasi BHR Anda</h2>
    <p class="big-number">${formatRupiah(bhr2026)}</p>
    <table>
      <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
      <tr><td>Platform</td><td>${platformLabel}</td><td>—</td></tr>
      <tr><td>Hari kerja</td><td>${hariLabel}</td><td>—</td></tr>
      <tr><td>Pendapatan bruto (rata-rata)</td><td>Bruto + bonus</td><td>${formatRupiah(pendapatan + bonus)}</td></tr>
      <tr><td>Setelah potongan aplikator 8%</td><td>Netto yang dipakai hitung BHR</td><td>${formatRupiah(rataNetto)}</td></tr>
      <tr><td>BHR 2026</td><td>25% × netto (Perpres 27/2026), min ${formatRupiah(BHR_MIN_2026)} maks ${formatRupiah(BHR_MAX_2026)}</td><td>${formatRupiah(bhr2026)}</td></tr>
      <tr><td>Bandingkan BHR 2025 (20%)</td><td>Aturan lama sebelum Perpres 27/2026</td><td>${formatRupiah(bhr2025)}</td></tr>
      <tr><td>Kenaikan BHR 2025 → 2026</td><td>BHR 2026 - BHR 2025</td><td>${formatRupiah(kenaikan)}</td></tr>
      ${barisBPJS}
      ${barisBersih}
    </table>
    ${warning}
    <p class="result-aside">Penyaluran BHR paling lambat H-7 Lebaran. Hubungi platform Anda untuk jadwal pasti. Bekerja juga sebagai karyawan formal? Cek <a href="thr.html">THR reguler</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
