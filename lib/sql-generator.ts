import {
  INITIAL_PROJETOS_SEED,
  INITIAL_USUARIOS_SEED,
  type Projeto,
  type Usuario,
} from '@/lib/exo-seed';

export interface GenerateCriaDbOptions {
  databaseName?: string;
  tableName?: string;
  projetos?: Projeto[];
  usuarios?: Usuario[];
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Generates the T-SQL script (cria-db.sql) for SQL Server Management Studio (SSMS)
 * based on the initial structure of the ExoApi Projetos and Usuarios tables.
 */
export function generateCriaDbSql(options: GenerateCriaDbOptions = {}): string {
  const databaseName = options.databaseName ?? 'ExoApi';
  const tableName = options.tableName ?? 'Projetos';
  const registrosProjetos = options.projetos ?? INITIAL_PROJETOS_SEED;
  const registrosUsuarios = options.usuarios ?? INITIAL_USUARIOS_SEED;

  const lines: string[] = [
    `-- Script de criação do banco de dados ${databaseName} para SQL Server Management Studio (SSMS)`,
    '-- Execute este script completo no SSMS antes de iniciar a API com dotnet run.',
    '',
    `CREATE DATABASE ${databaseName};`,
    'GO',
    '',
    `USE ${databaseName};`,
    'GO',
    '',
    `CREATE TABLE ${tableName} (`,
    '    Id INT PRIMARY KEY IDENTITY(1,1),',
    '    NomeDoProjeto VARCHAR(150) NOT NULL,',
    '    Area VARCHAR(150) NOT NULL,',
    '    Status BIT NOT NULL',
    ');',
    'GO',
    '',
  ];

  if (registrosProjetos.length > 0) {
    lines.push(
      `INSERT INTO ${tableName} (NomeDoProjeto, Area, Status) VALUES`
    );
    registrosProjetos.forEach((projeto, index) => {
      const nome = escapeSqlString(projeto.nomeDoProjeto);
      const area = escapeSqlString(projeto.area);
      const statusBit = projeto.status ? 1 : 0;
      const suffix = index === registrosProjetos.length - 1 ? ';' : ',';
      lines.push(`('${nome}', '${area}', ${statusBit})${suffix}`);
    });
    lines.push('GO', '');
  }

  lines.push(
    'CREATE TABLE Usuarios (',
    '    Id INT PRIMARY KEY IDENTITY(1,1),',
    '    Email VARCHAR(255) NOT NULL UNIQUE,',
    '    Senha VARCHAR(120) NOT NULL',
    ');',
    'GO',
    ''
  );

  if (registrosUsuarios.length > 0) {
    lines.push('INSERT INTO Usuarios (Email, Senha) VALUES');
    registrosUsuarios.forEach((usuario, index) => {
      const email = escapeSqlString(usuario.email);
      const senha = escapeSqlString(usuario.senha);
      const suffix = index === registrosUsuarios.length - 1 ? ';' : ',';
      lines.push(`('${email}', '${senha}')${suffix}`);
    });
    lines.push('GO', '');
  }

  lines.push(`SELECT Id, NomeDoProjeto, Area, Status FROM ${tableName};`);
  lines.push('SELECT Id, Email, Senha FROM Usuarios;');
  lines.push('GO', '');

  return lines.join('\n');
}

/**
 * Generates the 'cria-db.sql' content and triggers a browser file download.
 */
export function downloadCriaDbSql(
  options: GenerateCriaDbOptions = {},
  filename = 'cria-db.sql'
): string {
  const sqlContent = generateCriaDbSql(options);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([sqlContent], {
      type: 'application/sql;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  return sqlContent;
}
