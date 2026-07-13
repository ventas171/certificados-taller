import fitz  # pymupdf
import os

def prepare_certificate():
    pdf_path = r"D:\CERTIFICADOS\ARCHIVOS\Certificado TALLER SNGR AG.pdf"
    base_image_path = r"D:\ANTIGRAVITY\certificados-taller\assets\certificado_base.png"
    logo_path = r"D:\ANTIGRAVITY\certificados-taller\assets\logo.png"
    
    os.makedirs(os.path.dirname(base_image_path), exist_ok=True)
    
    doc = fitz.open(pdf_path)
    page = doc[0]
    
    # Text block is approx [182, 227, 645, 312] in PDF coordinates
    # We want to white out this area
    rect = fitz.Rect(182, 227, 645, 312)
    page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
    
    # Render at 300 DPI
    pix = page.get_pixmap(dpi=300)
    pix.save(base_image_path)
    
    # Extract logo (approximate top area)
    logo_rect = fitz.Rect(350, 20, 500, 100) # Adjust coordinates for the logo
    logo_pix = page.get_pixmap(dpi=300, clip=logo_rect)
    logo_pix.save(logo_path)

if __name__ == "__main__":
    prepare_certificate()
