document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('cedula-input');
    const searchBtn = document.getElementById('search-btn');
    const btnText = searchBtn.querySelector('.btn-text');
    const spinner = document.getElementById('search-spinner');
    
    const resultArea = document.getElementById('result-area');
    const successState = document.getElementById('success-state');
    const errorState = document.getElementById('error-state');
    const displayName = document.getElementById('display-name');
    const downloadBtn = document.getElementById('download-btn');
    
    let attendees = [];
    let currentAttendee = null;

    // Load attendees data from global variable (loaded via script tag)
    if (typeof attendeesData !== 'undefined') {
        attendees = attendeesData;
    } else {
        console.error('Error loading attendees data: attendeesData variable not found');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const cedula = normalizeCedula(input.value);
        
        // UI Loading State
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        searchBtn.disabled = true;
        resultArea.classList.add('hidden');
        
        // Simulate slight delay for better UX
        setTimeout(() => {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            searchBtn.disabled = false;
            
            const found = attendees.find(a => a.cedula === cedula);
            
            resultArea.classList.remove('hidden');
            
            if (found) {
                currentAttendee = found;
                displayName.textContent = found.nombre;
                successState.classList.remove('hidden');
                errorState.classList.add('hidden');
            } else {
                currentAttendee = null;
                successState.classList.add('hidden');
                errorState.classList.remove('hidden');
            }
        }, 600);
    });

    downloadBtn.addEventListener('click', async () => {
        if (!currentAttendee) return;
        
        try {
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = 'Generando...';
            downloadBtn.disabled = true;
            
            await generateCertificate(currentAttendee.nombre);
            
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#c9a84c', '#1a2744', '#6b8e23']
            });
            
        } catch (error) {
            console.error('Error generating certificate:', error);
            alert('Hubo un error al generar el certificado. Por favor, intente nuevamente.');
            downloadBtn.disabled = false;
        }
    });

    function normalizeCedula(val) {
        let clean = val.trim();
        if (clean.length === 9) {
            clean = '0' + clean;
        }
        return clean;
    }

async function generateCertificate(name) {
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        
        // Create new document
        const pdfDoc = await PDFDocument.create();
        
        // Dimensions 841.89 x 595.28 points
        const width = 841.89;
        const height = 595.28;
        const page = pdfDoc.addPage([width, height]);
        
        // Use embedded background image data
        if (typeof certificadoBase64 === 'undefined') {
            throw new Error("Base64 image data not found");
        }
        
        // Convert the base64 string safely
        const base64Parts = certificadoBase64.split(',');
        const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
        const binaryString = window.atob(base64Data.trim());
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const imgBytes = bytes.buffer;
        
        const bgImage = await pdfDoc.embedPng(imgBytes);
        
        page.drawImage(bgImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });

        // =========================================================================
        // PARCHE DE SEGURIDAD: Tapamos el nombre "Nicole Abigail" con un bloque blanco
        // =========================================================================
        page.drawRectangle({
            x: 150,                 // Posición horizontal desde la izquierda
            y: 275,                 // Posición vertical desde el fondo
            width: 541,             // Ancho suficiente para tapar todo el nombre
            height: 45,             // Alto exacto del texto anterior
            color: rgb(1, 1, 1),    // Color blanco puro (1, 1, 1) para que sea invisible
        });
        // =========================================================================
        
        // Draw name
        const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const fontSize = 30;
        
        const textWidth = font.widthOfTextAtSize(name, fontSize);
        const xPos = (width - textWidth) / 2;
        const yPos = 295; // From bottom
        
        // Navy blue color #1a2744 (26, 39, 68)
        page.drawText(name, {
            x: xPos,
            y: yPos,
            size: fontSize,
            font: font,
            color: rgb(26/255, 39/255, 68/255),
        });
        
        // Save and download
        const pdfBytes = await pdfDoc.save();
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificado_${name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
