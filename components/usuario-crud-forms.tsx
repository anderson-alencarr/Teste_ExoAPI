'use client';

import React, { useState } from 'react';
import {
  Plus,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Usuario } from '@/lib/exo-seed';
import {
  buildInsomniaCollectionJson,
  buildPostmanCollectionJson,
} from '@/lib/insomnia-postman';

interface UsuarioCrudFormsProps {
  usuarios: Usuario[];
  onDatabaseMutated: () => Promise<void>;
}

interface OperationResult {
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  status: number;
  message: string;
  payloadText: string;
  ok: boolean;
}

function downloadJsonFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function UsuarioCrudForms({
  usuarios,
  onDatabaseMutated,
}: UsuarioCrudFormsProps) {
  // POST Form State
  const [postEmail, setPostEmail] = useState('');
  const [postSenha, setPostSenha] = useState('');
  const [showPostSenha, setShowPostSenha] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // PUT Form State
  const firstUsuario = usuarios[0] ?? null;
  const [putSelectedId, setPutSelectedId] = useState<string>(
    firstUsuario ? String(firstUsuario.id) : ''
  );
  const [putEmail, setPutEmail] = useState<string>(
    firstUsuario ? firstUsuario.email : ''
  );
  const [putSenha, setPutSenha] = useState<string>(
    firstUsuario ? firstUsuario.senha : ''
  );
  const [showPutSenha, setShowPutSenha] = useState(false);
  const [putError, setPutError] = useState<string | null>(null);
  const [isPutting, setIsPutting] = useState(false);

  // DELETE Form State
  const [deleteSelectedId, setDeleteSelectedId] = useState<string>(
    firstUsuario ? String(firstUsuario.id) : ''
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Last Backend Response Inspector
  const [lastResult, setLastResult] = useState<OperationResult | null>(null);

  function handleSelectPutId(rawId: string) {
    setPutSelectedId(rawId);
    setPutError(null);
    const found = usuarios.find((u) => String(u.id) === rawId);
    if (found) {
      setPutEmail(found.email);
      setPutSenha(found.senha);
    }
  }

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPostError(null);

    if (!postEmail.trim() || !postEmail.includes('@')) {
      setPostError('Informe um endereço de e-mail válido.');
      return;
    }
    if (!postSenha.trim()) {
      setPostError('O campo Senha é obrigatório.');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: postEmail.trim(),
          senha: postSenha,
        }),
      });

      const rawText = await response.text();
      const formatted = rawText
        ? JSON.stringify(JSON.parse(rawText), null, 2)
        : '';

      if (!response.ok) {
        const parsedErr = rawText
          ? (JSON.parse(rawText) as { erro?: string })
          : null;
        setPostError(parsedErr?.erro ?? 'Erro ao cadastrar usuário.');
        setLastResult({
          method: 'POST',
          url: '/api/usuarios',
          status: response.status,
          message: parsedErr?.erro ?? 'Falha na requisição POST.',
          payloadText: formatted,
          ok: false,
        });
        return;
      }

      setPostEmail('');
      setPostSenha('');
      await onDatabaseMutated();

      setLastResult({
        method: 'POST',
        url: '/api/usuarios',
        status: response.status,
        message: 'Novo usuário cadastrado com sucesso via POST /api/usuarios.',
        payloadText: formatted,
        ok: true,
      });
    } catch {
      setPostError('Não foi possível conectar ao servidor da API.');
    } finally {
      setIsPosting(false);
    }
  }

  async function handlePutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPutError(null);

    if (!putSelectedId.trim()) {
      setPutError('Informe ou selecione o Id do usuário.');
      return;
    }
    if (!putEmail.trim() || !putEmail.includes('@')) {
      setPutError('Informe um endereço de e-mail válido.');
      return;
    }
    if (!putSenha.trim()) {
      setPutError('O campo Senha é obrigatório.');
      return;
    }

    const url = `/api/usuarios/${putSelectedId.trim()}`;
    setIsPutting(true);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: putEmail.trim(),
          senha: putSenha,
        }),
      });

      const rawText = await response.text();
      let formatted = '// 204 No Content — Usuário atualizado com sucesso.';
      if (rawText.trim().length > 0) {
        try {
          formatted = JSON.stringify(JSON.parse(rawText), null, 2);
        } catch {
          formatted = rawText;
        }
      }

      if (!response.ok) {
        const parsedErr = rawText
          ? (JSON.parse(rawText) as { erro?: string })
          : null;
        setPutError(
          parsedErr?.erro ?? `Erro HTTP ${response.status} ao atualizar.`
        );
        setLastResult({
          method: 'PUT',
          url,
          status: response.status,
          message: parsedErr?.erro ?? 'Usuário não encontrado ou dados inválidos.',
          payloadText: formatted,
          ok: false,
        });
        return;
      }

      await onDatabaseMutated();
      setLastResult({
        method: 'PUT',
        url,
        status: response.status,
        message: `Usuário #${putSelectedId.trim()} atualizado com sucesso.`,
        payloadText: formatted,
        ok: true,
      });
    } catch {
      setPutError('Não foi possível conectar ao servidor da API.');
    } finally {
      setIsPutting(false);
    }
  }

  async function handleDeleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError(null);

    if (!deleteSelectedId.trim()) {
      setDeleteError('Informe ou selecione o Id do usuário para remover.');
      return;
    }

    const url = `/api/usuarios/${deleteSelectedId.trim()}`;
    setIsDeleting(true);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const rawText = await response.text();
      let formatted = '// 204 No Content — Usuário removido com sucesso.';
      if (rawText.trim().length > 0) {
        try {
          formatted = JSON.stringify(JSON.parse(rawText), null, 2);
        } catch {
          formatted = rawText;
        }
      }

      if (!response.ok) {
        const parsedErr = rawText
          ? (JSON.parse(rawText) as { erro?: string })
          : null;
        setDeleteError(
          parsedErr?.erro ?? `Erro HTTP ${response.status} ao remover.`
        );
        setLastResult({
          method: 'DELETE',
          url,
          status: response.status,
          message: parsedErr?.erro ?? 'Usuário não encontrado.',
          payloadText: formatted,
          ok: false,
        });
        return;
      }

      await onDatabaseMutated();
      setLastResult({
        method: 'DELETE',
        url,
        status: response.status,
        message: `Usuário #${deleteSelectedId.trim()} removido do banco de dados.`,
        payloadText: formatted,
        ok: true,
      });
    } catch {
      setDeleteError('Não foi possível conectar ao servidor da API.');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleExportInsomnia() {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    downloadJsonFile(
      'insomnia-exoapi-completo.json',
      buildInsomniaCollectionJson(origin)
    );
  }

  function handleExportPostman() {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    downloadJsonFile(
      'postman-exoapi-completo.json',
      buildPostmanCollectionJson(origin)
    );
  }

  const deletePreview = usuarios.find(
    (u) => String(u.id) === deleteSelectedId.trim()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            UsuariosController · POST, PUT e DELETE em /api/usuarios
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] text-balance">
            Formulários de Manipulação de Usuários
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Cadastre, atualize ou remova usuários diretamente pelos formulários ou exporte a coleção para o Insomnia e Postman.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportInsomnia}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-[#475569]" />
            <span>Exportar Insomnia</span>
          </button>
          <button
            type="button"
            onClick={handleExportPostman}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-[#475569]" />
            <span>Exportar Postman</span>
          </button>
        </div>
      </div>

      {/* Live Backend Operation Result Banner */}
      {lastResult && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3">
            <div className="flex items-center gap-2.5 text-xs">
              {lastResult.ok ? (
                <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
              )}
              <span className="font-mono font-semibold text-[#0F172A]">
                {lastResult.method} {lastResult.url}
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  lastResult.ok ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                HTTP {lastResult.status}
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <span className="text-[#475569]">{lastResult.message}</span>
            </div>
          </div>
          <pre className="max-h-48 overflow-auto bg-[#F8FAFC] p-3.5 font-mono text-xs text-[#0F172A]">
            {lastResult.payloadText}
          </pre>
        </div>
      )}

      {/* Three CRUD Form Panels */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* 1. POST Form */}
        <section className="flex flex-col rounded-lg border border-[#E2E8F0] bg-white">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
                POST /api/usuarios
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                Cadastrar()
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-[#0F172A]">
              Adicionar Novo Usuário
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Envia Email e Senha para o repositório e retorna 201 Created.
            </p>
          </div>

          <form
            onSubmit={handlePostSubmit}
            className="flex flex-1 flex-col justify-between space-y-4 p-5"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="post-user-email"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Email
                </label>
                <input
                  id="post-user-email"
                  type="email"
                  value={postEmail}
                  onChange={(e) => setPostEmail(e.target.value)}
                  placeholder="Ex.: email_tres@sp.br"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="post-user-senha"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="post-user-senha"
                    type={showPostSenha ? 'text' : 'password'}
                    value={postSenha}
                    onChange={(e) => setPostSenha(e.target.value)}
                    placeholder="Ex.: 1234"
                    className="w-full rounded-md border border-[#CBD5E1] bg-white py-2 pl-3 pr-9 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Alternar visibilidade da senha"
                    onClick={() => setShowPostSenha((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                  >
                    {showPostSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {postError && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#DC2626]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{postError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPosting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isPosting ? 'Enviando POST...' : 'Cadastrar via POST'}</span>
            </button>
          </form>
        </section>

        {/* 2. PUT Form */}
        <section className="flex flex-col rounded-lg border border-[#E2E8F0] bg-white">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#B45309]">
                PUT /api/usuarios/&#123;id&#125;
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                Atualizar()
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-[#0F172A]">
              Atualizar Usuário Existente
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Selecione um Id para alterar Email e Senha (retorna 204).
            </p>
          </div>

          <form
            onSubmit={handlePutSubmit}
            className="flex flex-1 flex-col justify-between space-y-4 p-5"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label
                    htmlFor="put-user-id-input"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Id
                  </label>
                  <input
                    id="put-user-id-input"
                    type="number"
                    min={1}
                    value={putSelectedId}
                    onChange={(e) => handleSelectPutId(e.target.value)}
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 font-mono text-sm tabular-nums text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="put-user-select"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Carregar usuário
                  </label>
                  <select
                    id="put-user-select"
                    value={
                      usuarios.some((u) => String(u.id) === putSelectedId)
                        ? putSelectedId
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) handleSelectPutId(e.target.value);
                    }}
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="">Selecionar usuário...</option>
                    {usuarios.map((user) => (
                      <option key={user.id} value={String(user.id)}>
                        #{user.id} — {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="put-user-email"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Email
                </label>
                <input
                  id="put-user-email"
                  type="email"
                  value={putEmail}
                  onChange={(e) => setPutEmail(e.target.value)}
                  placeholder="Ex.: email_quatro@sp.br"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="put-user-senha"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="put-user-senha"
                    type={showPutSenha ? 'text' : 'password'}
                    value={putSenha}
                    onChange={(e) => setPutSenha(e.target.value)}
                    placeholder="Ex.: 4321"
                    className="w-full rounded-md border border-[#CBD5E1] bg-white py-2 pl-3 pr-9 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Alternar visibilidade da senha"
                    onClick={() => setShowPutSenha((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                  >
                    {showPutSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {putError && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#DC2626]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{putError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPutting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E293B] disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isPutting ? 'Enviando PUT...' : 'Atualizar via PUT'}</span>
            </button>
          </form>
        </section>

        {/* 3. DELETE Form */}
        <section className="flex flex-col rounded-lg border border-[#E2E8F0] bg-white">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#B91C1C]">
                DELETE /api/usuarios/&#123;id&#125;
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                Deletar()
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-[#0F172A]">
              Remover Usuário
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Remove o usuário pelo Id e retorna 204 No Content ou 404.
            </p>
          </div>

          <form
            onSubmit={handleDeleteSubmit}
            className="flex flex-1 flex-col justify-between space-y-4 p-5"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label
                    htmlFor="delete-user-id-input"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Id
                  </label>
                  <input
                    id="delete-user-id-input"
                    type="number"
                    min={1}
                    value={deleteSelectedId}
                    onChange={(e) => {
                      setDeleteSelectedId(e.target.value);
                      setDeleteError(null);
                    }}
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 font-mono text-sm tabular-nums text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="delete-user-select"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Selecionar usuário
                  </label>
                  <select
                    id="delete-user-select"
                    value={
                      usuarios.some((u) => String(u.id) === deleteSelectedId)
                        ? deleteSelectedId
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setDeleteSelectedId(e.target.value);
                        setDeleteError(null);
                      }
                    }}
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="">Selecionar registro...</option>
                    {usuarios.map((user) => (
                      <option key={user.id} value={String(user.id)}>
                        #{user.id} — {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs">
                <p className="font-semibold text-[#0F172A]">
                  Pré-visualização do alvo
                </p>
                {deletePreview ? (
                  <dl className="mt-2 space-y-1.5 text-[#475569]">
                    <div className="flex justify-between gap-2">
                      <dt>Id:</dt>
                      <dd className="font-mono tabular-nums text-[#0F172A]">
                        #{deletePreview.id}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Email:</dt>
                      <dd className="truncate font-medium text-[#0F172A]">
                        {deletePreview.email}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-2 text-[#64748B]">
                    Nenhum usuário com Id #{deleteSelectedId || '?'} encontrado
                    atualmente (ao enviar, a API retornará 404 Not Found).
                  </p>
                )}
              </div>

              {deleteError && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#DC2626]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isDeleting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#DC2626] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>
                {isDeleting ? 'Enviando DELETE...' : 'Remover via DELETE'}
              </span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
