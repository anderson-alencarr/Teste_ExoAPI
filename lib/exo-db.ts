import fs from 'node:fs';
import path from 'node:path';

export interface Projeto {
  id: number;
  nomeDoProjeto: string;
  area: string;
  status: boolean;
}

export interface ProjetoInput {
  nomeDoProjeto: string;
  area: string;
  status: boolean;
}

interface StoreState {
  nextId: number;
  projetos: Projeto[];
}

export const INITIAL_PROJETOS_SEED: Projeto[] = [
  {
    id: 1,
    nomeDoProjeto: 'Projeto A — Obra Residencial',
    area: 'Construção Civil',
    status: true,
  },
  {
    id: 2,
    nomeDoProjeto: 'Projeto B — Portal ExoApi',
    area: 'Tecnologia da Informação',
    status: true,
  },
  {
    id: 3,
    nomeDoProjeto: 'Projeto C — Automação Industrial',
    area: 'Mecatrônica',
    status: false,
  },
  {
    id: 4,
    nomeDoProjeto: 'Projeto D — Painel Logístico',
    area: 'Supply Chain',
    status: true,
  },
  {
    id: 5,
    nomeDoProjeto: 'Projeto E — Eficiência Energética',
    area: 'Engenharia Elétrica',
    status: false,
  },
];

const DB_FILE_PATH = path.join('/tmp', 'exoapi-projetos-db.json');

const globalForExo = globalThis as unknown as {
  __exoApiStore?: StoreState;
};

function cloneSeed(): StoreState {
  return {
    nextId: 6,
    projetos: INITIAL_PROJETOS_SEED.map((item) => ({ ...item })),
  };
}

function readStore(): StoreState {
  if (globalForExo.__exoApiStore) {
    return globalForExo.__exoApiStore;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as StoreState;
      if (Array.isArray(parsed.projetos) && typeof parsed.nextId === 'number') {
        globalForExo.__exoApiStore = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to clean seed if temp file cannot be read
  }

  const seeded = cloneSeed();
  writeStore(seeded);
  return seeded;
}

function writeStore(state: StoreState): void {
  globalForExo.__exoApiStore = state;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // In-memory global singleton remains active even if filesystem is read-only
  }
}

export function listarProjetos(): Projeto[] {
  const store = readStore();
  return store.projetos.map((item) => ({ ...item }));
}

export function buscarProjetoPorId(id: number): Projeto | null {
  const store = readStore();
  const found = store.projetos.find((item) => item.id === id);
  return found ? { ...found } : null;
}

export function cadastrarProjeto(input: ProjetoInput): Projeto {
  const store = readStore();
  const novoProjeto: Projeto = {
    id: store.nextId,
    nomeDoProjeto: input.nomeDoProjeto.trim(),
    area: input.area.trim(),
    status: Boolean(input.status),
  };

  const nextState: StoreState = {
    nextId: store.nextId + 1,
    projetos: [...store.projetos, novoProjeto],
  };

  writeStore(nextState);
  return { ...novoProjeto };
}

export function atualizarProjeto(
  id: number,
  input: Partial<ProjetoInput>
): Projeto | null {
  const store = readStore();
  const index = store.projetos.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const current = store.projetos[index];
  const updated: Projeto = {
    id: current.id,
    nomeDoProjeto:
      typeof input.nomeDoProjeto === 'string'
        ? input.nomeDoProjeto.trim()
        : current.nomeDoProjeto,
    area: typeof input.area === 'string' ? input.area.trim() : current.area,
    status: typeof input.status === 'boolean' ? input.status : current.status,
  };

  const nextProjetos = [...store.projetos];
  nextProjetos[index] = updated;

  writeStore({
    nextId: store.nextId,
    projetos: nextProjetos,
  });

  return { ...updated };
}

export function deletarProjeto(id: number): Projeto | null {
  const store = readStore();
  const existing = store.projetos.find((item) => item.id === id);
  if (!existing) {
    return null;
  }

  writeStore({
    nextId: store.nextId,
    projetos: store.projetos.filter((item) => item.id !== id),
  });

  return { ...existing };
}

export function resetarBanco(): Projeto[] {
  const seeded = cloneSeed();
  writeStore(seeded);
  return seeded.projetos.map((item) => ({ ...item }));
}
