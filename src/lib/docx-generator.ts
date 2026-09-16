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
} from 'docx';
import { DocumentAST, CounterPleading } from './types';

/**
 * Builds an authentic, fully editable Microsoft Word (.docx) document from DocumentAST
 */
export async function generateDocumentDocx(ast: DocumentAST): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Title / Court Caption
  if (ast.caption) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: ast.caption.courtName,
            bold: true,
            size: 26, // 13pt
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

    // Caption Table (Plaintiff vs Defendant & Index No)
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
                    children: [new TextRun({ text: ast.caption.plaintiff, bold: true, font: 'Times New Roman' })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: '-against-', bold: true, font: 'Times New Roman' })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: ast.caption.defendant, bold: true, font: 'Times New Roman' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `Index No: ${ast.caption.indexNumber}`, bold: true, font: 'Times New Roman' })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `Address: ${ast.metadata.propertyAddress || 'Subject Premises'}`, font: 'Times New Roman' })],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    // Standard Document Title
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

  // Document Sections
  for (const section of ast.sections) {
    if (section.title) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    if (section.type === 'table' && section.tableData) {
      const rows: TableRow[] = [];
      // Header row
      rows.push(
        new TableRow({
          children: section.tableData.headers.map(
            (h) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: 'Times New Roman' })] })],
              })
          ),
        })
      );
      // Data rows
      for (const row of section.tableData.rows) {
        rows.push(
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: cell, font: 'Times New Roman' })] })],
                })
            ),
          })
        );
      }
      children.push(new Table({ rows }));
    } else {
      children.push(
        new Paragraph({
          spacing: { after: 140 },
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
