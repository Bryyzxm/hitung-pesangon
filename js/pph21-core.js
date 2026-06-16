// Shared PPh 21 / PTKP utilities
// These are intentional browser globals (no ES modules, no bundler).
// Loaded via <script> tags in pph21.html and gaji-bersih.html.

// Nilai PTKP per tahun (Pasal 8 UU PPh)
const PTKP = {
  "TK/0": 54000000,
  "TK/1": 58500000,
  "TK/2": 63000000,
  "TK/3": 67500000,
  "K/0": 58500000,
  "K/1": 63000000,
  "K/2": 67500000,
  "K/3": 72000000,
};

// Hitung PPh 21 progresif (tarif Pasal 17 UU PPh)
function hitungPPh21(penghasilanKenaPajak) {
  if (penghasilanKenaPajak <= 0) return 0;

  const brackets = [
    { max: 50000000, rate: 0.05 },
    { max: 250000000, rate: 0.1 },
    { max: 500000000, rate: 0.15 },
    { max: 5000000000, rate: 0.25 },
    { max: Infinity, rate: 0.35 },
  ];

  let pajak = 0;
  let sisa = penghasilanKenaPajak;
  let batasSebelumnya = 0;

  for (let i = 0; i < brackets.length; i++) {
    const batas = brackets[i].max;
    const tarif = brackets[i].rate;
    const kenaPajak = Math.min(sisa, batas - batasSebelumnya);
    pajak += kenaPajak * tarif;
    sisa -= kenaPajak;
    batasSebelumnya = batas;
    if (sisa <= 0) break;
  }

  return pajak;
}
