import { NextRequest, NextResponse } from 'next/server';
import { buildCorsHeaders } from '@/lib/exo-auth';
import { cadastrarUsuario, listarUsuarios } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = buildCorsHeaders(req);
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
    !rawEmail.includes('@') ||
    !rawEmail.includes('.')
  ) {
    return NextResponse.json(
      { erro: 'Informe um endereço de e-mail válido.' },
      { status: 400, headers: corsHeaders }
    );
  }

  if (typeof rawSenha !== 'string' || rawSenha.trim().length === 0) {
    return NextResponse.json(
      { erro: 'O campo "senha" é obrigatório.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();
  const exists = listarUsuarios().some(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );
  if (exists) {
    return NextResponse.json(
      { erro: 'Já existe um usuário cadastrado com este e-mail.' },
      { status: 409, headers: corsHeaders }
    );
  }

  const criado = cadastrarUsuario({
    email: rawEmail.trim(),
    senha: rawSenha,
  });

  return NextResponse.json(criado, { status: 201, headers: corsHeaders });
}
