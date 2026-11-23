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

export interface Usuario {
  id: number;
  email: string;
}

export interface UsuarioInput {
  email: string;
  senha: string;
}

export interface UsuarioSeedRecord {
  id: number;
  email: string;
  senha: string;
}

export const INITIAL_PROJETOS_SEED: Projeto[] = [
  {
    id: 1,
    nomeDoProjeto: 'Projeto A - Obras BR',
    area: 'Construção Civil',
    status: true,
  },
  {
    id: 2,
    nomeDoProjeto: 'Projeto B - SENAI Fest',
    area: 'Eventos',
    status: false,
  },
  {
    id: 3,
    nomeDoProjeto: 'Projeto C - Hackathon Fest',
    area: 'Eventos',
    status: true,
  },
];

export const INITIAL_USUARIOS_SEED: UsuarioSeedRecord[] = [
  {
    id: 1,
    email: 'email@sp.br',
    senha: '1234',
  },
  {
    id: 2,
    email: 'email_dois@sp.br',
    senha: '1234',
  },
];
