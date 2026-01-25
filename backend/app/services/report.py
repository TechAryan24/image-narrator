from fpdf import FPDF
import os

# 1. Get the absolute path to THIS file (report.py)
current_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Construct the path to the font file
# MAKE SURE THIS FILENAME MATCHES WHAT YOU DOWNLOADED EXACTLY
FONT_PATH = os.path.join(current_dir, 'DejaVuSans.ttf') 

print(f"DEBUG: Looking for font at: {FONT_PATH}")  # <--- Check your console for this!

class ReportPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'VisionVoice AI - Analysis Report', 0, 1, 'C')
        self.ln(10)

def create_pdf_report(description: str, objects: list):
    pdf = ReportPDF()
    pdf.add_page()

    # 3. Add the font
    try:
        # 'fname' is the path, 'family' is the name you use in set_font
        pdf.add_font(family='DejaVu', style='', fname=FONT_PATH, uni=True)
        pdf.set_font('DejaVu', '', 12)
    except Exception as e:
        print(f"FONT ERROR: Could not load font from {FONT_PATH}")
        print(f"Error details: {e}")
        # Fallback to Arial so the app doesn't crash (Text will be garbled though)
        pdf.set_font('Arial', '', 12)

    # ... Rest of your function ...
    
    # Description Section
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'AI Description:', 0, 1)
    
    # Switch to Custom Font for content
    # Only switch if we successfully loaded it, otherwise stick to Arial
    if 'DejaVu' in pdf.fonts:
        pdf.set_font('DejaVu', '', 11)
    else:
        pdf.set_font('Arial', '', 11)
        
    pdf.multi_cell(0, 10, description)
    pdf.ln(5)

    # Objects Section
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Detected Objects:', 0, 1)
    
    if 'DejaVu' in pdf.fonts:
        pdf.set_font('DejaVu', '', 11)
    else:
        pdf.set_font('Arial', '', 11)

    if objects:
        for obj in objects:
            pdf.cell(0, 10, f"- {obj}", 0, 1)
    else:
        pdf.cell(0, 10, "No objects detected.", 0, 1)

    return pdf.output(dest='S').encode('latin-1', 'ignore')