import type { DocumentPageContent } from '../utils/examoraLogic';

function escapePdfText(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, (ch) => {
      if (ch === '—' || ch === '–') return '-';
      if (ch === '’' || ch === '‘') return "'";
      if (ch === '“' || ch === '”') return '"';
      if (ch === '•') return '*';
      return ' ';
    })
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextLines(text: string, maxChars: number = 82): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Generates a valid multi-page PDF 1.4 binary buffer from structured academic pages.
 */
export function generateAcademicPdfBuffer(
  title: string,
  subtitle: string,
  pages: DocumentPageContent[]
): Buffer {
  const effectivePages: DocumentPageContent[] =
    pages && pages.length > 0
      ? pages
      : [
          {
            pageNumber: 1,
            heading: title,
            subheading: subtitle,
            paragraphs: [
              'EXAMORA PAKISTAN official study documentation prepared for competitive examination candidates (CSS, PMS, FPSC, PPSC, NTS).',
            ],
            keyPoints: ['Review core concepts carefully.', 'Practice accompanying MCQs in the Quiz section.'],
          },
        ];

  // Object IDs:
  // 1: Catalog
  // 2: Pages
  // 3: Font Helvetica
  // 4: Font Helvetica-Bold
  // 5..4 + effectivePages.length: Page objects
  // 5 + effectivePages.length .. 4 + 2 * effectivePages.length: Content stream objects
  const totalPages = effectivePages.length;
  const pageObjStart = 5;
  const contentObjStart = 5 + totalPages;

  const objects: Map<number, string> = new Map();

  objects.set(1, `<< /Type /Catalog /Pages 2 0 R >>`);

  const kidsRefs = effectivePages.map((_, idx) => `${pageObjStart + idx} 0 R`).join(' ');
  objects.set(2, `<< /Type /Pages /Kids [ ${kidsRefs} ] /Count ${totalPages} >>`);
  objects.set(3, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  objects.set(4, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

  effectivePages.forEach((page, idx) => {
    const pageObjId = pageObjStart + idx;
    const contentObjId = contentObjStart + idx;

    const ops: string[] = [];
    // Top Navy Header Bar (#123675 -> RGB 0.07, 0.21, 0.46)
    ops.push(`0.07 0.21 0.46 rg 40 765 515 42 re f`);
    // Gold accent line (#EAB52F -> RGB 0.92, 0.71, 0.18)
    ops.push(`0.92 0.71 0.18 rg 40 761 515 4 re f`);

    // Header text in white
    ops.push(`BT /F2 11 Tf 1 1 1 rg 52 782 Td (EXAMORA PAKISTAN  |  COMPETITIVE EXAM PREPARATION) Tj ET`);
    ops.push(
      `BT /F1 9 Tf 0.92 0.71 0.18 rg 460 782 Td (Page ${idx + 1} of ${totalPages}) Tj ET`
    );

    let y = 724;
    // Document Title on Page 1
    if (idx === 0) {
      const titleLines = wrapTextLines(title, 58);
      for (const line of titleLines) {
        ops.push(`BT /F2 16 Tf 0.09 0.14 0.23 rg 45 ${y} Td (${escapePdfText(line)}) Tj ET`);
        y -= 22;
      }
      if (subtitle) {
        ops.push(`BT /F1 10 Tf 0.41 0.44 0.50 rg 45 ${y} Td (${escapePdfText(subtitle)}) Tj ET`);
        y -= 18;
      }
      ops.push(`0.90 0.88 0.84 RG 1 w 45 ${y} m 550 ${y} l S`);
      y -= 24;
    }

    // Section Heading
    const headingLines = wrapTextLines(`${page.pageNumber}. ${page.heading}`, 65);
    for (const hLine of headingLines) {
      ops.push(`BT /F2 13 Tf 0.07 0.21 0.46 rg 45 ${y} Td (${escapePdfText(hLine)}) Tj ET`);
      y -= 18;
    }

    if (page.subheading) {
      ops.push(`BT /F2 10 Tf 0.41 0.44 0.50 rg 45 ${y} Td (${escapePdfText(page.subheading)}) Tj ET`);
      y -= 18;
    }

    y -= 4;

    // Paragraphs
    for (const para of page.paragraphs) {
      const lines = wrapTextLines(para, 84);
      for (const line of lines) {
        if (y < 95) break;
        ops.push(`BT /F1 10.5 Tf 0.09 0.14 0.23 rg 45 ${y} Td (${escapePdfText(line)}) Tj ET`);
        y -= 15;
      }
      y -= 8;
    }

    // Key points box
    if (page.keyPoints && page.keyPoints.length > 0 && y > 130) {
      y -= 6;
      ops.push(`BT /F2 11 Tf 0.07 0.21 0.46 rg 45 ${y} Td (Key Exam Takeaways:) Tj ET`);
      y -= 16;
      for (const kp of page.keyPoints) {
        const kpLines = wrapTextLines(`* ${kp}`, 80);
        for (const kLine of kpLines) {
          if (y < 80) break;
          ops.push(`BT /F1 10 Tf 0.09 0.14 0.23 rg 55 ${y} Td (${escapePdfText(kLine)}) Tj ET`);
          y -= 14;
        }
        y -= 4;
      }
    }

    // Footer
    ops.push(`0.90 0.88 0.84 RG 0.75 w 45 56 m 550 56 l S`);
    const footerText =
      page.footerNote || 'EXAMORA PAKISTAN - Verified Study Material for CSS, PMS, FPSC, PPSC & NTS';
    ops.push(
      `BT /F1 8.5 Tf 0.41 0.44 0.50 rg 45 40 Td (${escapePdfText(footerText)}) Tj ET`
    );

    const streamContent = ops.join('\n');
    const streamByteLength = Buffer.byteLength(streamContent, 'utf8');

    objects.set(
      pageObjId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 595 842 ] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>`
    );
    objects.set(
      contentObjId,
      `<< /Length ${streamByteLength} >>\nstream\n${streamContent}\nendstream`
    );
  });

  const maxObjId = 4 + 2 * totalPages;
  const chunks: string[] = ['%PDF-1.4\n'];
  const offsets: number[] = [0];
  let currentOffset = Buffer.byteLength(chunks[0], 'utf8');

  for (let id = 1; id <= maxObjId; id++) {
    offsets[id] = currentOffset;
    const body = objects.get(id) || '';
    const objStr = `${id} 0 obj\n${body}\nendobj\n`;
    chunks.push(objStr);
    currentOffset += Buffer.byteLength(objStr, 'utf8');
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${maxObjId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxObjId; id++) {
    const padded = String(offsets[id]).padStart(10, '0');
    xref += `${padded} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${maxObjId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(xref, trailer);

  return Buffer.from(chunks.join(''), 'utf8');
}
