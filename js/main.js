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
// Fungsi untuk menggambar teks multi-baris dan menangani baris baru (\n)
function drawMultilineText(text, x, y, font, color, lineHeight, maxWidth) {
  ctx.font = font;
  ctx.fillStyle = color;

  const paragraphs = String(text || "").split(/\n/);
  let offsetY = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    let currentLine = words[0] || "";

    if (paragraph.trim() === "") {
        offsetY += lineHeight;
        continue;
    }

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
    
    // 1. Gambar Foto (FULL BACKGROUND)
    if (appState.photo) {
        const img = appState.photo;
        const baseScale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const scale = baseScale * appState.zoom;

        const drawW = img.width * scale;
        const drawH = img.height * scale;

        const posX = ((canvas.width - drawW) / 2) + appState.offset.x;
        const posY = ((canvas.height - drawH) / 2) + appState.offset.y;

        ctx.drawImage(img, posX, posY, drawW, drawH);
    }
    
    // 2. Latar belakang (hanya tampil jika tidak ada foto)
    if (!appState.photo) {
        ctx.fillStyle = "#FAF9F6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    

  // 3. Bingkai (Digambar di atas foto/background)
  const frameMargin = 100;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    frameMargin,
    frameMargin,
    canvas.width - frameMargin * 2,
    canvas.height - frameMargin * 2
  );
    
  const margin = 160;
  const quoteBlockYStart = parseInt(quoteYSlider.value, 10);
  let currentY = quoteBlockYStart;
    
    // 4. Latar Belakang Kotak Kutipan (Overlay untuk Readability)
    if (appState.photo) {
        const PADDING = 30;
        const BOX_HEIGHT = 450; 
        const BOX_WIDTH = canvas.width - 2 * margin;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'; // Latar belakang Putih 75% transparan
        ctx.fillRect(
            margin - PADDING, 
            quoteBlockYStart - PADDING,
            BOX_WIDTH + 2 * PADDING,
            BOX_HEIGHT
        );
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
  if (kreditInput.value) {
        ctx.save();
        const kreditY = logoMedsosBottomY > 0 ? logoMedsosBottomY + 50 : canvas.height - 100;
        ctx.translate(canvas.width - 50, kreditY);
        ctx.rotate(Math.PI / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = kreditColorInput.value || '#000000'; 
        ctx.font = 'bold 18px Metropolis';
        ctx.fillText(kreditInput.value, 350, 30);
        ctx.restore();
    }

  // Ikon kutip
  if (ikonKutip.complete && ikonKutip.naturalWidth > 0) {
    const w = 140;
    const h = ikonKutip.naturalHeight * (w / ikonKutip.naturalWidth);
    ctx.drawImage(ikonKutip, margin, currentY - h, w, h);
  }

  currentY += 60;

  // Isi kutipan (Menggunakan drawMultilineText)
  const kutipanText =
    kutipanInput.value ||
    "Isi kutipan. Di sini adalah isi kutipan. Di sini adalah isi kutipan.";

  const kutipanFont = '40pt "DM Serif Display"';
  const kutipanLineHeight = 50;
  const kutipanMaxWidth = canvas.width - margin * 2 - 100;
  
  currentY = drawMultilineText(
    kutipanText,
    margin,
    currentY,
    kutipanFont,
    "#000000",
    kutipanLineHeight,
    kutipanMaxWidth
  );
  
  currentY += 20;

  // Nama (lineHeight lebih rapat antar baris)
  currentY = drawMultilineText(
    namaInput.value || "Nama",
    margin,
    currentY,
    'bold 32px "Proxima Nova"',
    "#000000",
    34,
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
    
    // Pendaftaran Event Listener untuk input teks dan penggeser posisi kutipan (quoteYSlider)
    // Zoom Slider DIHAPUS dari sini agar memiliki listener terpisah
    [kutipanInput, namaInput, jabatanInput, kreditInput, quoteYSlider].forEach(el => {
        el.addEventListener('input', renderTemplate);
    });

    // --- PERBAIKAN: Listener KHUSUS untuk Zoom Slider ---
    zoomSlider.addEventListener("input", (e) => {
        appState.zoom = parseFloat(e.target.value); // Memperbarui appState.zoom
        renderTemplate();
    });
    // ---------------------------------------------------

    // Event change khusus untuk select
    kreditColorInput.addEventListener('change', renderTemplate);
  
    // --- PERBAIKAN: Mencegah Drag Membayang pada Canvas ---
    canvas.addEventListener("dragstart", (e) => {
        e.preventDefault(); 
    });
    // --- AKHIR PERBAIKAN ---

    // Upload foto
    uploadPhotoInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const newImg = new Image();
            newImg.onload = () => {
                appState.photo = newImg;
                // Reset zoom dan offset saat foto baru diunggah
                appState.zoom = 1.0;
                zoomSlider.value = 1.0;
                appState.offset = { x: 0, y: 0 };
                renderTemplate();
            };
            newImg.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Download hasil 
    downloadBtn.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/jpeg", 0.92);
        a.download = "kutipan-jawapos.jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => {
            URL.revokeObjectURL(a.href);
        }, 100);
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
