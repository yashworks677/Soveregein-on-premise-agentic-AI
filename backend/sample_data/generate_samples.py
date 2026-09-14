from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import random

SAMPLE_DIR = Path(__file__).resolve().parent

def create_inspection_pdf(output_path: Path):
    doc = SimpleDocTemplate(str(output_path), pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=15, leading=18, textColor=colors.HexColor('#0F172A'))
    sub_style = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=8.5, leading=12, textColor=colors.HexColor('#475569'))
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#1E293B'))
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=11, leading=14, textColor=colors.HexColor('#0F172A'), spaceBefore=8, spaceAfter=4)

    story = []
    story.append(Paragraph("<b>CENTRAL INDUSTRIAL REFINERY COMPLEX — UNIT OPERATIONS DIVISION</b>", sub_style))
    story.append(Paragraph("TECHNICAL INSPECTION REPORT: ATMOSPHERIC COLUMN V-701A", title_style))
    story.append(Paragraph("Asset ID: NRC-REF-V-701A | Service: Crude Distillation | Inspection Cycle: Q3 Annual Integrity", sub_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=8))

    story.append(Paragraph("<b>1. Operating Environment & Design Specifications</b>", h2_style))
    specs = [
        ["Parameter", "Design Rating", "Current Operating Point", "Tolerance Limit"],
        ["Operating Pressure", "45.0 PSIG", "39.4 PSIG", "42.0 PSIG"],
        ["Operating Temperature", "365.0 °C", "358.2 °C", "380.0 °C"],
        ["Design Corrosion Allowance", "3.00 mm", "2.85 mm consumed", "Exceeded in Lower Trays"],
        ["Primary Metallurgy", "ASTM A516 Gr 70 Carbon Steel", "Shell Clad 410S Stainless", "ASME Section VIII Div 1"]
    ]
    t_specs = Table(specs, colWidths=[140, 120, 140, 130])
    t_specs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_specs)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>2. Ultrasonic Wall Thickness Gauging (NDT Findings)</b>", h2_style))
    thickness = [
        ["Inspection Location", "Nominal (mm)", "Minimum Retirement (mm)", "Measured Actual (mm)", "Status Verdict"],
        ["Top Dome Section (Elevation +42m)", "10.00", "7.50", "9.40", "COMPLIANT"],
        ["Shell Course 1 (Trays 28-35)", "12.00", "9.50", "11.10", "COMPLIANT"],
        ["Shell Course 2 (Trays 15-27)", "14.00", "11.00", "12.30", "MONITOR"],
        ["Shell Course 3 (Flash Zone Elevation +12m)", "16.00", "12.80", "10.45", "CRITICAL THINNING"],
        ["Bottom Sump & Reboiler Return", "18.00", "14.00", "15.90", "COMPLIANT"]
    ]
    t_thick = Table(thickness, colWidths=[170, 85, 115, 90, 70])
    t_thick.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (4,4), (4,4), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (4,4), (4,4), colors.HexColor('#991B1B')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_thick)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>3. Auxiliary Relief Devices & Defect Observations</b>", h2_style))
    story.append(Paragraph("• <b>Pressure Relief Valve PRV-701A:</b> Tested on bench. Valve exhibited seat leakage at 36 PSIG (below 45 PSIG set pressure) and reseat delay of 4.8 seconds during full lift simulation.", body_style))
    story.append(Paragraph("• <b>Tray 18 Hold-down Clamps:</b> Three localized clips detached due to severe sulfide stress cracking (SSC). Debris lodged near downcomer nozzle.", body_style))
    story.append(Paragraph("• <b>Flash Zone Internal Cladding:</b> 340mm area of 410S stainless cladding has delaminated, exposing base carbon steel shell to naphthenic acid attack at 345°C.", body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>4. Inspector Conclusions & Required Action</b>", h2_style))
    story.append(Paragraph("Due to Shell Course 3 wall thickness measuring 10.45 mm against the minimum statutory retirement threshold of 12.80 mm, immediate regulatory notification and mechanical reinforcement or weld overlay is mandatory before column re-commissioning.", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Inspected By: <b>K. Deshmukh, NDT Level-III Certification ID #88412</b> | Verified: <b>Chief Plant Inspector</b>", sub_style))

    doc.build(story)

def create_safety_sop_pdf(output_path: Path):
    doc = SimpleDocTemplate(str(output_path), pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=15, leading=18, textColor=colors.HexColor('#0F172A'))
    sub_style = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=8.5, leading=12, textColor=colors.HexColor('#475569'))
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#1E293B'))
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=11, leading=14, textColor=colors.HexColor('#0F172A'), spaceBefore=8, spaceAfter=4)

    story = []
    story.append(Paragraph("<b>CONFIDENTIAL INTERNAL STANDARD — HEALTH, SAFETY & ENVIRONMENT (HSE)</b>", sub_style))
    story.append(Paragraph("SOP-504: STATUTORY INTEGRITY STANDARDS FOR REFINERY PRESSURE VESSELS", title_style))
    story.append(Paragraph("Standard Code: NRC-HSE-SOP-504-REV-04 | Classification: STRICTLY CONFIDENTIAL", sub_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=8))

    story.append(Paragraph("<b>SECTION 1.0 — OBJECTIVE & JURISDICTION</b>", h2_style))
    story.append(Paragraph("This Standard Operating Procedure (SOP) establishes mandatory safety envelopes, minimum retirement wall thicknesses, and shutdown criteria for all high-temperature pressure vessels, columns, and heat exchangers across refinery operational units.", body_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>SECTION 3.2 — MINIMUM RETIREMENT WALL THICKNESS CRITERIA</b>", h2_style))
    story.append(Paragraph("Under no operational circumstances shall any pressure boundary component operate below the calculated minimum retirement thickness (t_min) determined in accordance with ASME Boiler and Pressure Vessel Code Section VIII. Any measurement indicating wall thickness below t_min constitutes an IMMEDIATE CRITICAL NON-CONFORMANCE requiring immediate de-pressurization and formal approval by the Refinery Safety Director before re-pressurization.", body_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>SECTION 4.1 — PRESSURE RELIEF VALVE (PRV) MANDATORY TOLERANCE</b>", h2_style))
    story.append(Paragraph("All PRVs protecting hydrocarbon distillation columns must be bench-calibrated every 12 months. Allowable set-pressure deviation is strictly limited to +/- 1.5%. Any premature seat leakage below 90% of set-pressure or reseat delay exceeding 3.0 seconds requires immediate valve replacement with a certified backup unit prior to start-up.", body_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>SECTION 5.4 — CLADDING INTEGRITY & NAPHTHENIC CORROSION</b>", h2_style))
    story.append(Paragraph("Where crude feeds contain Total Acid Number (TAN) exceeding 0.5 mg KOH/g, stainless steel cladding delamination exceeding 100 cm² requires shutdown weld repair. Operating unclad carbon steel at temperatures above 230°C in high-TAN service is strictly prohibited.", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Approved By: <b>Dr. A. Sharma, Director of Plant Safety & Oversight</b> | Approved: <b>2025-06-01</b>", sub_style))

    doc.build(story)

def create_plant_metrics_xlsx(output_path: Path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Plant_Unit_7_Telemetry"

    headers = [
        "Record_ID", "Timestamp", "Furnace_Temp_C", "Feed_Rate_BPD", 
        "Column_Top_Pressure_PSI", "Reflux_Ratio", "Vibration_Velocity_mms", "Sulfur_PPM"
    ]
    ws.append(headers)

    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    header_font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")

    # Generate 35 realistic operational rows with 3 distinct real anomalies
    random.seed(42)
    base_time = 1700000000

    for i in range(1, 36):
        # Baseline normal values
        temp = round(random.uniform(352.0, 364.0), 1)
        feed = round(random.uniform(48000, 52000), 0)
        pressure = round(random.uniform(38.0, 41.5), 2)
        reflux = round(random.uniform(2.8, 3.4), 2)
        vib = round(random.uniform(2.1, 4.5), 2)
        sulfur = round(random.uniform(420, 490), 1)

        # Inject real anomalies for the AI / tools to catch
        if i == 14:
            temp = 486.5  # Critical high temperature spike
        elif i == 22:
            vib = 14.8    # Critical vibration surge
        elif i == 29:
            pressure = 58.2  # Dangerous over-pressure condition

        time_str = f"2026-08-14 {10 + (i // 6):02d}:{(i % 6) * 10:02d}:00"
        ws.append([f"REC-{1000 + i}", time_str, temp, feed, pressure, reflux, vib, sulfur])

    wb.save(str(output_path))

def create_comparison_reports(dir_path: Path):
    # Jan Report
    doc1 = SimpleDocTemplate(str(dir_path / "Report_January_Unit7.pdf"), pagesize=letter)
    styles = getSampleStyleSheet()
    story1 = [
        Paragraph("<b>NRC REFINERY COMPLEX — MONTHLY INSPECTION DOSSIER (JANUARY 2026)</b>", styles['Heading2']),
        Paragraph("Asset: Distillation Unit 7 | Operating Pressure: 39.2 PSI | Feed: 49,500 BPD", styles['Normal']),
        Paragraph("Ultrasonic Thickness: Shell Course 3 measured at 11.20 mm. Minor localized pitting noted.", styles['Normal']),
        Paragraph("Safety Review: All relief devices functioning within tolerance. Maintenance schedule: Green.", styles['Normal'])
    ]
    doc1.build(story1)

    # Feb Report
    doc2 = SimpleDocTemplate(str(dir_path / "Report_February_Unit7.pdf"), pagesize=letter)
    story2 = [
        Paragraph("<b>NRC REFINERY COMPLEX — MONTHLY INSPECTION DOSSIER (FEBRUARY 2026)</b>", styles['Heading2']),
        Paragraph("Asset: Distillation Unit 7 | Operating Pressure: 42.1 PSI | Feed: 51,200 BPD", styles['Normal']),
        Paragraph("Ultrasonic Thickness: Shell Course 3 measured at 10.45 mm. Rapid thickness degradation of 0.75 mm detected in 30 days.", styles['Normal']),
        Paragraph("Safety Review: PRV-701A exhibited premature leakage. Urgent inspection recommended.", styles['Normal'])
    ]
    doc2.build(story2)

if __name__ == "__main__":
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    create_inspection_pdf(SAMPLE_DIR / "Inspection_Report_Distillation_Unit_7.pdf")
    create_safety_sop_pdf(SAMPLE_DIR / "Safety_SOP_Refinery_Pressure_Vessels.pdf")
    create_plant_metrics_xlsx(SAMPLE_DIR / "Plant_Performance_Metrics_Q3.xlsx")
    create_comparison_reports(SAMPLE_DIR)
    print("Sample industrial documents generated successfully in", SAMPLE_DIR)
