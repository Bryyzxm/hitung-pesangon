// Kalkulator "Berapa Lama Uang Saya Bertahan?"

document.getElementById("form-burn").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = this;
  const errorEl = document.getElementById("error-burn");
  const hasilEl = document.getElementById("hasil-burn");
  errorEl.textContent = "";
  hasilEl.classList.add("hidden");
  form.querySelectorAll("[aria-invalid]").forEach(function (el) {
    el.removeAttribute("aria-invalid");
  });

  const dana = parseFloat(document.getElementById("dana").value);
  const pos = {
    "Sewa / cicilan tempat tinggal":
      parseFloat(document.getElementById("hunian").value) || 0,
    "Makan & kebutuhan pokok":
      parseFloat(document.getElementById("makan").value) || 0,
    "Transportasi & komunikasi":
      parseFloat(document.getElementById("transport").value) || 0,
    "Cicilan utang": parseFloat(document.getElementById("cicilan").value) || 0,
    Lainnya: parseFloat(document.getElementById("lainnya").value) || 0,
  };

  if (!dana || dana <= 0) {
    errorEl.textContent = "Mohon isi total dana dengan angka lebih dari 0.";
    document.getElementById("dana").setAttribute("aria-invalid", "true");
    document.getElementById("dana").focus();
    return;
  }
  if (
    Object.values(pos).some(function (v) {
      return v < 0;
    })
  ) {
    errorEl.textContent = "Pengeluaran tidak boleh negatif.";
    document.getElementById("hunian").setAttribute("aria-invalid", "true");
    document.getElementById("hunian").focus();
    return;
  }

  const totalPengeluaran = Object.values(pos).reduce(function (a, b) {
    return a + b;
  }, 0);
  if (totalPengeluaran <= 0) {
    errorEl.textContent = "Mohon isi minimal satu pos pengeluaran.";
    document.getElementById("hunian").setAttribute("aria-invalid", "true");
    document.getElementById("hunian").focus();
    return;
  }

  const bulanBertahan = dana / totalPengeluaran;
  const bulanBulat = Math.floor(bulanBertahan);
  const sisaHari = Math.round((bulanBertahan - bulanBulat) * 30);

  // Indikator: target dana darurat 6 bulan
  const persen = Math.min((bulanBertahan / 6) * 100, 100);
  let kelasMeter = "";
  let pesan = "";
  if (bulanBertahan >= 6) {
    pesan =
      "Posisi Anda relatif aman (di atas standar 6 bulan dana darurat). Tetap bijak mengelola pengeluaran.";
  } else if (bulanBertahan >= 3) {
    kelasMeter = "warn";
    pesan =
      "Cukup untuk jangka pendek, namun di bawah standar 6 bulan. Mulai pangkas pengeluaran tidak esensial.";
  } else {
    kelasMeter = "danger";
    pesan =
      "Daya tahan Anda terbatas. Prioritaskan kebutuhan pokok dan segera cari sumber penghasilan tambahan.";
  }

  // Saran penghematan: urutkan pos terbesar (selain makan pokok)
  const saran = Object.entries(pos)
    .filter(function (p) {
      return p[1] > 0 && p[0] !== "Makan & kebutuhan pokok";
    })
    .sort(function (a, b) {
      return b[1] - a[1];
    })
    .slice(0, 3)
    .map(function (p) {
      const hemat10 = p[1] * 0.1;
      const bulanBaru = dana / (totalPengeluaran - hemat10);
      const tambahan = bulanBaru - bulanBertahan;
      return (
        "<li>Hemat 10% di <strong>" +
        p[0] +
        "</strong> (" +
        formatRupiah(hemat10) +
        "/bln) menambah daya tahan ±" +
        tambahan.toFixed(1) +
        " bulan.</li>"
      );
    })
    .join("");

  hasilEl.innerHTML = `
    <h2>Hasil Perhitungan</h2>
    <p class="big-number">${bulanBulat} bulan ${sisaHari} hari</p>
    <div class="meter ${kelasMeter}"><div style="width:${persen}%"></div></div>
    <p>${pesan}</p>
    <p class="result-note">Total pengeluaran bulanan: <strong>${formatRupiah(totalPengeluaran)}</strong></p>
    ${saran ? '<ul class="suggestions">' + saran + "</ul>" : ""}
    <p class="result-aside">Belum menghitung hak PHK Anda? Mulai dari <a href="pesangon.html">Kalkulator Pesangon</a>.</p>
  `;
  hasilEl.classList.remove("hidden");
  hasilEl.focus();
  hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
});
