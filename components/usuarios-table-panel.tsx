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
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Usuario } from '@/lib/exo-seed';
import { downloadCriaDbSql } from '@/lib/sql-generator';

interface UsuariosTablePanelProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onResetDatabase: () => Promise<void>;
  onTestUsuarioInApi: (id: number) => void;
}

export default function UsuariosTablePanel({
  usuarios,
  isLoading,
  onRefresh,
  onResetDatabase,
  onTestUsuarioInApi,
}: UsuariosTablePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredUsuarios = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return usuarios;
    return usuarios.filter(
      (item) =>
        item.email.toLowerCase().includes(query) || String(item.id) === query
    );
  }, [usuarios, searchQuery]);

  function toggleReveal(id: number) {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function openCreateModal() {
    setModalMode('create');
    setEditingId(null);
    setEmail('');
    setSenha('');
    setFormError(null);
  }

  function openEditModal(usuario: Usuario) {
    setModalMode('edit');
    setEditingId(usuario.id);
    setEmail(usuario.email);
    setSenha(usuario.senha);
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

    if (!email.trim() || !email.includes('@')) {
      setFormError('Informe um endereço de e-mail válido.');
      return;
    }
    if (!senha.trim()) {
      setFormError('Informe a senha do usuário.');
      return;
    }

    setIsSaving(true);
    try {
      const url =
        modalMode === 'edit' && editingId !== null
          ? `/api/usuarios/${editingId}`
          : '/api/usuarios';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          senha,
        }),
      });

      if (!response.ok) {
        const errData = (await response.json().catch(() => null)) as {
          erro?: string;
        } | null;
        setFormError(errData?.erro ?? 'Erro ao salvar usuário no banco.');
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
      const response = await fetch(`/api/usuarios/${id}`, {
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
            Banco ExoApi · Tabela dbo.Usuarios
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] text-balance">
            Usuários Cadastrados no Banco
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Consulte, cadastre, edite e remova os usuários persistidos no endpoint /api/usuarios.
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
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Id ou e-mail..."
            className="w-full rounded-md border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="text-xs font-mono tabular-nums text-[#64748B]">
          {filteredUsuarios.length} usuário(s)
        </div>
      </div>

      {/* Data Grid */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#475569]">
                <th className="w-20 px-4 py-3 font-mono">Id</th>
                <th className="px-4 py-3">Email</th>
                <th className="w-44 px-4 py-3">Senha</th>
                <th className="w-56 px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-sm">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="h-11">
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-8 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-48 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-3.5 w-20 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="ml-auto h-3.5 w-24 animate-pulse rounded bg-[#E2E8F0]" />
                    </td>
                  </tr>
                ))
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-[#0F172A]">
                      Nenhum usuário encontrado na tabela Usuarios.
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {usuarios.length === 0
                        ? 'O banco de usuários está vazio. Cadastre um novo usuário ou restaure os dados iniciais.'
                        : 'Ajuste o termo de busca.'}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Cadastrar Primeiro Usuário</span>
                      </button>
                      {usuarios.length === 0 && (
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
                filteredUsuarios.map((usuario) => {
                  const isRevealed = revealedIds.includes(usuario.id);
                  return (
                    <tr
                      key={usuario.id}
                      className="h-11 transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-medium tabular-nums text-[#475569]">
                        #{usuario.id}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-[#0F172A]">
                        {usuario.email}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[#475569]">
                        <div className="inline-flex items-center gap-2">
                          <span>{isRevealed ? usuario.senha : '••••••'}</span>
                          <button
                            type="button"
                            aria-label="Mostrar ou ocultar senha"
                            onClick={() => toggleReveal(usuario.id)}
                            className="text-[#94A3B8] hover:text-[#0F172A]"
                          >
                            {isRevealed ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {confirmDeleteId === usuario.id ? (
                          <div className="inline-flex items-center justify-end gap-2">
                            <span className="text-xs text-[#DC2626]">
                              Confirmar?
                            </span>
                            <button
                              type="button"
                              disabled={deletingId === usuario.id}
                              onClick={() => handleDelete(usuario.id)}
                              className="rounded bg-[#DC2626] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#B91C1C]"
                            >
                              {deletingId === usuario.id ? '...' : 'Excluir'}
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
                              onClick={() => onTestUsuarioInApi(usuario.id)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF]"
                            >
                              <FlaskConical className="h-3.5 w-3.5" />
                              <span>Testar</span>
                            </button>
                            <button
                              type="button"
                              title="Editar usuário"
                              onClick={() => openEditModal(usuario)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              title="Excluir usuário"
                              onClick={() => setConfirmDeleteId(usuario.id)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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
            aria-labelledby="usuario-modal-title"
            className="w-full max-w-md rounded-lg border border-[#E2E8F0] bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <h2
                id="usuario-modal-title"
                className="text-base font-semibold text-[#0F172A]"
              >
                {modalMode === 'edit'
                  ? `Editar Usuário #${editingId}`
                  : 'Cadastrar Novo Usuário'}
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
                  htmlFor="modal-user-email"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Email
                </label>
                <input
                  id="modal-user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex.: email_tres@sp.br"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="modal-user-senha"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Senha
                </label>
                <input
                  id="modal-user-senha"
                  type="text"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Ex.: 1234"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
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
                    : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
