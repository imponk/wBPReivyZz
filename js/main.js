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
// Pastikan path ke aset (logo) sudah benar
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
    
    // Hapus konten Canvas sebelumnya
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    const frameMargin = 100;
    
    // 1. LAPISAN 1 (PALING BAWAH): Latar belakang kanvas 
    ctx.fillStyle = "#FAF9F6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ******************************************************
    // *** 2. LAPISAN 2: BINGKAI KOTAK HITAM (Garis Tepi) ***
    // ******************************************************
    const lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(
        frameMargin,
        frameMargin,
        canvas.width - frameMargin * 2,
        canvas.height - frameMargin * 2
    );
    // ******************************************************

    // ******************************************************
    // *** 3. LAPISAN 3: Gambar Foto (DIBATASI OLEH BINGKAI) ***
    // ******************************************************
    if (appState.photo) {
        ctx.save(); // Simpan konteks sebelum clipping

        // Tentukan area clipping: Masuk ke dalam garis bingkai (setengah lineWidth)
        const frameX = frameMargin + lineWidth / 2;
        const frameY = frameMargin + lineWidth / 2;
        const frameW = canvas.width - frameMargin * 2 - lineWidth; // 880 - 1 = 879
        const frameH = canvas.height - frameMargin * 2 - lineWidth; // 880 - 1 = 879
        
        ctx.beginPath();
        ctx.rect(frameX, frameY, frameW, frameH);
        ctx.clip(); // Terapkan clipping mask

        const img = appState.photo;
        
        // Hitung skala baru (didasarkan pada FRAME area)
        const baseScale = Math.max(frameW / img.width, frameH / img.height); 
        const scale = baseScale * appState.zoom; 
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        
        // Hitung posisi baru (didasarkan pada FRAME area, ditambahkan offset bingkai)
        const posX = frameX + ((frameW - drawW) / 2) + appState.offset.x;
        const posY = frameY + ((frameH - drawH) / 2) + appState.offset.y;

        if (!isNaN(posX) && !isNaN(posY) && !isNaN(drawW) && !isNaN(drawH)) {
            ctx.drawImage(img, posX, posY, drawW, drawH);
        }
        
        ctx.restore(); // Kembalikan konteks
    }
    // ******************************************************
    
    // --- Inisialisasi posisi teks/logo ---
  const margin = 160;
  const quoteBlockYStart = parseInt(quoteYSlider.value, 10);
  let currentY = quoteBlockYStart;
    
    // 4. LAPISAN 4 (PALING ATAS): Konten Teks dan Logo

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

  // Kredit Foto (diputar)
  if (kreditInput.value) {
        ctx.save();
        const kreditY = logoMedsosBottomY > 0 ? logoMedsosBottomY + 50 : canvas.height - 100;
        ctx.translate(canvas.width - 50, kreditY);
        ctx.rotate(Math.PI / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = kreditColorInput.value || '#000000'; 
        ctx.font = 'bold 18px "Proxima Nova"'; 
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

  // Isi kutipan 
  const kutipanText = kutipanInput.value || "Isi kutipan. Di sini adalah isi kutipan. Di sini adalah isi kutipan.";

  const kutipanFont = '40pt "DM Serif Display"';
  const kutipanLineHeight = 50;
  const kutipanMaxWidth = canvas.width - margin * 2 - 100;
  
  currentY = drawMultilineText(kutipanText, margin, currentY, kutipanFont, "#000000", kutipanLineHeight, kutipanMaxWidth);
  currentY += 20;

  // Nama 
  currentY = drawMultilineText(namaInput.value || "Nama", margin, currentY, 'bold 32px "Proxima Nova"', "#000000", 34, canvas.width - margin * 4);
  currentY += 6;

  // Jabatan 
  currentY = drawMultilineText(jabatanInput.value || "Jabatan", margin, currentY, 'italic 28px "Proxima Nova"', "#333333", 30, canvas.width - margin * 4);

  // Logo bawah kiri
  if (logoJPBiru.complete && logoJPBiru.naturalWidth > 0) {
    const w = 95;
    const h = 95;
    ctx.drawImage(logoJPBiru, 0, canvas.height - h, w, h);
  }
}

// --- EVENT LISTENERS ---
function initialize() {
    
    // Pendaftaran Event Listener untuk input teks, slider, dan select
    [kutipanInput, namaInput, jabatanInput, kreditInput, kreditColorInput, zoomSlider, quoteYSlider].forEach(el => {
        el.addEventListener('input', renderTemplate);
        el.addEventListener('change', renderTemplate);
    });
    
    // Upload foto
    uploadPhotoInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const newImg = new Image();
            newImg.onload = () => {
                appState.photo = newImg;
                // Reset zoom & offset
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

    // Drag foto (Mouse Down, Move, Up) - Logika Dragging
    canvas.addEventListener("mousedown", (e) => {
        e.preventDefault(); 
        if (!appState.photo) return;
        appState.isDragging = true;
        appState.dragStart = { x: e.clientX, y: e.clientY };
        appState.initialOffset = { x: appState.offset.x, y: appState.offset.y };
        canvasContainer.classList.add("grabbing");
    });

    window.addEventListener("mousemove", (e) => {
        if (!appState.isDragging) return;
        appState.offset.x = appState.initialOffset.x + (e.clientX - appState.dragStart.x);
        appState.offset.y = appState.initialOffset.y + (e.clientY - appState.dragStart.y);
        renderTemplate();
    });

    window.addEventListener("mouseup", () => {
        appState.isDragging = false;
        canvasContainer.classList.remove("grabbing");
    });

    // Pastikan semua aset diload
    const allAssets = [logoKoranJawaPos, logoJPBiru, ikonKutip, logoMedsosVertikal];
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
