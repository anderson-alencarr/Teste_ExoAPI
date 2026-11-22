'use client';

import React, { useState, useCallback } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { RotateCcw, Folder, FileCode2, Database } from 'lucide-react';
import type { Projeto } from '@/lib/exo-db';
import { EXO_FILE_TEMPLATES } from '@/lib/exo-templates';
import ApiTesterPanel, {
  ENDPOINT_PRESETS,
  DEFAULT_POST_BODY,
  type HttpMethod,
} from '@/components/api-tester-panel';
import ProjetosTablePanel from '@/components/projetos-table-panel';
import CodeExplorerPanel from '@/components/code-explorer-panel';
import ActivityGuidePanel from '@/components/activity-guide-panel';

type ActiveView = 'tester' | 'tabela' | 'codigo' | 'guia';

interface ExoWorkbenchProps {
  initialProjetos: Projeto[];
}

function methodTextColor(method: HttpMethod): string {
  switch (method) {
    case 'GET':
      return 'text-[#15803D]';
    case 'POST':
      return 'text-[#1D4ED8]';
    case 'PUT':
      return 'text-[#B45309]';
    case 'DELETE':
      return 'text-[#B91C1C]';
  }
}

export default function ExoWorkbench({ initialProjetos }: ExoWorkbenchProps) {
  const [activeView, setActiveView] = useState<ActiveView>('tester');
  const [projetos, setProjetos] = useState<Projeto[]>(initialProjetos);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('listar');
  const [targetId, setTargetId] = useState<string>('1');
  const [requestBody, setRequestBody] = useState<string>(DEFAULT_POST_BODY);
  const [selectedFileId, setSelectedFileId] = useState<string>('cria-db');

  const refreshProjetos = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const response = await fetch('/api/projetos', { cache: 'no-store' });
      if (response.ok) {
        const data = (await response.json()) as Projeto[];
        setProjetos(data);
      }
    } finally {
      setIsLoadingTable(false);
    }
  }, []);

  function handleSelectEndpoint(endpointId: string) {
    setSelectedEndpointId(endpointId);
    if (endpointId === 'cadastrar') {
      setRequestBody(DEFAULT_POST_BODY);
    } else if (endpointId === 'atualizar') {
      const numericId = Number(targetId);
      const match =
        projetos.find((p) => p.id === numericId) ?? projetos[0] ?? null;
      if (match) {
        setTargetId(String(match.id));
        setRequestBody(
          JSON.stringify(
            {
              nomeDoProjeto: match.nomeDoProjeto,
              area: match.area,
              status: match.status,
            },
            null,
            2
          )
        );
      }
    }
  }

  async function handleResetDatabase() {
    setIsResetting(true);
    setFeedbackBanner(null);
    try {
      const response = await fetch('/api/projetos/reset', { method: 'POST' });
      if (response.ok) {
        const data = (await response.json()) as {
          mensagem?: string;
          projetos?: Projeto[];
        };
        if (Array.isArray(data.projetos)) {
          setProjetos(data.projetos);
        } else {
          await refreshProjetos();
        }
        setFeedbackBanner(
          'Banco de dados restaurado para os 5 registros iniciais de cria-db.sql.'
        );
        setTimeout(() => setFeedbackBanner(null), 3500);
      }
    } finally {
      setIsResetting(false);
    }
  }

  function handleTestProjectInApi(id: number) {
    setTargetId(String(id));
    setSelectedEndpointId('buscar-id');
    setActiveView('tester');
  }

  function handleOpenCodeFile(fileId: string) {
    setSelectedFileId(fileId);
    setActiveView('codigo');
  }

  function handleOpenTesterEndpoint(endpointId: string) {
    handleSelectEndpoint(endpointId);
    setActiveView('tester');
  }

  const ativosCount = projetos.filter((p) => p.status).length;
  const inativosCount = projetos.length - ativosCount;

  const navItems: { id: ActiveView; label: string }[] = [
    { id: 'tester', label: 'Testador API' },
    { id: 'tabela', label: 'Tabela SQL' },
    { id: 'codigo', label: 'Código C#' },
    { id: 'guia', label: 'Guia SSMS' },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
        {/* Top Bar Contract: 3 zones separated by gap-8 */}
        <header className="border-b border-[#E2E8F0] bg-white">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
            {/* Zone 1: Single-line Brand Wordmark */}
            <button
              type="button"
              onClick={() => setActiveView('tester')}
              className="font-display text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0"
            >
              ExoApi Workbench
            </button>

            {/* Zone 2: 4 concise single-line nav links */}
            <nav
              aria-label="Navegação principal"
              className="hidden md:flex items-center gap-6"
            >
              {navItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`border-b-2 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'border-[#2563EB] text-[#0F172A]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: 1 primary action */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetDatabase}
                className="inline-flex items-center gap-2 rounded-md bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E293B] disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isResetting ? 'Restaurando...' : 'Restaurar Banco'}</span>
              </button>
            </div>
          </div>

          {/* Mobile secondary navigation row (outside desktop nav) */}
          <div className="flex items-center gap-4 overflow-x-auto border-t border-[#F1F5F9] px-6 py-2 md:hidden">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`border-b-2 py-1 text-xs font-medium whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#2563EB] text-[#0F172A]'
                      : 'border-transparent text-[#64748B]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Feedback notification after reset */}
        {feedbackBanner && (
          <div className="border-b border-[#BBF7D0] bg-[#F0FDF4]">
            <div className="mx-auto max-w-[1440px] px-6 py-2 text-xs font-medium text-[#15803D]">
              {feedbackBanner}
            </div>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-8 px-6 py-6">
          {/* Left Contextual Sidebar (256px) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="space-y-6">
              {activeView === 'tester' && (
                <div>
                  <h2 className="mb-2.5 text-xs font-semibold text-[#475569]">
                    Endpoints da API
                  </h2>
                  <div className="divide-y divide-[#F1F5F9] rounded-lg border border-[#E2E8F0] bg-white">
                    {ENDPOINT_PRESETS.map((preset) => {
                      const isSelected = selectedEndpointId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectEndpoint(preset.id)}
                          className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors ${
                            isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-12 font-mono text-[11px] font-semibold shrink-0 ${methodTextColor(
                                  preset.method
                                )}`}
                              >
                                {preset.method}
                              </span>
                              <span className="truncate font-mono text-xs text-[#0F172A]">
                                {preset.pathPattern}
                              </span>
                            </div>
                            <p className="mt-0.5 pl-14 text-[11px] text-[#64748B]">
                              {preset.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeView === 'tabela' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                    <h2 className="text-xs font-semibold text-[#0F172A]">
                      Esquema dbo.Projetos
                    </h2>
                    <dl className="mt-3 space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <dt className="text-[#0F172A]">Id</dt>
                        <dd className="text-[#64748B]">INT PK</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[#0F172A]">NomeDoProjeto</dt>
                        <dd className="text-[#64748B]">VARCHAR</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[#0F172A]">Area</dt>
                        <dd className="text-[#64748B]">VARCHAR</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[#0F172A]">Status</dt>
                        <dd className="text-[#64748B]">BIT</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                    <h2 className="text-xs font-semibold text-[#0F172A]">
                      Resumo da Tabela
                    </h2>
                    <dl className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <dt className="text-[#475569]">Total de registros</dt>
                        <dd className="font-mono font-semibold tabular-nums text-[#0F172A]">
                          {projetos.length}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[#475569]">Projetos ativos</dt>
                        <dd className="font-mono font-semibold tabular-nums text-[#16A34A]">
                          {ativosCount}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-[#475569]">Projetos inativos</dt>
                        <dd className="font-mono font-semibold tabular-nums text-[#64748B]">
                          {inativosCount}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeView === 'codigo' && (
                <div>
                  <h2 className="mb-2.5 text-xs font-semibold text-[#475569]">
                    Estrutura Exo.WebApi
                  </h2>
                  <div className="divide-y divide-[#F1F5F9] rounded-lg border border-[#E2E8F0] bg-white">
                    {EXO_FILE_TEMPLATES.map((file) => {
                      const isSelected = selectedFileId === file.id;
                      const isNested = file.path.includes('/');
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setSelectedFileId(file.id)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-[#EFF6FF] font-semibold text-[#1D4ED8]'
                              : 'text-[#334155] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {file.id === 'cria-db' ? (
                            <Database className="h-3.5 w-3.5 shrink-0 text-[#475569]" />
                          ) : isNested ? (
                            <Folder className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
                          ) : (
                            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
                          )}
                          <span className="truncate font-mono">{file.path}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeView === 'guia' && (
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 space-y-3">
                  <h2 className="text-xs font-semibold text-[#0F172A]">
                    Resumo da Atividade 3
                  </h2>
                  <p className="text-xs leading-relaxed text-[#475569]">
                    Objetivo: conectar a Web API Exo.WebApi ao banco SQL Server ExoApi e validar o método GET Listar e o CRUD de Projetos no navegador.
                  </p>
                  <div className="border-t border-[#F1F5F9] pt-3 space-y-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenCodeFile('cria-db')}
                      className="block text-left font-medium text-[#2563EB] hover:underline"
                    >
                      Abrir script cria-db.sql
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenTesterEndpoint('listar')}
                      className="block text-left font-medium text-[#2563EB] hover:underline"
                    >
                      Testar GET /api/projetos
                    </button>
                  </div>
                </div>
              )}

              {/* Compact always-available table snapshot in sidebar */}
              {activeView === 'tester' && (
                <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#0F172A]">
                      Banco ExoApi
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveView('tabela')}
                      className="text-xs font-medium text-[#2563EB] hover:underline"
                    >
                      Ver tabela
                    </button>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-[#475569]">
                    <span className="font-mono tabular-nums font-semibold text-[#0F172A]">
                      {projetos.length}
                    </span>
                    <span>projetos</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-[#16A34A]">
                      {ativosCount} ativos
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Viewport */}
          <main className="min-w-0 flex-1">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeView === 'tester' && (
                <ApiTesterPanel
                  projetos={projetos}
                  selectedEndpointId={selectedEndpointId}
                  onSelectEndpoint={handleSelectEndpoint}
                  targetId={targetId}
                  onChangeTargetId={setTargetId}
                  requestBody={requestBody}
                  onChangeRequestBody={setRequestBody}
                  onDatabaseMutated={refreshProjetos}
                />
              )}

              {activeView === 'tabela' && (
                <ProjetosTablePanel
                  projetos={projetos}
                  isLoading={isLoadingTable}
                  onRefresh={refreshProjetos}
                  onResetDatabase={handleResetDatabase}
                  onTestProjectInApi={handleTestProjectInApi}
                />
              )}

              {activeView === 'codigo' && (
                <CodeExplorerPanel
                  selectedFileId={selectedFileId}
                  onSelectFile={setSelectedFileId}
                />
              )}

              {activeView === 'guia' && (
                <ActivityGuidePanel
                  onOpenCodeFile={handleOpenCodeFile}
                  onOpenTesterEndpoint={handleOpenTesterEndpoint}
                />
              )}
            </motion.div>
          </main>
        </div>

        {/* Clean Quiet Footer */}
        <footer className="border-t border-[#E2E8F0] bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-6 py-3 text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
            <span>ExoApi Workbench · Projeto Exo.WebApi e Banco SQL Server</span>
            <a
              href="/api/projetos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#2563EB] hover:underline"
            >
              GET /api/projetos
            </a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
