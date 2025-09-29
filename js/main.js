// --- Elemen DOM ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uploadPhotoInput = document.getElementById('uploadPhoto');
const zoomSlider = document.getElementById('zoomSlider');
const quoteYSlider = document.getElementById('quoteYSlider');
const kutipanInput = document.getElementById('kutipanInput');
const namaInput = document.getElementById('namaInput');
const jabatanInput = document.getElementById('jabatanInput');
const kreditInput = document.getElementById('kreditInput');
const downloadBtn = document.getElementById('download');
const canvasContainer = document.getElementById('canvasContainer');

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
    const paragraphs = String(text || '').split(/\n/);
    for (const paragraph of paragraphs) {
        const words = paragraph.split(' ');
        let currentLine = words[0] || '';
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


// --- FUNGSI RENDER UTAMA ---
function renderTemplate() {
    // Latar belakang utama kanvas (putih)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bingkai digambar terlebih dahulu
    const frameMargin = 100;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.7; 
    ctx.strokeRect(
        frameMargin, 
        frameMargin, 
        canvas.width - frameMargin * 2, 
        canvas.height - frameMargin * 2
    );

    // Foto digambar setelah bingkai, sehingga berada di atasnya
    if (appState.photo) {
        ctx.fillStyle = "#FAF9F6";
        ctx.fillRect(frameMargin, frameMargin, canvas.width - frameMargin * 2, canvas.height - frameMargin * 2);

        const img = appState.photo;
        const baseScale = Math.max((canvas.width - frameMargin*2) / img.width, (canvas.height - frameMargin*2) / img.height);
        const scale = baseScale * appState.zoom;
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const posX = frameMargin + ((canvas.width - frameMargin*2) - drawW) / 2 + appState.offset.x;
        const posY = frameMargin + ((canvas.height - frameMargin*2) - drawH) / 2 + appState.offset.y;
        ctx.drawImage(img, posX, posY, drawW, drawH);
    }
    
    // --- LOGO ---
    if (logoKoranJawaPos.complete && logoKoranJawaPos.naturalWidth > 0) {
        const w = 235;
        const h = 69;
        ctx.drawImage(logoKoranJawaPos, canvas.width - w - 50, 50, w, h);
    }
    
    let logoMedsosBottomY = 0;
    if (logoMedsosVertikal.complete && logoMedsosVertikal.naturalWidth > 0) {
        const baseHeight = 400;
        const scale = 1.8;
        const h = baseHeight * scale; 
        const w = logoMedsosVertikal.naturalWidth * (h / logoMedsosVertikal.naturalHeight);
        
        const x = canvas.width - w - 65;
        const y = 50 + 69 + 8;
        ctx.drawImage(logoMedsosVertikal, x, y, w, h);
        logoMedsosBottomY = y + h;
    }

    if (kreditInput.value) {
        ctx.save();
        const kreditY = logoMedsosBottomY > 0 ? logoMedsosBottomY + 50 : canvas.height - 100;
        ctx.translate(canvas.width - 50, kreditY);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 18px Metropolis';
        ctx.fillText(kreditInput.value, 0, 0);
        ctx.restore();
    }
    
    // --- KONTEN KUTIPAN ---
    const margin = 160;
    let currentY = parseInt(quoteYSlider.value, 10);

    if (ikonKutip.complete && ikonKutip.naturalWidth > 0) {
        const w = 140;
        const h = ikonKutip.naturalHeight * (w / ikonKutip.naturalWidth);
        ctx.drawImage(ikonKutip, margin, currentY - h, w, h);
    }
    currentY += 60;

    const kutipanText = kutipanInput.value || "Isi kutipan. Di sini adalah isi kutipan. Di sini adalah isi kutipan.";
    const kutipanFont = '40pt "DM Serif Display"';
    const kutipanLineHeight = 50;
    const kutipanLines = getWrappedLines(kutipanText, canvas.width - (margin * 2) - 100, kutipanFont);
    ctx.fillStyle = "#000000";
    ctx.font = kutipanFont;
    kutipanLines.forEach((line, index) => {
        ctx.fillText(line, margin, currentY + (index * kutipanLineHeight));
    });
    currentY += kutipanLines.length * kutipanLineHeight;
    currentY += 20;

    ctx.font = 'bold 32px "Proxima Nova"';
    ctx.fillText(namaInput.value || "Nama", margin, currentY);
    currentY += 40;

    ctx.font = 'italic 32px "Proxima Nova"';
    ctx.fillText(jabatanInput.value || "Jabatan", margin, currentY);

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

    uploadPhotoInput.addEventListener('change', (e) => {
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

    zoomSlider.addEventListener('input', (e) => {
        appState.zoom = parseFloat(e.target.value);
        renderTemplate();
    });
    
    downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.92);
        a.download = 'kutipan-jawapos.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    });

    // Drag and Drop Logic
    canvas.addEventListener('mousedown', e => {
        if (!appState.photo) return;
        appState.isDragging = true;
        appState.dragStart = { x: e.clientX, y: e.clientY };
        appState.initialOffset = { x: appState.offset.x, y: appState.offset.y };
        canvasContainer.classList.add('grabbing');
    });

    window.addEventListener('mousemove', e => {
        if (!appState.isDragging) return;
        appState.offset.x = appState.initialOffset.x + (e.clientX - appState.dragStart.x);
        appState.offset.y = appState.initialOffset.y + (e.clientY - appState.dragStart.y);
        renderTemplate();
    });

    window.addEventListener('mouseup', () => {
        appState.isDragging = false;
        canvasContainer.classList.remove('grabbing');
    });
    
    const allAssets = [logoKoranJawaPos, logoJPBiru, ikonKutip, logoMedsosVertikal];
    allAssets.forEach(img => {
        if (img.complete) {
            renderTemplate();
        } else {
            img.onload = renderTemplate;
        }
    });
    
    renderTemplate();
}

// Jalankan aplikasi
initialize();