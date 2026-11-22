import ExoWorkbench from '@/components/exo-workbench';
import { listarProjetos, listarUsuarios } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const initialProjetos = listarProjetos();
  const initialUsuarios = listarUsuarios();
  return (
    <ExoWorkbench
      initialProjetos={initialProjetos}
      initialUsuarios={initialUsuarios}
    />
  );
}
