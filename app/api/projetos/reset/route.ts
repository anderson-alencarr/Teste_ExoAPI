import { NextResponse } from 'next/server';
import { resetarBanco } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { projetos, usuarios } = resetarBanco();
  return NextResponse.json(
    {
      mensagem:
        'Banco de dados restaurado para os registros iniciais de cria-db.sql.',
      projetos,
      usuarios,
    },
    { status: 200 }
  );
}
