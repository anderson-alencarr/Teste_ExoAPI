import { NextRequest, NextResponse } from 'next/server';
import { cadastrarProjeto, listarProjetos } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

function extractPayload(body: unknown): {
  nomeDoProjeto?: string;
  area?: string;
  status?: boolean;
  error?: string;
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'O corpo da requisição deve ser um objeto JSON válido.' };
  }

  const record = body as Record<string, unknown>;
  const rawNome = record.nomeDoProjeto ?? record.NomeDoProjeto;
  const rawArea = record.area ?? record.Area;
  const rawStatus = record.status ?? record.Status;

  if (typeof rawNome !== 'string' || rawNome.trim().length === 0) {
    return { error: 'O campo "nomeDoProjeto" é obrigatório.' };
  }

  if (typeof rawArea !== 'string' || rawArea.trim().length === 0) {
    return { error: 'O campo "area" é obrigatório.' };
  }

  const status = typeof rawStatus === 'boolean' ? rawStatus : true;

  return {
    nomeDoProjeto: rawNome.trim(),
    area: rawArea.trim(),
    status,
  };
}

export async function GET() {
  const projetos = listarProjetos();
  return NextResponse.json(projetos, { status: 200 });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: 'JSON inválido no corpo da requisição.' },
      { status: 400 }
    );
  }

  const parsed = extractPayload(body);
  if (parsed.error || !parsed.nomeDoProjeto || !parsed.area) {
    return NextResponse.json(
      { erro: parsed.error ?? 'Dados inválidos para cadastro.' },
      { status: 400 }
    );
  }

  const criado = cadastrarProjeto({
    nomeDoProjeto: parsed.nomeDoProjeto,
    area: parsed.area,
    status: parsed.status ?? true,
  });

  return NextResponse.json(criado, { status: 201 });
}
