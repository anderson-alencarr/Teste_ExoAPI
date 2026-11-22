'use client';

import React, { useState } from 'react';
import { Check, Copy, ExternalLink, CheckSquare, Square, Download } from 'lucide-react';
import { downloadCriaDbSql } from '@/lib/sql-generator';

interface ActivityGuidePanelProps {
  onOpenCodeFile: (fileId: string) => void;
  onOpenTesterEndpoint: (endpointId: string) => void;
}

interface GuideStep {
  id: string;
  number: string;
  title: string;
  summary: string;
  commands?: string[];
  fileLinks?: { label: string; fileId: string }[];
  endpointId?: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'ssms',
    number: '01.',
    title: 'Criar o banco de dados no SSMS (cria-db.sql)',
    summary:
      'Abra o SQL Server Management Studio (SSMS), carregue o script cria-db.sql e clique em Executar para criar o banco ExoApi e a tabela Projetos com os dados iniciais.',
    fileLinks: [{ label: 'Ver cria-db.sql', fileId: 'cria-db' }],
  },
  {
    id: 'dotnet-setup',
    number: '02.',
    title: 'Preparar o projeto Exo.WebApi no VSCode',
    summary:
      'Abra o terminal na pasta Exo.WebApi, confirme que o SDK do .NET 6 ou 7 está instalado e consolide os pacotes NuGet.',
    commands: ['dotnet --version', 'code .', 'dotnet restore'],
  },
  {
    id: 'classes-base',
    number: '03.',
    title: 'Implementar Context, Model, Repository e Controller (Listar)',
    summary:
      'Preencha ExoContext.cs (ajustando a string de conexão da sua máquina), Projeto.cs, ProjetoRepository.cs com o método Listar() e ProjetosController.cs com a rota [HttpGet].',
    fileLinks: [
      { label: 'ExoContext.cs', fileId: 'exo-context' },
      { label: 'Projeto.cs', fileId: 'projeto-model' },
      { label: 'ProjetoRepository.cs', fileId: 'projeto-repository' },
      { label: 'ProjetosController.cs', fileId: 'projetos-controller' },
    ],
  },
  {
    id: 'build-run',
    number: '04.',
    title: 'Compilar, executar e testar GET /api/projetos no navegador',
    summary:
      'Compile o projeto com dotnet build, inicie o servidor com dotnet run e acesse a URL gerada seguida do sufixo /api/projetos no navegador.',
    commands: ['dotnet build', 'dotnet run'],
    endpointId: 'listar',
  },
  {
    id: 'crud-restante',
    number: '05.',
    title: 'Implementar e testar os demais métodos CRUD no Insomnia / Postman',
    summary:
      'Adicione BuscarPorId (GET /{id}), Cadastrar (POST), Atualizar (PUT /{id}) e Deletar (DELETE /{id}) no repositório e no controlador. Valide primeiro pelos Formulários da interface e depois importe a coleção no Insomnia ou Postman.',
    fileLinks: [
      { label: 'ProjetoRepository.cs (CRUD)', fileId: 'projeto-repository' },
      { label: 'ProjetosController.cs (CRUD)', fileId: 'projetos-controller' },
      { label: 'Program.cs', fileId: 'program-cs' },
    ],
    endpointId: 'cadastrar',
  },
];

export default function ActivityGuidePanel({
  onOpenCodeFile,
  onOpenTesterEndpoint,
}: ActivityGuidePanelProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(['ssms']);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  function toggleStep(id: string) {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function copyCommand(cmd: string) {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(cmd);
      setTimeout(() => setCopiedCmd(null), 1500);
    } catch {
      // Ignore clipboard failure
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            Roteiro Prático · Desenvolvimento de APIs
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] text-balance">
            Guia da Atividade 3 (SSMS e .NET)
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Acompanhe cada etapa da entrega desde o script cria-db.sql até os testes completos no navegador.
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-[#475569] shrink-0">
          {completedIds.length} / {GUIDE_STEPS.length} etapas concluídas
        </div>
      </div>

      <div className="divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0] bg-white">
        {GUIDE_STEPS.map((step) => {
          const isDone = completedIds.includes(step.id);
          return (
            <div key={step.id} className="p-5">
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  aria-label={`Marcar etapa ${step.title}`}
                  onClick={() => toggleStep(step.id)}
                  className="mt-0.5 text-[#2563EB] hover:text-[#1D4ED8] shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5 text-[#94A3B8]" />
                  )}
                </button>

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <h2
                      className={`text-base font-semibold ${
                        isDone ? 'text-[#64748B] line-through' : 'text-[#0F172A]'
                      }`}
                    >
                      {step.number} {step.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#475569]">
                      {step.summary}
                    </p>
                  </div>

                  {step.commands && step.commands.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {step.commands.map((cmd) => (
                        <button
                          key={cmd}
                          type="button"
                          onClick={() => copyCommand(cmd)}
                          className="inline-flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 font-mono text-xs text-[#0F172A] hover:border-[#CBD5E1]"
                        >
                          <span>{cmd}</span>
                          {copiedCmd === cmd ? (
                            <Check className="h-3 w-3 text-[#16A34A]" />
                          ) : (
                            <Copy className="h-3 w-3 text-[#64748B]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {(step.fileLinks || step.endpointId || step.id === 'ssms') && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {step.id === 'ssms' && (
                        <button
                          type="button"
                          onClick={() => downloadCriaDbSql()}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                        >
                          <Download className="h-3 w-3 text-[#475569]" />
                          <span>Baixar cria-db.sql</span>
                        </button>
                      )}
                      {step.fileLinks?.map((link) => (
                        <button
                          key={link.fileId}
                          type="button"
                          onClick={() => onOpenCodeFile(link.fileId)}
                          className="text-xs font-medium text-[#2563EB] hover:underline"
                        >
                          {link.label}
                        </button>
                      ))}
                      {step.endpointId && (
                        <button
                          type="button"
                          onClick={() => onOpenTesterEndpoint(step.endpointId!)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#0F172A] hover:text-[#2563EB]"
                        >
                          <span>Testar endpoint agora</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
