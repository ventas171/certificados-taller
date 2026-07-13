import json
import re
import openpyxl

def process_excel():
    excel_path = r"D:\CERTIFICADOS\ARCHIVOS\LISTA DE ASISTENTES_V2.xlsx"
    json_path = r"D:\ANTIGRAVITY\certificados-taller\data\attendees.json"
    
    wb = openpyxl.load_workbook(excel_path)
    sheet = wb.active
    
    attendees = []
    
    # Assuming columns: NOMBRE Y APELLIDO, CEDULA, CORREO
    # Find column indices
    headers = {cell.value: idx for idx, cell in enumerate(sheet[1])}
    
    name_col = None
    cedula_col = None
    
    for key, idx in headers.items():
        if key:
            key_upper = str(key).upper()
            if "NOMBRE" in key_upper:
                name_col = idx
            elif "CEDULA" in key_upper or "CÉDULA" in key_upper:
                cedula_col = idx
                
    if name_col is None:
        name_col = 0
    if cedula_col is None:
        cedula_col = 1
        
    for row in sheet.iter_rows(min_row=2, values_only=True):
        name = row[name_col]
        cedula = row[cedula_col]
        
        if not name or not cedula:
            continue
            
        name = str(name).strip()
        # Fix encoding issue correctly
        name = name.replace('\ufffd', 'Ñ')
        # Title case
        name = name.title()
        
        cedula = str(cedula).strip()
        if cedula.endswith('.0'):
            cedula = cedula[:-2]
            
        if len(cedula) == 9:
            cedula = '0' + cedula
            
        attendees.append({
            "cedula": cedula,
            "nombre": name
        })
        
    import os
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(attendees, f, ensure_ascii=False, indent=2)
        
    js_path = json_path.replace('.json', '.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write("const attendeesData = ")
        json.dump(attendees, f, ensure_ascii=False, indent=2)
        f.write(";")

if __name__ == "__main__":
    process_excel()
