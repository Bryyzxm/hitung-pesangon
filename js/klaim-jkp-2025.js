// Kalkulator Klaim JKP 2025 per PP 6/2025 dan Permenaker 2/2025

const BATAS_UPAH_JKP = 5000000;
const DURASI_KLAIM_BULAN = 6;

const SEBAB_TIDAK_ELIGIBLE = ["resign", "pensiun", "pkwt_habis_normal"];

function cekIuranMemenuhi(lamaIuran) {
  if (lamaIuran === "lt_6" || lamaIuran === "6_12") return false;
  return true;
}

function cekEligibilitas(status, sebab, lamaIuran) {
  if (SEBAB_TIDAK_ELIGIBLE.includes(sebab)) {
    return {
      eligible: false,
      alasan:
        "Sebab PHK tidak memenuhi syarat (resign/pensiun/kontrak habis normal).",
    };
  }
  if (!cekIuranMemenuhi(lamaIuran)) {
    return {
      eligible: false,
      alasan:
        "Syarat iuran minimal 12 bulan dalam 24 bulan terakhir tidak terpenuhi.",
    };
  }
  if (status === "pkwtt") {
    return {
      eligible: true,
      alasan: "PKWTT dengan sebab PHK oleh perusahaan dan iuran ≥12 bulan.",
    };
  }
  if (status === "pkwt" && sebab === "pkwt_diakhiri_perusahaan") {
    return {
      eligible: true,
      alasan:
        "PKWT dengan kontrak diakhiri perusahaan sebelum habis dan iuran ≥12 bulan.",
    };
  }
  return {
    eligible: false,
    alasan: "Kombinasi status pekerjaan dan sebab PHK tidak memenuhi syarat.",
  };
}

function hitungSisaWaktuKlaim(tanggalPhk) {
  if (!tanggalPhk) return null;
  const phk = new Date(tanggalPhk);
  if (Number.isNaN(phk.getTime())) return null;
  const deadline = new Date(phk);
  deadline.setMonth(deadline.getMonth() + DURASI_KLAIM_BULAN);
  const now = new Date();
  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

const DOKUMEN_KLAIM = [
  "KTP pekerja",
  "Kartu peserta BPJS Ketenagakerjaan (digital via JMO)",
  "Surat Perjanjian Bersama / Keputusan PHK dari perusahaan",
  "Laporan kehilangan pekerjaan yang dilaporkan ke Disnaker",
  "Bukti upah terakhir (slip gaji / laporan BPJS)",
  "Rekening bank aktif atas nama pekerja",
];

function formatSisaHari(hari) {
  if (hari === null) return "";
  if (hari === 0)
    return "<strong>Sudah lewat.</strong> Klaim JKP sudah tidak bisa diajukan untuk tanggal PHK ini.";
  if (hari === 1) return "Sisa <strong>1 hari</strong> untuk mengajukan klaim.";
  return `Sisa <strong>${hari} hari</strong> untuk mengajukan klaim.`;
}

document
  .getElementById("form-klaim-jkp")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const form = this;
    const errorEl = document.getElementById("error-klaim-jkp");
    const hasilEl = document.getElementById("hasil-klaim-jkp");
    errorEl.textContent = "";
    hasilEl.classList.add("hidden");
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });

    const upah = parseFloat(document.getElementById("upah").value);
    const status = document.getElementById("status-pekerjaan").value;
    const sebab = document.getElementById("sebab-phk").value;
    const lamaIuran = document.getElementById("lama-iuran").value;
    const tanggalPhk = document.getElementById("tanggal-phk").value;

    if (!upah || upah <= 0) {
      errorEl.textContent = "Mohon isi upah dengan angka lebih dari 0.";
      document.getElementById("upah").setAttribute("aria-invalid", "true");
      document.getElementById("upah").focus();
      return;
    }
    if (!status) {
      errorEl.textContent = "Mohon pilih status pekerjaan.";
      document
        .getElementById("status-pekerjaan")
        .setAttribute("aria-invalid", "true");
      document.getElementById("status-pekerjaan").focus();
      return;
    }
    if (!sebab) {
      errorEl.textContent = "Mohon pilih sebab PHK.";
      document.getElementById("sebab-phk").setAttribute("aria-invalid", "true");
      document.getElementById("sebab-phk").focus();
      return;
    }
    if (!lamaIuran) {
      errorEl.textContent = "Mohon pilih lama iuran BPJS.";
      document
        .getElementById("lama-iuran")
        .setAttribute("aria-invalid", "true");
      document.getElementById("lama-iuran").focus();
      return;
    }

    const eligibility = cekEligibilitas(status, sebab, lamaIuran);
    const statusBadge = eligibility.eligible
      ? '<span style="color:#1a6b54;font-weight:700">ELIGIBLE</span>'
      : '<span style="color:#b00020;font-weight:700">TIDAK ELIGIBLE</span>';

    const upahJKP = Math.min(upah, BATAS_UPAH_JKP);
    const jkpBulanan = 0.6 * upahJKP;
    const totalJKP = jkpBulanan * DURASI_KLAIM_BULAN;
    const sisaHari = hitungSisaWaktuKlaim(tanggalPhk);

    const estimasiSection = eligibility.eligible
      ? `
      <p class="big-number">${formatRupiah(totalJKP)}</p>
      <table>
        <tr><th>Komponen</th><th>Rincian</th><th>Jumlah</th></tr>
        <tr><td>Upah dipakai (maks Rp5jt)</td><td>Upah terakhir: ${formatRupiah(upah)}</td><td>${formatRupiah(upahJKP)}</td></tr>
        <tr><td>JKP per bulan</td><td>60% × ${formatRupiah(upahJKP)}</td><td>${formatRupiah(jkpBulanan)} / bln</td></tr>
        <tr class="total"><td colspan="2">Total JKP (6 bulan)</td><td>${formatRupiah(totalJKP)}</td></tr>
      </table>
    `
      : `
      <p>Tidak ada estimasi karena Anda tidak memenuhi syarat klaim JKP. Lihat
      <a href="pesangon.html">kalkulator pesangon</a> untuk menghitung hak
      lain saat PHK (UP, UPMK, UPH) sesuai PP 35/2021.</p>
    `;

    const sisaWaktuSection =
      sisaHari !== null ? `<p>${formatSisaHari(sisaHari)}</p>` : "";

    const dokumenList = DOKUMEN_KLAIM.map(function (d) {
      return "<li>" + d + "</li>";
    }).join("");

    hasilEl.innerHTML = `
    <h2>Hasil Cek Kelayakan</h2>
    <p>Status: ${statusBadge}</p>
    <p>${eligibility.alasan}</p>
    ${estimasiSection}
    ${sisaWaktuSection}
    <h3>Dokumen yang perlu disiapkan</h3>
    <ul>${dokumenList}</ul>
    <p class="result-aside">Ajukan klaim melalui aplikasi
      <a href="https://www.bpjsketenagakerjaan.go.id/" target="_blank" rel="noopener">JMO BPJS Ketenagakerjaan</a>
      atau kantor cabang terdekat.</p>
    <p class="result-aside">Sudah tahu estimasi dana Anda? Cek
      <a href="burn-rate.html">berapa lama uang Anda bisa bertahan</a> pasca-PHK.</p>
  `;
    hasilEl.classList.remove("hidden");
    hasilEl.focus();
    hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
