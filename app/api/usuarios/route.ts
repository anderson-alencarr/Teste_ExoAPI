import { NextRequest, NextResponse } from 'next/server';
import { cadastrarUsuario, listarUsuarios } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function extractUsuarioPayload(body: unknown): {
  email?: string;
  senha?: string;
  error?: string;
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'O corpo da requisição deve ser um objeto JSON válido.' };
  }

  const record = body as Record<string, unknown>;
  const rawEmail = record.email ?? record.Email;
  const rawSenha = record.senha ?? record.Senha;

  if (typeof rawEmail !== 'string' || rawEmail.trim().length === 0) {
    return { error: 'O campo "email" é obrigatório.' };
  }

  if (!rawEmail.includes('@') || !rawEmail.includes('.')) {
    return { error: 'Informe um endereço de e-mail válido.' };
  }

  if (typeof rawSenha !== 'string' || rawSenha.trim().length === 0) {
    return { error: 'O campo "senha" é obrigatório.' };
  }

  return {
    email: rawEmail.trim(),
    senha: rawSenha,
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const usuarios = listarUsuarios();
  return NextResponse.json(usuarios, { status: 200, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: 'JSON inválido no corpo da requisição.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const parsed = extractUsuarioPayload(body);
  if (parsed.error || !parsed.email || !parsed.senha) {
    return NextResponse.json(
      { erro: parsed.error ?? 'Dados inválidos para cadastro de usuário.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const criado = cadastrarUsuario({
    email: parsed.email,
    senha: parsed.senha,
  });

  return NextResponse.json(criado, { status: 201, headers: CORS_HEADERS });
}
