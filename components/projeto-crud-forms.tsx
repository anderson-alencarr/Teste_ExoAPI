'use client';

import React, { useState } from 'react';
import {
  Plus,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import type { Projeto } from '@/lib/exo-db';
import {
  buildInsomniaCollectionJson,
  buildPostmanCollectionJson,
} from '@/lib/insomnia-postman';

interface ProjetoCrudFormsProps {
  projetos: Projeto[];
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

export default function ProjetoCrudForms({
  projetos,
  onDatabaseMutated,
}: ProjetoCrudFormsProps) {
  // POST Form State
  const [postNome, setPostNome] = useState('');
  const [postArea, setPostArea] = useState('');
  const [postStatus, setPostStatus] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // PUT Form State
  const firstProjeto = projetos[0] ?? null;
  const [putSelectedId, setPutSelectedId] = useState<string>(
    firstProjeto ? String(firstProjeto.id) : ''
  );
  const [putNome, setPutNome] = useState<string>(
    firstProjeto ? firstProjeto.nomeDoProjeto : ''
  );
  const [putArea, setPutArea] = useState<string>(
    firstProjeto ? firstProjeto.area : ''
  );
  const [putStatus, setPutStatus] = useState<boolean>(
    firstProjeto ? firstProjeto.status : true
  );
  const [putError, setPutError] = useState<string | null>(null);
  const [isPutting, setIsPutting] = useState(false);

  // DELETE Form State
  const [deleteSelectedId, setDeleteSelectedId] = useState<string>(
    firstProjeto ? String(firstProjeto.id) : ''
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Last Backend Response Inspector
  const [lastResult, setLastResult] = useState<OperationResult | null>(null);

  function handleSelectPutId(rawId: string) {
    setPutSelectedId(rawId);
    setPutError(null);
    const found = projetos.find((p) => String(p.id) === rawId);
    if (found) {
      setPutNome(found.nomeDoProjeto);
      setPutArea(found.area);
      setPutStatus(found.status);
    }
  }

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPostError(null);

    if (!postNome.trim()) {
      setPostError('O campo NomeDoProjeto é obrigatório.');
      return;
    }
    if (!postArea.trim()) {
      setPostError('O campo Area é obrigatório.');
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeDoProjeto: postNome.trim(),
          area: postArea.trim(),
          status: postStatus,
        }),
      });

      const rawText = await response.text();
      const formatted = rawText
        ? JSON.stringify(JSON.parse(rawText), null, 2)
        : '';

      if (!response.ok) {
        const parsedErr = rawText ? (JSON.parse(rawText) as { erro?: string }) : null;
        setPostError(parsedErr?.erro ?? 'Erro ao cadastrar projeto.');
        setLastResult({
          method: 'POST',
          url: '/api/projetos',
          status: response.status,
          message: parsedErr?.erro ?? 'Falha na requisição POST.',
          payloadText: formatted,
          ok: false,
        });
        return;
      }

      setPostNome('');
      setPostArea('');
      setPostStatus(true);
      await onDatabaseMutated();

      setLastResult({
        method: 'POST',
        url: '/api/projetos',
        status: response.status,
        message: 'Novo projeto cadastrado com sucesso via POST /api/projetos.',
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
      setPutError('Informe ou selecione o Id do projeto.');
      return;
    }
    if (!putNome.trim()) {
      setPutError('O campo NomeDoProjeto é obrigatório.');
      return;
    }
    if (!putArea.trim()) {
      setPutError('O campo Area é obrigatório.');
      return;
    }

    const url = `/api/projetos/${putSelectedId.trim()}`;
    setIsPutting(true);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeDoProjeto: putNome.trim(),
          area: putArea.trim(),
          status: putStatus,
        }),
      });

      const rawText = await response.text();
      const formatted = rawText
        ? JSON.stringify(JSON.parse(rawText), null, 2)
        : '';

      if (!response.ok) {
        const parsedErr = rawText ? (JSON.parse(rawText) as { erro?: string }) : null;
        setPutError(parsedErr?.erro ?? `Erro HTTP ${response.status} ao atualizar.`);
        setLastResult({
          method: 'PUT',
          url,
          status: response.status,
          message: parsedErr?.erro ?? 'Projeto não encontrado ou dados inválidos.',
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
        message: `Projeto #${putSelectedId.trim()} atualizado com sucesso.`,
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
      setDeleteError('Informe ou selecione o Id do projeto para remover.');
      return;
    }

    const url = `/api/projetos/${deleteSelectedId.trim()}`;
    setIsDeleting(true);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const rawText = await response.text();
      let formatted = '// 204 No Content — Projeto removido com sucesso.';
      if (rawText.trim().length > 0) {
        try {
          formatted = JSON.stringify(JSON.parse(rawText), null, 2);
        } catch {
          formatted = rawText;
        }
      }

      if (!response.ok) {
        const parsedErr = rawText ? (JSON.parse(rawText) as { erro?: string }) : null;
        setDeleteError(parsedErr?.erro ?? `Erro HTTP ${response.status} ao remover.`);
        setLastResult({
          method: 'DELETE',
          url,
          status: response.status,
          message: parsedErr?.erro ?? 'Projeto não encontrado.',
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
        message: `Projeto #${deleteSelectedId.trim()} removido do banco de dados.`,
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
      'insomnia-exoapi-projetos.json',
      buildInsomniaCollectionJson(origin)
    );
  }

  function handleExportPostman() {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    downloadJsonFile(
      'postman-exoapi-projetos.json',
      buildPostmanCollectionJson(origin)
    );
  }

  const deletePreview = projetos.find(
    (p) => String(p.id) === deleteSelectedId.trim()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            Operações CRUD via Formulário · POST, PUT e DELETE
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] text-balance">
            Formulários de Manipulação de Projetos
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Execute as operações de cadastro, atualização e remoção diretamente pelos formulários ou exporte a coleção para testar no Insomnia ou Postman.
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
                POST /api/projetos
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                Cadastrar()
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-[#0F172A]">
              Adicionar Novo Projeto
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Envia um novo registro para o repositório e retorna 201 Created.
            </p>
          </div>

          <form
            onSubmit={handlePostSubmit}
            className="flex flex-1 flex-col justify-between space-y-4 p-5"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="post-nome"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  NomeDoProjeto
                </label>
                <input
                  id="post-nome"
                  type="text"
                  value={postNome}
                  onChange={(e) => setPostNome(e.target.value)}
                  placeholder="Ex.: Projeto F — Portal Mobile"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="post-area"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Area
                </label>
                <input
                  id="post-area"
                  type="text"
                  value={postArea}
                  onChange={(e) => setPostArea(e.target.value)}
                  placeholder="Ex.: Desenvolvimento Mobile"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                <span className="text-xs font-medium text-[#0F172A]">
                  Status inicial
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={postStatus}
                  onClick={() => setPostStatus((prev) => !prev)}
                  className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    postStatus
                      ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                      : 'border-[#CBD5E1] bg-white text-[#475569]'
                  }`}
                >
                  {postStatus ? 'Ativo (true)' : 'Inativo (false)'}
                </button>
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
                PUT /api/projetos/&#123;id&#125;
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                Atualizar()
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-[#0F172A]">
              Atualizar Projeto Existente
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Selecione um Id ou informe manualmente para atualizar os campos.
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
                    htmlFor="put-id-input"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Id
                  </label>
                  <input
                    id="put-id-input"
                    type="number"
                    min={1}
                    value={putSelectedId}
                    onChange={(e) => handleSelectPutId(e.target.value)}
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 font-mono text-sm tabular-nums text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="put-select"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Carregar registro
                  </label>
                  <select
                    id="put-select"
                    value={
                      projetos.some((p) => String(p.id) === putSelectedId)
                        ? putSelectedId
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) handleSelectPutId(e.target.value);
                    }}
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="">Selecionar projeto...</option>
                    {projetos.map((proj) => (
                      <option key={proj.id} value={String(proj.id)}>
                        #{proj.id} — {proj.nomeDoProjeto}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="put-nome"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  NomeDoProjeto
                </label>
                <input
                  id="put-nome"
                  type="text"
                  value={putNome}
                  onChange={(e) => setPutNome(e.target.value)}
                  placeholder="Novo nome do projeto"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="put-area"
                  className="mb-1.5 block text-xs font-medium text-[#334155]"
                >
                  Area
                </label>
                <input
                  id="put-area"
                  type="text"
                  value={putArea}
                  onChange={(e) => setPutArea(e.target.value)}
                  placeholder="Nova área"
                  className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                <span className="text-xs font-medium text-[#0F172A]">
                  Status atualizado
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={putStatus}
                  onClick={() => setPutStatus((prev) => !prev)}
                  className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    putStatus
                      ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                      : 'border-[#CBD5E1] bg-white text-[#475569]'
                  }`}
                >
                  {putStatus ? 'Ativo (true)' : 'Inativo (false)'}
                </button>
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
                DELETE /api/projetos/&#123;id&#125;
              </span>
              <span className="font-mono text-xs text-[#64748B]">
                Deletar()
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-[#0F172A]">
              Remover Projeto
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Remove o registro pelo Id e retorna 204 No Content ou 404.
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
                    htmlFor="delete-id-input"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Id
                  </label>
                  <input
                    id="delete-id-input"
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
                    htmlFor="delete-select"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Selecionar projeto
                  </label>
                  <select
                    id="delete-select"
                    value={
                      projetos.some((p) => String(p.id) === deleteSelectedId)
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
                    {projetos.map((proj) => (
                      <option key={proj.id} value={String(proj.id)}>
                        #{proj.id} — {proj.nomeDoProjeto}
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
                      <dt>Nome:</dt>
                      <dd className="truncate font-medium text-[#0F172A]">
                        {deletePreview.nomeDoProjeto}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Área:</dt>
                      <dd className="truncate">{deletePreview.area}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Status:</dt>
                      <dd
                        className={
                          deletePreview.status
                            ? 'text-[#16A34A]'
                            : 'text-[#64748B]'
                        }
                      >
                        {deletePreview.status ? 'Ativo' : 'Inativo'}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-2 text-[#64748B]">
                    Nenhum projeto com Id #{deleteSelectedId || '?'} encontrado
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

      {/* Insomnia & Postman Quick Reference */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Testes externos no Insomnia ou Postman
            </h2>
            <p className="mt-0.5 text-xs text-[#475569]">
              Importe a coleção acima ou configure manualmente as rotas abaixo apontando para a API em execução (<span className="font-mono text-[#0F172A]">/api/projetos</span> neste servidor ou <span className="font-mono text-[#0F172A]">http://localhost:5000/api/projetos</span> no <span className="font-mono text-[#0F172A]">dotnet run</span>).
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <th className="py-2 pr-4 font-medium">Método</th>
                <th className="py-2 pr-4 font-medium">Rota</th>
                <th className="py-2 pr-4 font-medium">Body (JSON)</th>
                <th className="py-2 font-medium">Status esperado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-mono">
              <tr>
                <td className="py-2 pr-4 font-semibold text-[#15803D]">GET</td>
                <td className="py-2 pr-4 text-[#0F172A]">/api/projetos</td>
                <td className="py-2 pr-4 font-sans text-[#64748B]">Sem corpo</td>
                <td className="py-2 tabular-nums text-[#16A34A]">200 OK</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-[#15803D]">GET</td>
                <td className="py-2 pr-4 text-[#0F172A]">/api/projetos/1</td>
                <td className="py-2 pr-4 font-sans text-[#64748B]">Sem corpo</td>
                <td className="py-2 tabular-nums text-[#16A34A]">200 OK / 404</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-[#1D4ED8]">POST</td>
                <td className="py-2 pr-4 text-[#0F172A]">/api/projetos</td>
                <td className="py-2 pr-4 text-[#334155]">
                  &#123;&quot;nomeDoProjeto&quot;, &quot;area&quot;, &quot;status&quot;&#125;
                </td>
                <td className="py-2 tabular-nums text-[#1D4ED8]">201 Created</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-[#B45309]">PUT</td>
                <td className="py-2 pr-4 text-[#0F172A]">/api/projetos/1</td>
                <td className="py-2 pr-4 text-[#334155]">
                  &#123;&quot;nomeDoProjeto&quot;, &quot;area&quot;, &quot;status&quot;&#125;
                </td>
                <td className="py-2 tabular-nums text-[#B45309]">200 OK / 204</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-[#B91C1C]">DELETE</td>
                <td className="py-2 pr-4 text-[#0F172A]">/api/projetos/1</td>
                <td className="py-2 pr-4 font-sans text-[#64748B]">Sem corpo</td>
                <td className="py-2 tabular-nums text-[#B91C1C]">204 No Content</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
