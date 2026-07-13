import base64
img_path = 'assets/certificado_base.png'
js_path = 'assets/certificado_base.js'
with open(img_path, 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(f'const certificadoBase64 = "data:image/png;base64,{b64}";')
