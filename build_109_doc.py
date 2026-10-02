"""
Master Driver to Build the 109-Page College ERP Academic Report.
Coordinates doc_chapters_1_3, doc_chapters_4_7, doc_chapters_8_11, and doc_chapters_12_14.
Generates College_ERP_Documentation.docx and College_ERP_Documentation.md.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from doc_chapters_1_3 import render_front_matter, render_chapter_1, render_chapter_2, render_chapter_3
from doc_chapters_4_7 import render_chapters_4_to_7
from doc_chapters_8_11 import render_chapters_8_to_11
from doc_chapters_12_14 import render_chapters_12_to_14

def main():
    print("=== Master 109-Page Report Generation Started ===")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    docx_path = os.path.join(base_dir, "College_ERP_Project_Report_109_Pages.docx")
    alt_docx_path = os.path.join(base_dir, "College_ERP_Documentation.docx")
    md_path = os.path.join(base_dir, "College_ERP_Documentation.md")

    doc = docx.Document()

    # Configure 1-inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.header_distance = Inches(0.4)
        section.footer_distance = Inches(0.4)

    # Palette
    NAVY = RGBColor(15, 23, 42)
    SLATE = RGBColor(51, 65, 85)
    DARK_BLUE = RGBColor(30, 58, 138)
    CRIMSON = RGBColor(185, 28, 28)
    TEXT_COLOR = RGBColor(30, 41, 59)
    GRAY = RGBColor(100, 116, 139)

    # Set base font
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = TEXT_COLOR
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(5)

    md_lines = []
    def log_md(text=""):
        md_lines.append(text)

    # Paragraph helpers
    def add_title(text, size=18, bold=True, color=DARK_BLUE, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=12):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = bold
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.font.color.rgb = color
        log_md(f"# {text}\n")
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.font.color.rgb = DARK_BLUE
        log_md(f"\n# {text}\n")
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.color.rgb = NAVY
        log_md(f"\n## {text}\n")
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.color.rgb = SLATE
        log_md(f"\n### {text}\n")
        return p

    def add_p(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(5)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
        run = p.add_run(text)
        run.italic = italic
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        
        pre_str = f"**{bold_prefix}** " if bold_prefix else ""
        it_str = f"*{text}*" if italic else text
        log_md(f"{pre_str}{it_str}\n")
        return p

    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(4)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        
        pre_str = f"**{bold_prefix}** " if bold_prefix else ""
        log_md(f"* {pre_str}{text}")
        return p

    def add_code(code_str):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F8FAFC"/>')
        tcPr.append(shd)
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'  <w:left w:val="single" w:sz="12" w:space="0" w:color="0284C7"/>'
            f'  <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'</w:tblBorders>'
        )
        tbl._tbl.tblPr.append(borders)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(code_str)
        r.font.name = 'Courier New'
        r.font.size = Pt(9.5)
        r.font.color.rgb = NAVY
        log_md(f"\n```\n{code_str}\n```\n")

    def add_table_data(headers, rows, widths=None):
        tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, h in enumerate(headers):
            cell = tbl.cell(0, i)
            cell.text = h
            set_cell_bg = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1E293B"/>')
            cell._tc.get_or_add_tcPr().append(set_cell_bg)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            r = p.runs[0]
            r.bold = True
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(255, 255, 255)
        for r_idx, row in enumerate(rows):
            bg = "F1F5F9" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row):
                cell = tbl.cell(r_idx + 1, c_idx)
                cell.text = str(val)
                set_cell_bg = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg}"/>')
                cell._tc.get_or_add_tcPr().append(set_cell_bg)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                if p.runs:
                    r = p.runs[0]
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(9.5)
                    r.font.color.rgb = TEXT_COLOR
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'  <w:top w:val="single" w:sz="6" w:space="0" w:color="0F172A"/>'
            f'  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="0F172A"/>'
            f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
            f'  <w:insideV w:val="none"/>'
            f'  <w:left w:val="none"/>'
            f'  <w:right w:val="none"/>'
            f'</w:tblBorders>'
        )
        tbl._tbl.tblPr.append(borders)
        if widths:
            for row in tbl.rows:
                for idx, w in enumerate(widths):
                    row.cells[idx].width = Inches(w)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)
        
        # Markdown table
        log_md("\n| " + " | ".join(headers) + " |")
        log_md("| " + " | ".join([":---" for _ in headers]) + " |")
        for r in rows:
            clean_r = [str(x).replace("\n", "<br>") for x in r]
            log_md("| " + " | ".join(clean_r) + " |")
        log_md()

    def add_page_footer_label(report_page_num):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(f"Page {report_page_num}")
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.color.rgb = GRAY
        log_md(f"\n*(Report Page {report_page_num})*\n---\n")

    helpers = (add_title, add_h1, add_h2, add_h3, add_p, add_bullet, add_code, add_table_data, add_page_footer_label, log_md)

    print("Rendering Front Matter (Pages 1-8)...")
    render_front_matter(doc, helpers)

    print("Rendering Chapter 1 (Pages 9-19 / Report 5-15)...")
    render_chapter_1(doc, helpers)

    print("Rendering Chapter 2 (Pages 20-25 / Report 16-21)...")
    render_chapter_2(doc, helpers)

    print("Rendering Chapter 3 (Pages 26-36 / Report 22-32)...")
    render_chapter_3(doc, helpers)

    print("Rendering Chapters 4-7 (Pages 37-59 / Report 33-55)...")
    render_chapters_4_to_7(doc, helpers)

    print("Rendering Chapters 8-11 (Pages 60-92 / Report 56-88)...")
    render_chapters_8_to_11(doc, helpers)

    print("Rendering Chapters 12-14 (Pages 93-109 / Report 89-105)...")
    render_chapters_12_to_14(doc, helpers)

    # Save Word document
    print(f"Saving DOCX to {docx_path}...")
    doc.save(docx_path)
    print(f"DOCX saved successfully as {docx_path}")

    try:
        doc.save(alt_docx_path)
        print(f"Also updated {alt_docx_path}")
    except Exception as e:
        print(f"Notice: {alt_docx_path} is currently open in Microsoft Word. Primary saved to {docx_path}")

    # Save Markdown document
    print(f"Saving Markdown to {md_path}...")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(md_lines))
    print("Markdown saved successfully.")

    # Count page breaks in docx to confirm 109 pages
    page_breaks = 0
    for p in doc.paragraphs:
        for r in p.runs:
            if '<w:br w:type="page"/>' in r._r.xml:
                page_breaks += 1
    total_pages = page_breaks + 1
    print(f"=== Build Completed! Total Page Breaks: {page_breaks}, Resulting Pages: {total_pages} ===")

if __name__ == "__main__":
    main()
