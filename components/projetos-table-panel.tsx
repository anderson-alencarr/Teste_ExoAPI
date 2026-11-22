'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FlaskConical,
  X,
  RotateCcw,
  AlertCircle,
  Download,
} from 'lucide-react';
import type { Projeto } from '@/lib/exo-db';
import { downloadCriaDbSql } from '@/lib/sql-generator';

interface ProjetosTablePanelProps {
  projetos: Projeto[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onResetDatabase: () => Promise<void>;
  onTestProjectInApi: (id: number) => void;
}

type StatusFilter = 'todos' | 'ativos' | 'inativos';

export default function ProjetosTablePanel({
  projetos,
  isLoading,
  onRefresh,
  onResetDatabase,
  onTestProjectInApi,
}: ProjetosTablePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nomeDoProjeto, setNomeDoProjeto] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredProjetos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return projetos.filter((item) => {
      if (statusFilter === 'ativos' && !item.status) return false;
      if (statusFilter === 'inativos' && item.status) return false;
      if (!query) return true;
      return (
        item.nomeDoProjeto.toLowerCase().includes(query) ||
        item.area.toLowerCase().includes(query) ||
        String(item.id) === query
      );
    });
  }, [projetos, searchQuery, statusFilter]);

  function openCreateModal() {
    setModalMode('create');
    setEditingId(null);
    setNomeDoProjeto('');
    setArea('');
    setStatus(true);
    setFormError(null);
  }

  function openEditModal(projeto: Projeto) {
    setModalMode('edit');
    setEditingId(projeto.id);
    setNomeDoProjeto(projeto.nomeDoProjeto);
    setArea(projeto.area);
    setStatus(projeto.status);
    setFormError(null);
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!nomeDoProjeto.trim()) {
      setFormError('Informe o nome do projeto.');
      return;
    }
    if (!area.trim()) {
      setFormError('Informe a área de atuação.');
      return;
    }

    setIsSaving(true);
    try {
      const url =
        modalMode === 'edit' && editingId !== null
          ? `/api/projetos/${editingId}`
          : '/api/projetos';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeDoProjeto: nomeDoProjeto.trim(),
          area: area.trim(),
          status,
        }),
      });

      if (!response.ok) {
        const errData = (await response.json().catch(() => null)) as {
          erro?: string;
        } | null;
        setFormError(errData?.erro ?? 'Erro ao salvar registro no banco.');
        return;
      }

      await onRefresh();
      closeModal();
    } catch {
      setFormError('Não foi possível conectar ao endpoint da API.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/projetos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConfirmDeleteId(null);
        await onRefresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            Banco ExoApi · Tabela dbo.Projetos
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] text-balance">
            Registros no Banco de Dados
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Visualize e gerencie diretamente os projetos cadastrados pelo script cria-db.sql e manipulados pela API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => downloadCriaDbSql()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-[#475569]" />
            <span>Baixar cria-db.sql</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Id, nome ou área..."
            className="w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-md bg-[#F1F5F9] p-1 self-start sm:self-auto">
          {(
            [
              { id: 'todos', label: 'Todos' },
              { id: 'ativos', label: 'Ativos' },
              { id: 'inativos', label: 'Inativos' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Grid */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#475569]">
                <th className="w-20 px-4 py-3 font-mono">Id</th>
                <th className="px-4 py-3">NomeDoProjeto</th>
                <th className="px-4 py-3">Area</th>
                <th className="w-32 px-4 py-3">Status</th>
                <th className="w-56 px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="h-11">
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-8 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-48 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-32 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-16 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="ml-auto h-3.5 w-24 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                  </tr>
                ))
              ) : filteredProjetos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-[#0F172A]">
                      Nenhum projeto encontrado na tabela Projetos.
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {projetos.length === 0
                        ? 'O banco está vazio no momento. Cadastre um novo registro ou restaure os dados de cria-db.sql.'
                        : 'Ajuste o termo de busca ou o filtro de status.'}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Cadastrar Primeiro Projeto</span>
                      </button>
                      {projetos.length === 0 && (
                        <button
                          type="button"
                          onClick={onResetDatabase}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restaurar Banco</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjetos.map((projeto) => (
                  <tr
                    key={projeto.id}
                    className="h-11 transition-colors hover:bg-[#F8FAFC]"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-medium tabular-nums text-[#475569]">
                      #{projeto.id}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[#0F172A]">
                      {projeto.nomeDoProjeto}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#475569]">
                      {projeto.area}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium">
                      <span
                        className={
                          projeto.status ? 'text-[#16A34A]' : 'text-[#64748B]'
                        }
                      >
                        {projeto.status ? 'Ativo (1)' : 'Inativo (0)'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {confirmDeleteId === projeto.id ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <span className="text-xs text-[#DC2626]">
                            Confirmar?
                          </span>
                          <button
                            type="button"
                            disabled={deletingId === projeto.id}
                            onClick={() => handleDelete(projeto.id)}
                            className="rounded bg-[#DC2626] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#B91C1C]"
                          >
                            {deletingId === projeto.id ? '...' : 'Excluir'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Testar GET por Id no Testador API"
                            onClick={() => onTestProjectInApi(projeto.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF]"
                          >
                            <FlaskConical className="h-3.5 w-3.5" />
                            <span>Testar</span>
                          </button>
                          <button
                            type="button"
                            title="Editar projeto"
                            onClick={() => openEditModal(projeto)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            title="Excluir projeto"
                            onClick={() => setConfirmDeleteId(projeto.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="projeto-modal-title"
            className="w-full max-w-md rounded-lg border border-[#E2E8F0] bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <h2
                id="projeto-modal-title"
                className="text-base font-semibold text-[#0F172A]"
              >
                {modalMode === 'edit'
                  ? `Editar Projeto #${editingId}`
                  : 'Cadastrar Novo Projeto'}
              </h2>
              <button
                type="button"
                aria-label="Fechar janela"
                onClick={closeModal}
                className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="nome-projeto-input"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  NomeDoProjeto
                </label>
                <input
                  id="nome-projeto-input"
                  type="text"
                  value={nomeDoProjeto}
                  onChange={(e) => setNomeDoProjeto(e.target.value)}
                  placeholder="Ex.: Projeto F — Gestão de Frotas"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="area-projeto-input"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Area
                </label>
                <input
                  id="area-projeto-input"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ex.: Tecnologia da Informação"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-medium text-[#0F172A]">Status</p>
                  <p className="text-xs text-[#64748B]">
                    Define se o projeto está ativo (true / BIT 1)
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={status}
                  onClick={() => setStatus((prev) => !prev)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    status
                      ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                      : 'border-[#CBD5E1] bg-white text-[#475569]'
                  }`}
                >
                  {status ? 'Ativo (true)' : 'Inativo (false)'}
                </button>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#DC2626]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {isSaving
                    ? 'Salvando...'
                    : modalMode === 'edit'
                    ? 'Salvar Alterações'
                    : 'Cadastrar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
