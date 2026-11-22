import ExoWorkbench from '@/components/exo-workbench';
import { listarProjetos } from '@/lib/exo-db';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const initialProjetos = listarProjetos();
  return <ExoWorkbench initialProjetos={initialProjetos} />;
}
