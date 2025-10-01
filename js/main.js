// --- Elemen DOM ---
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const uploadPhotoInput = document.getElementById("uploadPhoto");
const zoomSlider = document.getElementById("zoomSlider");
const quoteYSlider = document.getElementById("quoteYSlider");

const kutipanInput = document.getElementById("kutipanInput");
const namaInput = document.getElementById("namaInput");
const jabatanInput = document.getElementById("jabatanInput");
const kreditInput = document.getElementById("kreditInput");
const kreditColorInput = document.getElementById('kreditColor');

const downloadBtn = document.getElementById("download");
const canvasContainer = document.getElementById("canvasContainer");

// --- Aset & State ---
const logoKoranJawaPos = new Image();
logoKoranJawaPos.src = "assets/jawapos-kanan.svg";

const logoJPBiru = new Image();
logoJPBiru.src = "assets/logo-bawah.svg";

const ikonKutip = new Image();
ikonKutip.src = "assets/kutipan-quote.svg";

const logoMedsosVertikal = new Image();
logoMedsosVertikal.src = "assets/medsos-vertikal.svg";

const appState = {
  photo: null,
  zoom: 1.0,
  offset: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  initialOffset: { x: 0, y: 0 },
};

// --- Fungsi Bantuan ---
function getWrappedLines(text, maxWidth, font) {
  ctx.font = font;
  const lines = [];
  const paragraphs = String(text || "").split(/\n/);

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;

      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
  }

  return lines;
}

function drawMultilineText(text, x, y, font, color, lineHeight, maxWidth) {
  ctx.font = font;
  ctx.fillStyle = color;

  const paragraphs = String(text || "").split(/\n/);
  let offsetY = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + " " + word;

      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        ctx.fillText(currentLine, x, y + offsetY);
        offsetY += lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    ctx.fillText(currentLine, x, y + offsetY);
    offsetY += lineHeight;
  }

  return y + offsetY;
}

// --- FUNGSI RENDER UTAMA ---
function renderTemplate() {
  // Latar belakang
  ctx.fillStyle = "#FAF9F6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bingkai
  const frameMargin = 100;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    frameMargin,
    frameMargin,
    canvas.width - frameMargin * 2,
    canvas.height - frameMargin * 2
  );

  // Foto
  if (appState.photo) {
    ctx.fillStyle = "#FAF9F6";
    ctx.fillRect(
      frameMargin,
      frameMargin,
      canvas.width - frameMargin * 2,
      canvas.height - frameMargin * 2
    );

    const img = appState.photo;
    const baseScale = Math.max(
      (canvas.width - frameMargin * 2) / img.width,
      (canvas.height - frameMargin * 2) / img.height
    );
    const scale = baseScale * appState.zoom;

    const drawW = img.width * scale;
    const drawH = img.height * scale;

    const posX =
      frameMargin +
      ((canvas.width - frameMargin * 2) - drawW) / 2 +
      appState.offset.x;

    const posY =
      frameMargin +
      ((canvas.height - frameMargin * 2) - drawH) / 2 +
      appState.offset.y;

    ctx.drawImage(img, posX, posY, drawW, drawH);
  }

  // Logo kanan atas
  if (logoKoranJawaPos.complete && logoKoranJawaPos.naturalWidth > 0) {
    const w = 235;
    const h = 69;
    ctx.drawImage(logoKoranJawaPos, canvas.width - w - 50, 50, w, h);
  }

  // Logo medsos vertikal
  let logoMedsosBottomY = 0;
  if (logoMedsosVertikal.complete && logoMedsosVertikal.naturalWidth > 0) {
    const baseHeight = 400;
    const scale = 1.8;
    const h = baseHeight * scale;
    const w =
      logoMedsosVertikal.naturalWidth *
      (h / logoMedsosVertikal.naturalHeight);

    const x = canvas.width - w - 65;
    const y = 50 + 69 + 8;

    ctx.drawImage(logoMedsosVertikal, x, y, w, h);
    logoMedsosBottomY = y + h;
  }

  // Kredit Foto
  const kreditColorInput = document.getElementById('kreditColor');

  if (kreditInput.value) {
  ctx.save();
  const kreditY = logoMedsosBottomY > 0 ? logoMedsosBottomY + 50 : canvas.height - 100;
  ctx.translate(canvas.width - 50, kreditY);
  ctx.rotate(-Math.PI / -2);
  ctx.textAlign = 'right';
  ctx.fillStyle = kreditColorInput.value || '#000000'; // hitam / putih
  ctx.font = 'bold 18px Metropolis';
  ctx.fillText(kreditInput.value, 350, 30);
  ctx.restore();
}

[kutipanInput, namaInput, jabatanInput, kreditInput, kreditColorInput, quoteYSlider]
  .forEach(el => {
    el.addEventListener('input', renderTemplate);
    el.addEventListener('change', renderTemplate); // untuk select
  });

  // --- KONTEN KUTIPAN ---
  const margin = 160;
  let currentY = parseInt(quoteYSlider.value, 10);

  // Ikon kutip
  if (ikonKutip.complete && ikonKutip.naturalWidth > 0) {
    const w = 140;
    const h = ikonKutip.naturalHeight * (w / ikonKutip.naturalWidth);
    ctx.drawImage(ikonKutip, margin, currentY - h, w, h);
  }

  currentY += 60;

  // Isi kutipan
  const kutipanText =
    kutipanInput.value ||
    "Isi kutipan. Di sini adalah isi kutipan. Di sini adalah isi kutipan.";

  const kutipanFont = '40pt "DM Serif Display"';
  const kutipanLineHeight = 50;

  const kutipanLines = getWrappedLines(
    kutipanText,
    canvas.width - margin * 2 - 100,
    kutipanFont
  );

  ctx.fillStyle = "#000000";
  ctx.font = kutipanFont;

  kutipanLines.forEach((line, index) => {
    ctx.fillText(line, margin, currentY + index * kutipanLineHeight);
  });

  currentY += kutipanLines.length * kutipanLineHeight;
  currentY += 20;

  // Nama (lineHeight lebih rapat antar baris)
  currentY = drawMultilineText(
    namaInput.value || "Nama",
    margin,
    currentY,
    'bold 32px "Proxima Nova"',
    "#000000",
    34, // rapat tapi tetap terbaca
    canvas.width - margin * 4
  );

  // Jarak antar blok
  currentY += 6;

  // Jabatan (lineHeight rapat)
  currentY = drawMultilineText(
    jabatanInput.value || "Jabatan",
    margin,
    currentY,
    'italic 28px "Proxima Nova"',
    "#333333",
    30,
    canvas.width - margin * 4
  );

  // Logo bawah kiri
  if (logoJPBiru.complete && logoJPBiru.naturalWidth > 0) {
    const w = 95;
    const h = 95;
    ctx.drawImage(logoJPBiru, 0, canvas.height - h, w, h);
  }
}

// --- EVENT LISTENERS ---
function initialize() {
  [kutipanInput, namaInput, jabatanInput, kreditInput, quoteYSlider].forEach(el => {
    el.addEventListener('input', renderTemplate);
  });

  // tambahan untuk dropdown warna kredit
  kreditColorInput.addEventListener('change', renderTemplate);
  
  // ... sisanya tetap
}

  // Upload foto
  uploadPhotoInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const newImg = new Image();
      newImg.onload = () => {
        appState.photo = newImg;
        renderTemplate();
      };
      newImg.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Zoom foto
  zoomSlider.addEventListener("input", (e) => {
    appState.zoom = parseFloat(e.target.value);
    renderTemplate();
  });

  // Download hasil
  downloadBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.download = "kutipan-jawapos.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  // Drag foto
  canvas.addEventListener("mousedown", (e) => {
    if (!appState.photo) return;
    appState.isDragging = true;
    appState.dragStart = { x: e.clientX, y: e.clientY };
    appState.initialOffset = {
      x: appState.offset.x,
      y: appState.offset.y,
    };
    canvasContainer.classList.add("grabbing");
  });

  window.addEventListener("mousemove", (e) => {
    if (!appState.isDragging) return;
    appState.offset.x =
      appState.initialOffset.x + (e.clientX - appState.dragStart.x);
    appState.offset.y =
      appState.initialOffset.y + (e.clientY - appState.dragStart.y);
    renderTemplate();
  });

  window.addEventListener("mouseup", () => {
    appState.isDragging = false;
    canvasContainer.classList.remove("grabbing");
  });

  // Pastikan semua aset diload
  const allAssets = [
    logoKoranJawaPos,
    logoJPBiru,
    ikonKutip,
    logoMedsosVertikal,
  ];

  allAssets.forEach((img) => {
    if (img.complete) {
      renderTemplate();
    } else {
      img.onload = renderTemplate;
    }
  });

  renderTemplate();
}

// --- Jalankan Aplikasi ---
initialize();
