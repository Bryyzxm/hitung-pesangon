// Simulasi Dana Pensiun (Compound Interest + Inflation)

const LAMA_PENSIUN = 20; // asumsi 20 tahun masa pensiun

document
  .getElementById("form-pensiun")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const form = this;
    const errorEl = document.getElementById("error-pensiun");
    const hasilEl = document.getElementById("hasil-pensiun");
    errorEl.textContent = "";
    hasilEl.classList.add("hidden");
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });

    const usiaSekarang = parseInt(
      document.getElementById("usia-sekarang").value,
      10,
    );
    const usiaPensiun = parseInt(
      document.getElementById("usia-pensiun").value,
      10,
    );
    const pengeluaran = parseFloat(
      document.getElementById("pengeluaran").value,
    );
    const tabungan = parseFloat(document.getElementById("tabungan").value) || 0;
    const kontribusi =
      parseFloat(document.getElementById("kontribusi").value) || 0;
    const inflasi = parseFloat(document.getElementById("inflasi").value) || 0;
    const returnInvestasi =
      parseFloat(document.getElementById("return-investasi").value) || 0;

    if (!usiaSekarang || usiaSekarang < 18) {
      errorEl.textContent = "Usia saat ini minimal 18 tahun.";
      document
        .getElementById("usia-sekarang")
        .setAttribute("aria-invalid", "true");
      document.getElementById("usia-sekarang").focus();
      return;
    }
    if (!usiaPensiun || usiaPensiun <= usiaSekarang) {
      errorEl.textContent =
        "Usia pensiun harus lebih besar dari usia saat ini.";
      document
        .getElementById("usia-pensiun")
        .setAttribute("aria-invalid", "true");
      document.getElementById("usia-pensiun").focus();
      return;
    }
    if (!pengeluaran || pengeluaran <= 0) {
      errorEl.textContent = "Mohon isi pengeluaran bulanan.";
      document
        .getElementById("pengeluaran")
        .setAttribute("aria-invalid", "true");
      document.getElementById("pengeluaran").focus();
      return;
    }

    const tahunTersisa = usiaPensiun - usiaSekarang;
    const inflasiDesimal = inflasi / 100;
    const returnDesimal = returnInvestasi / 100;

    // Pengeluaran bulanan saat pensiun (menyesuaikan inflasi)
    const pengeluaranPensiun =
      pengeluaran * Math.pow(1 + inflasiDesimal, tahunTersisa);

    // Total yang dibutuhkan untuk 20 tahun masa pensiun
    const totalDibutuhkan = pengeluaranPensiun * 12 * LAMA_PENSIUN;

    // Future value tabungan saat ini
    const fvTabungan = tabungan * Math.pow(1 + returnDesimal, tahunTersisa);

    // Future value kontribusi bulanan (annuity)
    let fvKontribusi = 0;
    if (kontribusi > 0 && returnDesimal > 0) {
      const bulanTersisa = tahunTersisa * 12;
      const returnBulanan = returnDesimal / 12;
      fvKontribusi =
        kontribusi *
        ((Math.pow(1 + returnBulanan, bulanTersisa) - 1) / returnBulanan);
    } else if (kontribusi > 0) {
      fvKontribusi = kontribusi * 12 * tahunTersisa;
    }

    const totalDana = fvTabungan + fvKontribusi;
    const surplus = totalDana - totalDibutuhkan;
    const persen = Math.min((totalDana / totalDibutuhkan) * 100, 100);
    let kelasMeter = "";
    if (persen >= 100) {
      /* hijau */
    } else if (persen >= 60) {
      kelasMeter = "warn";
    } else {
      kelasMeter = "danger";
    }

    // Saran: berapa kontribusi bulanan tambahan jika defisit
    let saran = "";
    if (surplus < 0) {
      const sisaDefisit = Math.abs(surplus);
      // Hitung kontribusi tambahan yang dibutuhkan (annuity formula reversed)
      const bulanTersisaAn = tahunTersisa * 12;
      if (returnDesimal > 0) {
        const returnBln = returnDesimal / 12;
        const annuityFactor =
          (Math.pow(1 + returnBln, bulanTersisaAn) - 1) / returnBln;
        const tambahanPerBulan = Math.ceil(sisaDefisit / annuityFactor);
        saran = `<p class="result-note">Untuk mencapai target: tambahkan kontribusi bulanan sebesar <strong>${formatRupiah(tambahanPerBulan)}/bulan</strong>.</p>`;
      } else {
        const tambahanBulan = Math.ceil(sisaDefisit / bulanTersisaAn);
        saran = `<p class="result-note">Untuk mencapai target: tambahkan kontribusi bulanan sebesar <strong>${formatRupiah(tambahanBulan)}/bulan</strong>.</p>`;
      }
    }

    hasilEl.innerHTML = `
    <h2>Hasil Simulasi Pensiun</h2>
    <p class="big-number ${surplus >= 0 ? "result-success" : "result-danger"}">${surplus >= 0 ? "Surplus" : "Defisit"}: ${formatRupiah(Math.abs(surplus))}</p>
    <div class="meter ${kelasMeter}"><div style="width:${persen}%"></div></div>
    <table>
      <tr><th>Komponen</th><th>Nilai</th></tr>
      <tr><td>Tahun tersisa hingga pensiun</td><td>${tahunTersisa} tahun</td></tr>
      <tr><td>Pengeluaran saat pensiun/bulan</td><td>${formatRupiah(pengeluaranPensiun)}</td></tr>
      <tr><td>Total dibutuhkan (20 tahun)</td><td>${formatRupiah(totalDibutuhkan)}</td></tr>
      <tr><td>Tabungan saat ini → future value</td><td>${formatRupiah(fvTabungan)}</td></tr>
      <tr><td>Kontribusi bulanan → future value</td><td>${formatRupiah(fvKontribusi)}</td></tr>
      <tr class="total"><td>Total dana pensiun terkumpul</td><td>${formatRupiah(totalDana)}</td></tr>
    </table>
    ${saran}
    <p class="result-aside">Jangan lupa siapkan juga <a href="dana-darurat.html">dana darurat</a> sebelum berinvestasi untuk pensiun.</p>
  `;
    hasilEl.classList.remove("hidden");
    hasilEl.focus();
    hasilEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
