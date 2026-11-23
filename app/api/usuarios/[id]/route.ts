import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateBearerRequest,
  buildCorsHeaders,
} from '@/lib/exo-auth';
import {
  atualizarUsuario,
  buscarUsuarioPorId,
  deletarUsuario,
} from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

function parseId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) {
    return null;
  }
  const parsed = Number(rawId);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(req),
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const corsHeaders = buildCorsHeaders(req);
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      { erro: 'O parâmetro "id" deve ser um número inteiro positivo.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const usuario = buscarUsuarioPorId(id);
  if (!usuario) {
    return NextResponse.json(
      { erro: `Usuário com Id ${id} não encontrado.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(usuario, { status: 200, headers: corsHeaders });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const corsHeaders = buildCorsHeaders(req);
  const auth = authenticateBearerRequest(req);
  if (!auth) {
    return NextResponse.json(
      {
        erro: '401 Unauthorized — Envie um token Bearer válido obtido via POST /api/usuarios.',
      },
      { status: 401, headers: corsHeaders }
    );
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      { erro: 'O parâmetro "id" deve ser um número inteiro positivo.' },
      { status: 400, headers: corsHeaders }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: 'JSON inválido no corpo da requisição.' },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { erro: 'O corpo da requisição deve ser um objeto JSON válido.' },
      { status: 400, headers: corsHeaders }
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
      { status: 400, headers: corsHeaders }
    );
  }

  if (rawSenha !== undefined && typeof rawSenha !== 'string') {
    return NextResponse.json(
      { erro: 'O campo "senha" deve ser uma string.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const atualizado = atualizarUsuario(id, {
    email: rawEmail.trim(),
    senha: typeof rawSenha === 'string' && rawSenha.length > 0 ? rawSenha : undefined,
  });

  if (!atualizado) {
    return NextResponse.json(
      { erro: `Usuário com Id ${id} não encontrado.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const corsHeaders = buildCorsHeaders(req);
  const auth = authenticateBearerRequest(req);
  if (!auth) {
    return NextResponse.json(
      {
        erro: '401 Unauthorized — Envie um token Bearer válido obtido via POST /api/usuarios.',
      },
      { status: 401, headers: corsHeaders }
    );
  }

  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      { erro: 'O parâmetro "id" deve ser um número inteiro positivo.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const removido = deletarUsuario(id);
  if (!removido) {
    return NextResponse.json(
      { erro: `Usuário com Id ${id} não encontrado.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
