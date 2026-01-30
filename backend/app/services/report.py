from fpdf import FPDF
import os

# 1. Get the absolute path to THIS file (report.py)
current_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Construct potential paths to the font file
# We are currently in backend/app/services/
# venv is at backend/venv/
POSSIBLE_FONT_PATHS = [
    os.path.join(current_dir, 'DejaVuSans.ttf'),
    # Go up two levels to reach 'backend'
    os.path.join(os.path.dirname(os.path.dirname(current_dir)), 'venv', 'Lib', 'site-packages', 'matplotlib', 'mpl-data', 'fonts', 'ttf', 'DejaVuSans.ttf'),
    # Try an absolute path style if relative fails
    os.path.join('backend', 'venv', 'Lib', 'site-packages', 'matplotlib', 'mpl-data', 'fonts', 'ttf', 'DejaVuSans.ttf'),
]

def create_pdf_report(description: str, objects: list):
    # Initialize fpdf2
    pdf = FPDF()
    pdf.add_page()

    # 3. Add the font
    font_loaded = False
    active_font_path = None
    
    for path in POSSIBLE_FONT_PATHS:
        # Check absolute path
        abs_path = os.path.abspath(path)
        if os.path.exists(abs_path):
            active_font_path = abs_path
            break

    try:
        if active_font_path:
            # fpdf2: add_font(family, style, fname)
            # No uni=True needed as it's the default and only mode for TTF in fpdf2
            pdf.add_font(family='DejaVu', style='', fname=active_font_path)
            pdf.set_font('DejaVu', '', 12)
            font_loaded = True
            print(f"SUCCESS: Loaded font from {active_font_path}")
        else:
            print("WARNING: No Unicode font found. Falling back to Helvetica (Latin-1 only).")
    except Exception as e:
        print(f"FONT ERROR: {e}. Falling back to standard font.")

    # --- Title ---
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, 'VisionVoice AI - Analysis Report', 0, 1, 'C')
    pdf.ln(10)
    
    # Description Section
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 10, 'AI Description:', 0, 1)
    
    # --- Content Handling ---
    final_description = description
    if not font_loaded:
        # Replace non-latin-1 characters with '?' to prevent crashing in Helvetica
        final_description = description.encode('latin-1', 'replace').decode('latin-1')
        pdf.set_font('Helvetica', '', 11)
    else:
        pdf.set_font('DejaVu', '', 11)
        
    pdf.multi_cell(0, 10, final_description)
    pdf.ln(5)

    # Objects Section
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 10, 'Detected Objects:', 0, 1)
    
    if font_loaded:
        pdf.set_font('DejaVu', '', 11)
    else:
        pdf.set_font('Helvetica', '', 11)

    if objects:
        for obj in objects:
            obj_text = obj if font_loaded else obj.encode('latin-1', 'replace').decode('latin-1')
            pdf.cell(0, 10, f"- {obj_text}", 0, 1)
    else:
        pdf.cell(0, 10, "No objects detected.", 0, 1)

    # fpdf2 returns a bytearray by default. 
    # Zipfile's writestr handles bytearrays but bytes is more standard.
    return bytes(pdf.output())