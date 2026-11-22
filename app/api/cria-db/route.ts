import { NextRequest, NextResponse } from 'next/server';
import {
  listarProjetos,
  listarUsuarios,
  INITIAL_PROJETOS_SEED,
  INITIAL_USUARIOS_SEED,
} from '@/lib/exo-db';
import { generateCriaDbSql } from '@/lib/sql-generator';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get('scope');
  const projetos =
    scope === 'atual' ? listarProjetos() : INITIAL_PROJETOS_SEED;
  const usuarios =
    scope === 'atual' ? listarUsuarios() : INITIAL_USUARIOS_SEED;

  const sql = generateCriaDbSql({ projetos, usuarios });

  return new NextResponse(sql, {
    status: 200,
    headers: {
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': 'attachment; filename="cria-db.sql"',
    },
  });
}
