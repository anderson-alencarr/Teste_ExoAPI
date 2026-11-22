import { NextRequest, NextResponse } from 'next/server';
import {
  atualizarUsuario,
  buscarUsuarioPorId,
  deletarUsuario,
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

  const usuario = buscarUsuarioPorId(id);
  if (!usuario) {
    return NextResponse.json(
      { erro: `Usuário com Id ${id} não encontrado.` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(usuario, { status: 200, headers: CORS_HEADERS });
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
  const rawEmail = record.email ?? record.Email;
  const rawSenha = record.senha ?? record.Senha;

  if (
    typeof rawEmail !== 'string' ||
    rawEmail.trim().length === 0 ||
    !rawEmail.includes('@')
  ) {
    return NextResponse.json(
      { erro: 'O campo "email" deve ser um endereço de e-mail válido.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (typeof rawSenha !== 'string' || rawSenha.trim().length === 0) {
    return NextResponse.json(
      { erro: 'O campo "senha" é obrigatório.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const atualizado = atualizarUsuario(id, {
    email: rawEmail.trim(),
    senha: rawSenha,
  });

  if (!atualizado) {
    return NextResponse.json(
      { erro: `Usuário com Id ${id} não encontrado.` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
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

  const removido = deletarUsuario(id);
  if (!removido) {
    return NextResponse.json(
      { erro: `Usuário com Id ${id} não encontrado.` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
