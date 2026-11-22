import fs from 'node:fs';
import path from 'node:path';
import {
  INITIAL_PROJETOS_SEED,
  INITIAL_USUARIOS_SEED,
  type Projeto,
  type ProjetoInput,
  type Usuario,
  type UsuarioInput,
} from '@/lib/exo-seed';

export {
  INITIAL_PROJETOS_SEED,
  INITIAL_USUARIOS_SEED,
  type Projeto,
  type ProjetoInput,
  type Usuario,
  type UsuarioInput,
};

interface StoreState {
  nextProjetoId: number;
  projetos: Projeto[];
  nextUsuarioId: number;
  usuarios: Usuario[];
}

const DB_FILE_PATH = path.join('/tmp', 'exoapi-db-v2.json');

const globalForExo = globalThis as unknown as {
  __exoApiStoreV2?: StoreState;
};

function cloneSeed(): StoreState {
  return {
    nextProjetoId: 6,
    projetos: INITIAL_PROJETOS_SEED.map((item) => ({ ...item })),
    nextUsuarioId: 3,
    usuarios: INITIAL_USUARIOS_SEED.map((item) => ({ ...item })),
  };
}

function readStore(): StoreState {
  if (globalForExo.__exoApiStoreV2) {
    return globalForExo.__exoApiStoreV2;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as StoreState;
      if (
        Array.isArray(parsed.projetos) &&
        typeof parsed.nextProjetoId === 'number' &&
        Array.isArray(parsed.usuarios) &&
        typeof parsed.nextUsuarioId === 'number'
      ) {
        globalForExo.__exoApiStoreV2 = parsed;
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
  globalForExo.__exoApiStoreV2 = state;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // In-memory global singleton remains active even if filesystem is read-only
  }
}

// ============================================================================
// Projetos CRUD
// ============================================================================

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
    id: store.nextProjetoId,
    nomeDoProjeto: input.nomeDoProjeto.trim(),
    area: input.area.trim(),
    status: Boolean(input.status),
  };

  writeStore({
    ...store,
    nextProjetoId: store.nextProjetoId + 1,
    projetos: [...store.projetos, novoProjeto],
  });

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
    ...store,
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
    ...store,
    projetos: store.projetos.filter((item) => item.id !== id),
  });

  return { ...existing };
}

// ============================================================================
// Usuarios CRUD
// ============================================================================

export function listarUsuarios(): Usuario[] {
  const store = readStore();
  return store.usuarios.map((item) => ({ ...item }));
}

export function buscarUsuarioPorId(id: number): Usuario | null {
  const store = readStore();
  const found = store.usuarios.find((item) => item.id === id);
  return found ? { ...found } : null;
}

export function cadastrarUsuario(input: UsuarioInput): Usuario {
  const store = readStore();
  const novoUsuario: Usuario = {
    id: store.nextUsuarioId,
    email: input.email.trim(),
    senha: input.senha,
  };

  writeStore({
    ...store,
    nextUsuarioId: store.nextUsuarioId + 1,
    usuarios: [...store.usuarios, novoUsuario],
  });

  return { ...novoUsuario };
}

export function atualizarUsuario(
  id: number,
  input: Partial<UsuarioInput>
): Usuario | null {
  const store = readStore();
  const index = store.usuarios.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const current = store.usuarios[index];
  const updated: Usuario = {
    id: current.id,
    email:
      typeof input.email === 'string' && input.email.trim().length > 0
        ? input.email.trim()
        : current.email,
    senha:
      typeof input.senha === 'string' && input.senha.length > 0
        ? input.senha
        : current.senha,
  };

  const nextUsuarios = [...store.usuarios];
  nextUsuarios[index] = updated;

  writeStore({
    ...store,
    usuarios: nextUsuarios,
  });

  return { ...updated };
}

export function deletarUsuario(id: number): Usuario | null {
  const store = readStore();
  const existing = store.usuarios.find((item) => item.id === id);
  if (!existing) {
    return null;
  }

  writeStore({
    ...store,
    usuarios: store.usuarios.filter((item) => item.id !== id),
  });

  return { ...existing };
}

export function resetarBanco(): { projetos: Projeto[]; usuarios: Usuario[] } {
  const seeded = cloneSeed();
  writeStore(seeded);
  return {
    projetos: seeded.projetos.map((item) => ({ ...item })),
    usuarios: seeded.usuarios.map((item) => ({ ...item })),
  };
}
