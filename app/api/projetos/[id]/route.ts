import { NextRequest, NextResponse } from 'next/server';
import {
  atualizarProjeto,
  buscarProjetoPorId,
  deletarProjeto,
} from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function parseId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) {
    return null;
  }
  const parsed = Number(rawId);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      { erro: 'O parâmetro "id" deve ser um número inteiro positivo.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const projeto = buscarProjetoPorId(id);
  if (!projeto) {
    return NextResponse.json(
      { erro: `Projeto com Id ${id} não encontrado.` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(projeto, { status: 200, headers: CORS_HEADERS });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      { erro: 'O parâmetro "id" deve ser um número inteiro positivo.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: 'JSON inválido no corpo da requisição.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { erro: 'O corpo da requisição deve ser um objeto JSON válido.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const record = body as Record<string, unknown>;
  const rawNome = record.nomeDoProjeto ?? record.NomeDoProjeto;
  const rawArea = record.area ?? record.Area;
  const rawStatus = record.status ?? record.Status;

  if (typeof rawNome !== 'string' || rawNome.trim().length === 0) {
    return NextResponse.json(
      { erro: 'O campo "nomeDoProjeto" é obrigatório.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (typeof rawArea !== 'string' || rawArea.trim().length === 0) {
    return NextResponse.json(
      { erro: 'O campo "area" é obrigatório.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (typeof rawStatus !== 'boolean') {
    return NextResponse.json(
      { erro: 'O campo "status" deve ser booleano (true ou false).' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const atualizado = atualizarProjeto(id, {
    nomeDoProjeto: rawNome.trim(),
    area: rawArea.trim(),
    status: rawStatus,
  });

  if (!atualizado) {
    return NextResponse.json(
      { erro: `Projeto com Id ${id} não encontrado.` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(atualizado, { status: 200, headers: CORS_HEADERS });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      { erro: 'O parâmetro "id" deve ser um número inteiro positivo.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const removido = deletarProjeto(id);
  if (!removido) {
    return NextResponse.json(
      { erro: `Projeto com Id ${id} não encontrado.` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
