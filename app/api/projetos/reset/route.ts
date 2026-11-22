import { NextResponse } from 'next/server';
import { resetarBanco } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const projetos = resetarBanco();
  return NextResponse.json(
    {
      mensagem: 'Banco de dados restaurado para o estado inicial de cria-db.sql.',
      projetos,
    },
    { status: 200 }
  );
}
