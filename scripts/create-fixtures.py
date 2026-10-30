"""Generate deterministic real document fixtures using reportlab and python-docx."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pdfencrypt import StandardEncryption
from docx import Document

root = Path(__file__).resolve().parent.parent
fixtures = root / 'src/test/fixtures'
fixtures.mkdir(parents=True, exist_ok=True)
for name, pages in [('sample.pdf', ['The chairmen welcomed the policewomen.', 'A spokeswoman thanked the firemen.']), ('blank.pdf', ['']), ('no-matches.pdf', ['The team reviewed the report.'])]:
    pdf = canvas.Canvas(str(fixtures / name), invariant=1)
    for text in pages:
        if text:
            pdf.drawString(72, 750, text)
        pdf.showPage()
    pdf.save()
pdf = canvas.Canvas(str(fixtures / 'protected.pdf'), encrypt=StandardEncryption('test-password'), invariant=1)
pdf.drawString(72, 750, 'The chairman arrived.')
pdf.save()
for name, paragraphs in [('sample.docx', ['The chairwomen welcomed the salesmen.', 'A businesswoman thanked the headmaster.']), ('blank.docx', [])]:
    document = Document()
    for paragraph in paragraphs:
        document.add_paragraph(paragraph)
    document.save(fixtures / name)
(root / 'samples/gender-specific-terms.pdf').write_bytes((fixtures / 'sample.pdf').read_bytes())
(root / 'samples/gender-specific-terms.docx').write_bytes((fixtures / 'sample.docx').read_bytes())
