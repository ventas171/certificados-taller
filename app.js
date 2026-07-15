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
        
        // Crear nuevo documento
        const pdfDoc = await PDFDocument.create();
        
        // Dimensiones del certificado
        const width = 841.89;
        const height = 595.28;
        const page = pdfDoc.addPage([width, height]);
        
        if (typeof certificadoBase64 === 'undefined') {
            throw new Error("Base64 image data not found");
        }
        
        // MÉTODO OPTIMIZADO: Convierte el Base64 de forma segura y limpia en internet
        const base64Data = certificadoBase64.split(',')[1];
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Incrustar la imagen PNG usando los bytes limpios
        const bgImage = await pdfDoc.embedPng(bytes.buffer);
        
        page.drawImage(bgImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });
        
        // Configuración del texto del nombre
        const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const fontSize = 30;
        
        const textWidth = font.widthOfTextAtSize(name, fontSize);
        const xPos = (width - textWidth) / 2;
        const yPos = 295; 
        
        page.drawText(name, {
            x: xPos,
            y: yPos,
            size: fontSize,
            font: font,
            color: rgb(26/255, 39/255, 68/255),
        });
        
        // Guardar y descargar automáticamente
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
