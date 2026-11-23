import { NextRequest, NextResponse } from 'next/server';
import { buildCorsHeaders, signExoJwt } from '@/lib/exo-auth';
import { listarUsuarios, loginUsuario } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

function extractCredentials(body: unknown): {
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

  if (typeof rawSenha !== 'string' || rawSenha.length === 0) {
    return { error: 'O campo "senha" é obrigatório.' };
  }

  return {
    email: rawEmail.trim(),
    senha: rawSenha,
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(req),
  });
}

export async function GET(req: NextRequest) {
  const usuarios = listarUsuarios();
  return NextResponse.json(usuarios, {
    status: 200,
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

  const parsed = extractCredentials(body);
  if (parsed.error || !parsed.email || !parsed.senha) {
    return NextResponse.json(
      { erro: parsed.error ?? 'Informe e-mail e senha para autenticar.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const usuarioBuscado = loginUsuario(parsed.email, parsed.senha);
  if (!usuarioBuscado) {
    return NextResponse.json(
      { erro: 'E-mail ou senha inválidos!' },
      { status: 404, headers: corsHeaders }
    );
  }

  const token = signExoJwt(usuarioBuscado);
  return NextResponse.json({ token }, { status: 200, headers: corsHeaders });
}
