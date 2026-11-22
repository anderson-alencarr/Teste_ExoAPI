'use client';

import React, { useState } from 'react';
import {
  Play,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import type { Projeto } from '@/lib/exo-db';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface EndpointPreset {
  id: string;
  method: HttpMethod;
  pathPattern: string;
  controllerMethod: string;
  label: string;
  description: string;
  requiresId: boolean;
  requiresBody: boolean;
}

export const ENDPOINT_PRESETS: EndpointPreset[] = [
  {
    id: 'listar',
    method: 'GET',
    pathPattern: '/api/projetos',
    controllerMethod: 'Listar()',
    label: 'Listar projetos',
    description: 'Retorna todos os registros da tabela Projetos.',
    requiresId: false,
    requiresBody: false,
  },
  {
    id: 'buscar-id',
    method: 'GET',
    pathPattern: '/api/projetos/{id}',
    controllerMethod: 'BuscarPorId(int id)',
    label: 'Buscar por Id',
    description: 'Retorna um único projeto pelo identificador ou 404.',
    requiresId: true,
    requiresBody: false,
  },
  {
    id: 'cadastrar',
    method: 'POST',
    pathPattern: '/api/projetos',
    controllerMethod: 'Cadastrar(Projeto projeto)',
    label: 'Cadastrar projeto',
    description: 'Insere um novo projeto e retorna status 201 Created.',
    requiresId: false,
    requiresBody: true,
  },
  {
    id: 'atualizar',
    method: 'PUT',
    pathPattern: '/api/projetos/{id}',
    controllerMethod: 'Atualizar(int id, Projeto projeto)',
    label: 'Atualizar projeto',
    description: 'Atualiza NomeDoProjeto, Area e Status pelo Id.',
    requiresId: true,
    requiresBody: true,
  },
  {
    id: 'deletar',
    method: 'DELETE',
    pathPattern: '/api/projetos/{id}',
    controllerMethod: 'Deletar(int id)',
    label: 'Deletar projeto',
    description: 'Remove um projeto existente e retorna 204 No Content.',
    requiresId: true,
    requiresBody: false,
  },
];

export const DEFAULT_POST_BODY = JSON.stringify(
  {
    nomeDoProjeto: 'Projeto F — Plataforma Mobile',
    area: 'Desenvolvimento Mobile',
    status: true,
  },
  null,
  2
);

export interface RequestHistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  durationMs: number;
  timestamp: string;
}

interface ApiTesterPanelProps {
  projetos: Projeto[];
  selectedEndpointId: string;
  onSelectEndpoint: (id: string) => void;
  targetId: string;
  onChangeTargetId: (id: string) => void;
  requestBody: string;
  onChangeRequestBody: (body: string) => void;
  onDatabaseMutated: () => Promise<void>;
}

function methodColorClass(method: HttpMethod): string {
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

function statusColorClass(status: number): string {
  if (status >= 200 && status < 300) return 'text-[#16A34A]';
  if (status >= 400 && status < 500) return 'text-[#D97706]';
  return 'text-[#DC2626]';
}

function parseBodyFields(body: string): {
  nomeDoProjeto: string;
  area: string;
  status: boolean;
} {
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    return {
      nomeDoProjeto:
        typeof parsed.nomeDoProjeto === 'string'
          ? parsed.nomeDoProjeto
          : typeof parsed.NomeDoProjeto === 'string'
          ? parsed.NomeDoProjeto
          : '',
      area:
        typeof parsed.area === 'string'
          ? parsed.area
          : typeof parsed.Area === 'string'
          ? parsed.Area
          : '',
      status:
        typeof parsed.status === 'boolean'
          ? parsed.status
          : typeof parsed.Status === 'boolean'
          ? parsed.Status
          : true,
    };
  } catch {
    return { nomeDoProjeto: '', area: '', status: true };
  }
}

async function dispatchApiRequest(params: {
  url: string;
  method: HttpMethod;
  requiresBody: boolean;
  body: string;
}) {
  const startedAt = Date.now();
  const response = await fetch(params.url, {
    method: params.method,
    headers: params.requiresBody
      ? { 'Content-Type': 'application/json' }
      : undefined,
    body: params.requiresBody ? params.body : undefined,
    cache: 'no-store',
  });

  const durationMs = Math.max(1, Date.now() - startedAt);
  const rawText = await response.text();
  let formattedBody = rawText;

  if (rawText.trim().length > 0) {
    try {
      formattedBody = JSON.stringify(JSON.parse(rawText), null, 2);
    } catch {
      formattedBody = rawText;
    }
  } else if (response.status === 204) {
    formattedBody =
      '// 204 No Content — Operação concluída sem corpo de resposta.';
  }

  const contentType =
    response.headers.get('content-type') ?? 'application/json; charset=utf-8';

  const timestamp = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    status: response.status,
    statusText:
      response.statusText || (response.status === 204 ? 'No Content' : 'OK'),
    durationMs,
    contentType,
    bodyText: formattedBody,
    timestamp,
  };
}

export default function ApiTesterPanel({
  projetos,
  selectedEndpointId,
  onSelectEndpoint,
  targetId,
  onChangeTargetId,
  requestBody,
  onChangeRequestBody,
  onDatabaseMutated,
}: ApiTesterPanelProps) {
  const activePreset =
    ENDPOINT_PRESETS.find((item) => item.id === selectedEndpointId) ??
    ENDPOINT_PRESETS[0];

  const [bodyInputMode, setBodyInputMode] = useState<'form' | 'json'>('form');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const [responseState, setResponseState] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    contentType: string;
    bodyText: string;
    url: string;
    method: HttpMethod;
  }>(() => ({
    status: 200,
    statusText: 'OK',
    durationMs: 4,
    contentType: 'application/json; charset=utf-8',
    bodyText: JSON.stringify(projetos, null, 2),
    url: '/api/projetos',
    method: 'GET',
  }));

  const [history, setHistory] = useState<RequestHistoryItem[]>([]);

  const resolvedUrl = activePreset.requiresId
    ? `/api/projetos/${targetId.trim() || '1'}`
    : '/api/projetos';

  const formFields = parseBodyFields(requestBody);

  function updateFormField(
    patch: Partial<{ nomeDoProjeto: string; area: string; status: boolean }>
  ) {
    const next = {
      ...formFields,
      ...patch,
    };
    onChangeRequestBody(JSON.stringify(next, null, 2));
    if (jsonError) setJsonError(null);
  }

  function handleSelectEndpointInternal(id: string) {
    setJsonError(null);
    onSelectEndpoint(id);
  }

  function handleTargetIdChange(newId: string) {
    onChangeTargetId(newId);
    if (activePreset.id === 'atualizar') {
      const numericId = Number(newId);
      const match = projetos.find((p) => p.id === numericId);
      if (match) {
        onChangeRequestBody(
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

  async function executeRequest() {
    const preset = activePreset;
    const url = preset.requiresId
      ? `/api/projetos/${targetId.trim() || '1'}`
      : '/api/projetos';

    setJsonError(null);

    if (preset.requiresBody) {
      try {
        JSON.parse(requestBody);
      } catch {
        setJsonError(
          'JSON inválido no corpo da requisição. Verifique aspas duplas e vírgulas.'
        );
        return;
      }
    }

    setIsSending(true);

    try {
      const result = await dispatchApiRequest({
        url,
        method: preset.method,
        requiresBody: preset.requiresBody,
        body: requestBody,
      });

      setResponseState({
        status: result.status,
        statusText: result.statusText,
        durationMs: result.durationMs,
        contentType: result.contentType,
        bodyText: result.bodyText,
        url,
        method: preset.method,
      });

      setHistory((prev) => [
        {
          id: `${result.timestamp}-${prev.length + 1}`,
          method: preset.method,
          url,
          status: result.status,
          statusText: result.statusText,
          durationMs: result.durationMs,
          timestamp: result.timestamp,
        },
        ...prev.slice(0, 7),
      ]);

      if (preset.method !== 'GET') {
        await onDatabaseMutated();
      }
    } catch {
      setJsonError('Falha ao comunicar com o servidor da API.');
    } finally {
      setIsSending(false);
    }
  }

  async function handleCopyResponse() {
    if (!responseState.bodyText) return;
    try {
      await navigator.clipboard.writeText(responseState.bodyText);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 1800);
    } catch {
      // Clipboard blocked in some contexts
    }
  }

  async function handleCopyCurl() {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const fullUrl = `${origin}${resolvedUrl}`;
    const curlParts = [`curl -X ${activePreset.method} "${fullUrl}"`];
    if (activePreset.requiresBody) {
      curlParts.push(`-H "Content-Type: application/json"`);
      curlParts.push(`-d '${requestBody.replace(/\n/g, ' ')}'`);
    }
    try {
      await navigator.clipboard.writeText(curlParts.join(' \\\n  '));
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 1800);
    } catch {
      // Ignore clipboard error
    }
  }

  function handleFormatJson() {
    try {
      const parsed = JSON.parse(requestBody);
      onChangeRequestBody(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      setJsonError('Não foi possível formatar: JSON inválido.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            ProjetosController · {activePreset.controllerMethod}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] text-balance">
            Testador da API no Navegador
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            {activePreset.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyCurl}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9] whitespace-nowrap"
          >
            {copiedCurl ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>cURL copiado</span>
              </>
            ) : (
              <>
                <Terminal className="h-3.5 w-3.5 text-[#475569]" />
                <span>Copiar cURL (Insomnia)</span>
              </>
            )}
          </button>

          <a
            href="/api/projetos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9] whitespace-nowrap"
          >
            <span>Abrir /api/projetos no navegador</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#475569]" />
          </a>
        </div>
      </div>

      {/* Mobile endpoint selector (desktop uses sidebar) */}
      <div className="flex flex-wrap gap-1.5 lg:hidden">
        {ENDPOINT_PRESETS.map((preset) => {
          const isActive = preset.id === activePreset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectEndpointInternal(preset.id)}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              }`}
            >
              <span
                className={`font-mono font-semibold ${methodColorClass(
                  preset.method
                )}`}
              >
                {preset.method}
              </span>
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Request Bar */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center rounded-md border border-[#CBD5E1] bg-[#F8FAFC]">
            <span
              className={`border-r border-[#E2E8F0] px-3.5 py-2.5 font-mono text-xs font-semibold whitespace-nowrap shrink-0 ${methodColorClass(
                activePreset.method
              )}`}
            >
              {activePreset.method}
            </span>
            <span className="truncate px-3.5 py-2.5 font-mono text-sm text-[#0F172A]">
              {resolvedUrl}
            </span>
          </div>

          {activePreset.requiresId && (
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="projeto-id-input"
                className="text-xs font-medium text-[#475569] whitespace-nowrap"
              >
                Id:
              </label>
              <input
                id="projeto-id-input"
                type="number"
                min={1}
                value={targetId}
                onChange={(e) => handleTargetIdChange(e.target.value)}
                className="w-20 rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 font-mono text-sm tabular-nums text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              {projetos.length > 0 && (
                <select
                  aria-label="Selecionar projeto existente"
                  value={
                    projetos.some((p) => String(p.id) === targetId) ? targetId : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) handleTargetIdChange(e.target.value);
                  }}
                  className="max-w-[180px] rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 text-xs text-[#334155] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="">Escolher registro...</option>
                  {projetos.map((proj) => (
                    <option key={proj.id} value={String(proj.id)}>
                      #{proj.id} — {proj.nomeDoProjeto}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={isSending}
            onClick={executeRequest}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{isSending ? 'Executando...' : 'Enviar Requisição'}</span>
          </button>
        </div>

        {/* Request Body Editor (Form or Raw JSON) for POST / PUT */}
        {activePreset.requiresBody && (
          <div className="mt-4 border-t border-[#E2E8F0] pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-md bg-[#F1F5F9] p-1">
                <button
                  type="button"
                  onClick={() => setBodyInputMode('form')}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    bodyInputMode === 'form'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  Formulário
                </button>
                <button
                  type="button"
                  onClick={() => setBodyInputMode('json')}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    bodyInputMode === 'json'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  JSON Bruto
                </button>
              </div>

              <div className="flex items-center gap-3">
                {bodyInputMode === 'json' && (
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="text-xs font-medium text-[#2563EB] hover:underline whitespace-nowrap"
                  >
                    Formatar JSON
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onChangeRequestBody(DEFAULT_POST_BODY);
                    setJsonError(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#0F172A] whitespace-nowrap"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Exemplo padrão</span>
                </button>
              </div>
            </div>

            {bodyInputMode === 'form' ? (
              <div className="grid grid-cols-1 gap-4 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="tester-nome-input"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    NomeDoProjeto
                  </label>
                  <input
                    id="tester-nome-input"
                    type="text"
                    value={formFields.nomeDoProjeto}
                    onChange={(e) =>
                      updateFormField({ nomeDoProjeto: e.target.value })
                    }
                    placeholder="Nome do projeto"
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tester-area-input"
                    className="mb-1.5 block text-xs font-medium text-[#334155]"
                  >
                    Area
                  </label>
                  <input
                    id="tester-area-input"
                    type="text"
                    value={formFields.area}
                    onChange={(e) => updateFormField({ area: e.target.value })}
                    placeholder="Área do projeto"
                    className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-[#334155]">
                    Status
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formFields.status}
                    onClick={() =>
                      updateFormField({ status: !formFields.status })
                    }
                    className={`w-full rounded-md border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                      formFields.status
                        ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                        : 'border-[#CBD5E1] bg-white text-[#475569]'
                    }`}
                  >
                    {formFields.status ? 'Ativo (true)' : 'Inativo (false)'}
                  </button>
                </div>
              </div>
            ) : (
              <textarea
                value={requestBody}
                onChange={(e) => {
                  onChangeRequestBody(e.target.value);
                  if (jsonError) setJsonError(null);
                }}
                rows={7}
                spellCheck={false}
                className="w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] p-3 font-mono text-xs leading-relaxed text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
              />
            )}

            {jsonError && (
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#DC2626]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Inspector */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-[#0F172A]">Resposta HTTP</span>
            <span aria-hidden="true" className="text-[#CBD5E1]">
              /
            </span>
            <span
              className={`font-mono font-semibold tabular-nums ${statusColorClass(
                responseState.status
              )}`}
            >
              {responseState.status} {responseState.statusText}
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">
              ·
            </span>
            <span className="font-mono tabular-nums text-[#475569]">
              {responseState.durationMs} ms
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">
              ·
            </span>
            <span className="font-mono text-[#64748B]">
              {responseState.contentType}
            </span>
          </div>

          <button
            type="button"
            disabled={!responseState.bodyText}
            onClick={handleCopyResponse}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {copiedResponse ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Copiar JSON</span>
              </>
            )}
          </button>
        </div>

        <div className="max-h-[380px] overflow-auto bg-[#F8FAFC] p-4">
          {isSending ? (
            <div className="space-y-2 py-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />
            </div>
          ) : (
            <pre className="font-mono text-xs leading-relaxed text-[#0F172A]">
              {responseState.bodyText}
            </pre>
          )}
        </div>
      </div>

      {/* Session History */}
      {history.length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2.5">
            <h2 className="text-xs font-semibold text-[#0F172A]">
              Histórico de Testes da Sessão
            </h2>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A]"
            >
              <Trash2 className="h-3 w-3" />
              <span>Limpar</span>
            </button>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-4 py-2 text-xs"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`w-14 font-mono font-semibold shrink-0 ${methodColorClass(
                      item.method
                    )}`}
                  >
                    {item.method}
                  </span>
                  <span className="truncate font-mono text-[#334155]">
                    {item.url}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono tabular-nums shrink-0">
                  <span className={statusColorClass(item.status)}>
                    {item.status}
                  </span>
                  <span className="w-14 text-right text-[#64748B]">
                    {item.durationMs} ms
                  </span>
                  <span className="hidden text-[#94A3B8] sm:inline">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
