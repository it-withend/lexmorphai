import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentDocx, generatePleadingDocx } from '@/lib/docx-generator';
import { DocumentAST, CounterPleading } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data, filename } = body;

    let buffer: Buffer;
    let defaultName = 'lexmorph_document.docx';

    if (type === 'pleading') {
      buffer = await generatePleadingDocx(data as CounterPleading);
      defaultName = 'verified_answer_pleading.docx';
    } else {
      buffer = await generateDocumentDocx(data as DocumentAST);
      defaultName = 'reconstructed_legal_document.docx';
    }

    const finalFilename = filename || defaultName;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
      },
    });
  } catch (err: unknown) {
    console.error('API /export-docx error:', err);
    const message = err instanceof Error ? err.message : 'DOCX generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
