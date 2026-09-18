import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  Packer,
  ImageRun,
  PageBreak,
} from 'docx';
import { DocumentAST, CounterPleading } from './types';

function parseDataUrl(dataUrl: string): { type: 'jpg' | 'png' | 'gif' | 'bmp'; data: Buffer } | null {
  const m = dataUrl.match(/^data:image\/(jpeg|jpg|png|gif|bmp);base64,(.+)$/i);
  if (!m) return null;
  const raw = m[1].toLowerCase();
  const type = (raw === 'jpeg' || raw === 'jpg' ? 'jpg' : raw === 'png' ? 'png' : raw === 'gif' ? 'gif' : 'bmp') as
    | 'jpg'
    | 'png'
    | 'gif'
    | 'bmp';
  return { type, data: Buffer.from(m[2], 'base64') };
}

/**
 * Living-document DOCX: optional original scan page, then editable transcript.
 */
export async function generateDocumentDocx(ast: DocumentAST): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  const imageSource = ast.embedImageUrl || ast.originalImageUrl;
  const parsed = imageSource ? parseDataUrl(imageSource) : null;

  if (parsed) {
    const maxWidthPx = 520;
    const srcW = ast.embedImageWidth || 1200;
    const srcH = ast.embedImageHeight || 1600;
    const width = maxWidthPx;
    const height = Math.max(200, Math.round((maxWidthPx * srcH) / srcW));

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'LEXMORPH — ORIGINAL SCAN (IF PROVIDED)',
            bold: true,
            size: 18,
            font: 'Arial',
            color: '166534',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new ImageRun({
            type: parsed.type,
            data: parsed.data,
            transformation: { width, height },
            altText: {
              title: 'Original document scan',
              description: 'Original document image when provided by the user',
              name: 'document-scan',
            },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 320 },
        children: [
          new TextRun({
            text: `${ast.jurisdiction} · Logo, seal, and handwriting preserved from the photograph`,
            size: 16,
            font: 'Arial',
            italics: true,
            color: '64748B',
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'EDITABLE TRANSCRIPT',
          bold: true,
          size: 22,
          font: 'Arial',
          color: '334155',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: 'Correct any OCR mistakes below. The scan on the previous page is the authoritative visual copy.',
          size: 18,
          font: 'Arial',
          color: '64748B',
        }),
      ],
    })
  );

  if (ast.caption?.courtName?.trim() && ast.caption?.plaintiff?.trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: ast.caption.courtName,
            bold: true,
            size: 26,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: ast.caption.countyOrDistrict,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
          left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: ast.caption.plaintiff, bold: true, font: 'Times New Roman' }),
                    ],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: '-against-', italics: true, font: 'Times New Roman' })],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: ast.caption.defendant, bold: true, font: 'Times New Roman' }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Index No: ${ast.caption.indexNumber}`,
                        bold: true,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else if (!parsed) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: ast.title,
            bold: true,
            size: 28,
            font: 'Times New Roman',
          }),
        ],
      })
    );
  }

  for (const section of ast.sections) {
    if (section.title) {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 22,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    if (section.type === 'table' && section.tableData) {
      const rows: TableRow[] = [
        new TableRow({
          children: section.tableData.headers.map(
            (h) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: h, bold: true, font: 'Times New Roman' })],
                  }),
                ],
              })
          ),
        }),
      ];
      for (const row of section.tableData.rows) {
        rows.push(
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, font: 'Times New Roman' })],
                    }),
                  ],
                })
            ),
          })
        );
      }
      children.push(new Table({ rows }));
    } else {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: section.content,
              font: 'Times New Roman',
              size: 22,
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Builds a formal court pleading (.docx) from CounterPleading
 */
export async function generatePleadingDocx(pleading: CounterPleading): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Court Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: pleading.caption.courtName, bold: true, size: 26, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: pleading.caption.countyOrDistrict, bold: true, size: 24, font: 'Times New Roman' }),
      ],
    })
  );

  // Formal Caption
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: pleading.caption.plaintiff, bold: true, font: 'Times New Roman' })] }),
                new Paragraph({ children: [new TextRun({ text: '\n-against-\n', bold: true, font: 'Times New Roman' })] }),
                new Paragraph({ children: [new TextRun({ text: pleading.caption.defendant, bold: true, font: 'Times New Roman' })] }),
              ],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: `Index No. ${pleading.caption.indexNumber}`, bold: true, font: 'Times New Roman' })] }),
                new Paragraph({ children: [new TextRun({ text: pleading.title, bold: true, size: 20, font: 'Times New Roman' })] }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // General Denial
  children.push(
    new Paragraph({
      spacing: { before: 240, after: 160 },
      children: [
        new TextRun({ text: 'GENERAL DENIAL', bold: true, size: 24, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 180 },
      children: [new TextRun({ text: pleading.generalDenial, font: 'Times New Roman', size: 22 })],
    })
  );

  // Affirmative Defenses
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 120 },
      children: [new TextRun({ text: 'AFFIRMATIVE DEFENSES', bold: true, size: 24, font: 'Times New Roman' })],
    })
  );

  for (const def of pleading.affirmativeDefenses) {
    if (def.selected) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [
            new TextRun({ text: `${def.defenseName} (${def.statutoryBasis})`, bold: true, font: 'Times New Roman', size: 22 }),
          ],
        }),
        new Paragraph({
          spacing: { after: 140 },
          children: [new TextRun({ text: def.statement, font: 'Times New Roman', size: 22 })],
        })
      );
    }
  }

  // Relief
  children.push(
    new Paragraph({
      spacing: { before: 180, after: 80 },
      children: [new TextRun({ text: 'WHEREFORE, Respondent respectfully requests that this Court:', bold: true, font: 'Times New Roman', size: 22 })],
    })
  );

  for (const item of pleading.demandForRelief) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: item, font: 'Times New Roman', size: 22 })],
      })
    );
  }

  // Verification Block
  children.push(
    new Paragraph({
      spacing: { before: 260, after: 80 },
      children: [new TextRun({ text: 'VERIFICATION', bold: true, font: 'Times New Roman', size: 22 })],
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [new TextRun({ text: pleading.verificationBlock.penaltyOfPerjuryClause, italics: true, font: 'Times New Roman', size: 20 })],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: `Date: ${pleading.verificationBlock.date}        Location: ${pleading.verificationBlock.county}`, font: 'Times New Roman', size: 20 })],
    }),
    new Paragraph({
      spacing: { before: 160 },
      children: [
        new TextRun({
          text: `[Digitally Signed By: ${pleading.verificationBlock.declarantName}]`,
          bold: true,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return await Packer.toBuffer(doc);
}
