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
