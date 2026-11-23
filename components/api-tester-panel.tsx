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
  KeyRound,
  Lock,
} from 'lucide-react';
import type { Projeto, Usuario } from '@/lib/exo-seed';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ApiResource = 'projetos' | 'usuarios';

export interface EndpointPreset {
  id: string;
  resource: ApiResource;
  method: HttpMethod;
  pathPattern: string;
  endpointPath?: string;
  controllerMethod: string;
  controllerName: string;
  label: string;
  description: string;
  requiresId: boolean;
  requiresBody: boolean;
  requiresAuth?: boolean;
}

export const PROJETOS_PRESETS: EndpointPreset[] = [
  {
    id: 'listar',
    resource: 'projetos',
    method: 'GET',
    pathPattern: '/api/projetos',
    controllerName: 'ProjetosController',
    controllerMethod: 'Listar()',
    label: 'Listar projetos',
    description: 'Retorna todos os registros da tabela Projetos.',
    requiresId: false,
    requiresBody: false,
  },
  {
    id: 'buscar-id',
    resource: 'projetos',
    method: 'GET',
    pathPattern: '/api/projetos/{id}',
    controllerName: 'ProjetosController',
    controllerMethod: 'BuscarPorId(int id)',
    label: 'Buscar por Id',
    description: 'Retorna um único projeto pelo identificador ou 404.',
    requiresId: true,
    requiresBody: false,
  },
  {
    id: 'cadastrar',
    resource: 'projetos',
    method: 'POST',
    pathPattern: '/api/projetos',
    controllerName: 'ProjetosController',
    controllerMethod: 'Cadastrar(Projeto projeto)',
    label: 'Cadastrar projeto',
    description: 'Insere um novo projeto e retorna status 201 Created.',
    requiresId: false,
    requiresBody: true,
  },
  {
    id: 'atualizar',
    resource: 'projetos',
    method: 'PUT',
    pathPattern: '/api/projetos/{id}',
    controllerName: 'ProjetosController',
    controllerMethod: 'Atualizar(int id, Projeto projeto)',
    label: 'Atualizar projeto',
    description: 'Atualiza NomeDoProjeto, Area e Status pelo Id.',
    requiresId: true,
    requiresBody: true,
  },
  {
    id: 'deletar',
    resource: 'projetos',
    method: 'DELETE',
    pathPattern: '/api/projetos/{id}',
    controllerName: 'ProjetosController',
    controllerMethod: 'Deletar(int id)',
    label: 'Deletar projeto',
    description: 'Remove um projeto existente e retorna 204 No Content.',
    requiresId: true,
    requiresBody: false,
  },
];

export const USUARIOS_PRESETS: EndpointPreset[] = [
  {
    id: 'usuarios-login',
    resource: 'usuarios',
    method: 'POST',
    pathPattern: '/api/usuarios',
    endpointPath: '/api/usuarios',
    controllerName: 'UsuariosController',
    controllerMethod: 'Post(Usuario usuario)',
    label: 'Login (Gerar Token JWT)',
    description:
      'Autentica com Email e Senha e retorna { token } JWT (ou 404 E-mail ou senha inválidos!).',
    requiresId: false,
    requiresBody: true,
  },
  {
    id: 'usuarios-listar',
    resource: 'usuarios',
    method: 'GET',
    pathPattern: '/api/usuarios',
    controllerName: 'UsuariosController',
    controllerMethod: 'Listar()',
    label: 'Listar usuários',
    description: 'Retorna todos os usuários da tabela Usuarios.',
    requiresId: false,
    requiresBody: false,
  },
  {
    id: 'usuarios-buscar-id',
    resource: 'usuarios',
    method: 'GET',
    pathPattern: '/api/usuarios/{id}',
    controllerName: 'UsuariosController',
    controllerMethod: 'BuscarPorId(int id)',
    label: 'Buscar por Id',
    description: 'Retorna um usuário pelo Id ou 404 Not Found.',
    requiresId: true,
    requiresBody: false,
  },
  {
    id: 'usuarios-cadastrar',
    resource: 'usuarios',
    method: 'POST',
    pathPattern: '/api/usuarios/cadastrar',
    endpointPath: '/api/usuarios/cadastrar',
    controllerName: 'UsuariosController',
    controllerMethod: 'Cadastrar(Usuario usuario)',
    label: 'Cadastrar usuário',
    description:
      'Insere um novo usuário (email e senha) e retorna 201 Created.',
    requiresId: false,
    requiresBody: true,
  },
  {
    id: 'usuarios-atualizar',
    resource: 'usuarios',
    method: 'PUT',
    pathPattern: '/api/usuarios/{id}',
    controllerName: 'UsuariosController',
    controllerMethod: 'Atualizar(int id, Usuario usuario)',
    label: 'Atualizar usuário [Authorize]',
    description:
      'Atualiza Email e Senha pelo Id. Exige Bearer Token JWT válido (retorna 204 ou 401).',
    requiresId: true,
    requiresBody: true,
    requiresAuth: true,
  },
  {
    id: 'usuarios-deletar',
    resource: 'usuarios',
    method: 'DELETE',
    pathPattern: '/api/usuarios/{id}',
    controllerName: 'UsuariosController',
    controllerMethod: 'Deletar(int id)',
    label: 'Deletar usuário [Authorize]',
    description:
      'Remove um usuário existente pelo Id. Exige Bearer Token JWT válido (retorna 204 ou 401).',
    requiresId: true,
    requiresBody: false,
    requiresAuth: true,
  },
];

export const ENDPOINT_PRESETS: EndpointPreset[] = [
  ...PROJETOS_PRESETS,
  ...USUARIOS_PRESETS,
];

export const DEFAULT_POST_BODY = JSON.stringify(
  {
    nomeDoProjeto: 'Projeto D — Plataforma Mobile',
    area: 'Desenvolvimento Mobile',
    status: true,
  },
  null,
  2
);

export const DEFAULT_USER_LOGIN_BODY = JSON.stringify(
  {
    email: 'email@sp.br',
    senha: '1234',
  },
  null,
  2
);

export const DEFAULT_USER_POST_BODY = JSON.stringify(
  {
    email: 'email_tres@sp.br',
    senha: '1234',
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
  activeResource: ApiResource;
  onChangeResource: (resource: ApiResource) => void;
  projetos: Projeto[];
  usuarios: Usuario[];
  selectedEndpointId: string;
  onSelectEndpoint: (id: string) => void;
  targetId: string;
  onChangeTargetId: (id: string) => void;
  requestBody: string;
  onChangeRequestBody: (body: string) => void;
  authToken: string | null;
  authEmail: string | null;
  onAuthChange: (token: string | null, email: string | null) => void;
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

function parseProjetoFields(body: string): {
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

function parseUsuarioFields(body: string): {
  email: string;
  senha: string;
} {
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    return {
      email:
        typeof parsed.email === 'string'
          ? parsed.email
          : typeof parsed.Email === 'string'
          ? parsed.Email
          : '',
      senha:
        typeof parsed.senha === 'string'
          ? parsed.senha
          : typeof parsed.Senha === 'string'
          ? parsed.Senha
          : '',
    };
  } catch {
    return { email: '', senha: '' };
  }
}

async function dispatchApiRequest(params: {
  url: string;
  method: HttpMethod;
  requiresBody: boolean;
  body: string;
  bearerToken?: string | null;
}) {
  const startedAt = Date.now();
  const headers: Record<string, string> = {};
  if (params.requiresBody) {
    headers['Content-Type'] = 'application/json';
  }
  if (params.bearerToken && params.bearerToken.trim().length > 0) {
    headers['Authorization'] = `Bearer ${params.bearerToken.trim()}`;
  }

  const response = await fetch(params.url, {
    method: params.method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
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
    rawText,
    timestamp,
  };
}

export default function ApiTesterPanel({
  activeResource,
  onChangeResource,
  projetos,
  usuarios,
  selectedEndpointId,
  onSelectEndpoint,
  targetId,
  onChangeTargetId,
  requestBody,
  onChangeRequestBody,
  authToken,
  authEmail,
  onAuthChange,
  onDatabaseMutated,
}: ApiTesterPanelProps) {
  const presetsForResource =
    activeResource === 'usuarios' ? USUARIOS_PRESETS : PROJETOS_PRESETS;

  const activePreset =
    presetsForResource.find((item) => item.id === selectedEndpointId) ??
    presetsForResource[0];

  const [bodyInputMode, setBodyInputMode] = useState<'form' | 'json'>('form');
  const [sendAuthHeader, setSendAuthHeader] = useState<boolean>(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

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

  const baseRoute =
    activeResource === 'usuarios' ? '/api/usuarios' : '/api/projetos';

  const resolvedUrl = activePreset.endpointPath
    ? activePreset.endpointPath
    : activePreset.requiresId
    ? `${baseRoute}/${targetId.trim() || '1'}`
    : baseRoute;

  const projetoFields = parseProjetoFields(requestBody);
  const usuarioFields = parseUsuarioFields(requestBody);

  function updateProjetoField(
    patch: Partial<{ nomeDoProjeto: string; area: string; status: boolean }>
  ) {
    onChangeRequestBody(
      JSON.stringify({ ...projetoFields, ...patch }, null, 2)
    );
    if (jsonError) setJsonError(null);
  }

  function updateUsuarioField(
    patch: Partial<{ email: string; senha: string }>
  ) {
    onChangeRequestBody(
      JSON.stringify({ ...usuarioFields, ...patch }, null, 2)
    );
    if (jsonError) setJsonError(null);
  }

  function handleSelectEndpointInternal(id: string) {
    setJsonError(null);
    onSelectEndpoint(id);
  }

  function handleTargetIdChange(newId: string) {
    onChangeTargetId(newId);
    const numericId = Number(newId);
    if (activePreset.id === 'atualizar') {
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
    } else if (activePreset.id === 'usuarios-atualizar') {
      const match = usuarios.find((u) => u.id === numericId);
      if (match) {
        onChangeRequestBody(
          JSON.stringify(
            {
              email: match.email,
              senha: '',
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
    const url = preset.endpointPath
      ? preset.endpointPath
      : preset.requiresId
      ? `${baseRoute}/${targetId.trim() || '1'}`
      : baseRoute;

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
      const bearerToken =
        activeResource === 'usuarios' && sendAuthHeader && authToken
          ? authToken
          : null;

      const result = await dispatchApiRequest({
        url,
        method: preset.method,
        requiresBody: preset.requiresBody,
        body: requestBody,
        bearerToken,
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

      if (preset.id === 'usuarios-login' && result.status === 200) {
        try {
          const parsed = JSON.parse(result.rawText) as { token?: string };
          if (typeof parsed.token === 'string' && parsed.token.length > 0) {
            const creds = parseUsuarioFields(requestBody);
            onAuthChange(parsed.token, creds.email || null);
          }
        } catch {
          // Ignore malformed login body
        }
      }

      if (preset.method !== 'GET' && preset.id !== 'usuarios-login') {
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

  async function handleCopyToken() {
    if (!authToken) return;
    try {
      await navigator.clipboard.writeText(authToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 1800);
    } catch {
      // Clipboard blocked in some contexts
    }
  }

  async function handleCopyCurl() {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000';
    const fullUrl = `${origin}${resolvedUrl}`;
    const curlParts = [`curl -X ${activePreset.method} "${fullUrl}"`];
    if (
      activeResource === 'usuarios' &&
      sendAuthHeader &&
      authToken &&
      activePreset.requiresAuth
    ) {
      curlParts.push(`-H "Authorization: Bearer ${authToken}"`);
    }
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

  function getDefaultBodyForPreset() {
    if (activeResource === 'projetos') return DEFAULT_POST_BODY;
    if (activePreset.id === 'usuarios-login') return DEFAULT_USER_LOGIN_BODY;
    return DEFAULT_USER_POST_BODY;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            {activePreset.controllerName} · {activePreset.controllerMethod}
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
            href={baseRoute}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-medium text-[#0F172A] transition-colors hover:bg-[#F1F5F9] whitespace-nowrap"
          >
            <span>Abrir {baseRoute} no navegador</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#475569]" />
          </a>
        </div>
      </div>

      {/* Resource Switcher: Projetos vs Usuarios */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-md bg-[#E2E8F0]/70 p-1">
          <button
            type="button"
            onClick={() => onChangeResource('projetos')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeResource === 'projetos'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Projetos (/api/projetos)
          </button>
          <button
            type="button"
            onClick={() => onChangeResource('usuarios')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeResource === 'usuarios'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Usuários &amp; JWT (/api/usuarios)
          </button>
        </div>
      </div>

      {/* Mobile endpoint selector (desktop uses sidebar) */}
      <div className="flex flex-wrap gap-1.5 lg:hidden">
        {presetsForResource.map((preset) => {
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

      {/* JWT Bearer Token Bar for Usuarios */}
      {activeResource === 'usuarios' && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs">
              <KeyRound className="h-4 w-4 text-[#2563EB] shrink-0" />
              <span className="font-semibold text-[#0F172A]">
                Autenticação Bearer JWT
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              {authToken ? (
                <span className="font-medium text-[#16A34A]">
                  Token ativo em memória{authEmail ? ` (${authEmail})` : ''}
                </span>
              ) : (
                <span className="text-[#64748B]">
                  Nenhum token gerado (envie POST /api/usuarios para autenticar)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[#334155]">
                <input
                  type="checkbox"
                  checked={sendAuthHeader}
                  onChange={(e) => setSendAuthHeader(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Enviar header Authorization: Bearer</span>
              </label>

              {authToken && (
                <>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1 rounded border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="h-3 w-3 text-[#16A34A]" />
                        <span>Token copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-[#64748B]" />
                        <span>Copiar JWT</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAuthChange(null, null)}
                    className="text-xs font-medium text-[#DC2626] hover:underline"
                  >
                    Limpar token
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label
              htmlFor="tester-jwt-token"
              className="text-xs font-mono text-[#64748B] shrink-0"
            >
              Bearer:
            </label>
            <input
              id="tester-jwt-token"
              type="text"
              value={authToken ?? ''}
              onChange={(e) =>
                onAuthChange(e.target.value ? e.target.value : null, authEmail)
              }
              placeholder="Cole um token JWT ou execute POST /api/usuarios (Login) para preencher automaticamente..."
              className="w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 font-mono text-xs text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
          </div>

          {activePreset.requiresAuth && (!authToken || !sendAuthHeader) && (
            <div className="flex items-center gap-2 text-xs text-[#B45309]">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>
                Esta rota exige [Authorize]. Sem token Bearer ativo, a API retornará 401 Unauthorized.
              </span>
            </div>
          )}
        </div>
      )}

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
                htmlFor="entity-id-input"
                className="text-xs font-medium text-[#475569] whitespace-nowrap"
              >
                Id:
              </label>
              <input
                id="entity-id-input"
                type="number"
                min={1}
                value={targetId}
                onChange={(e) => handleTargetIdChange(e.target.value)}
                className="w-20 rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 font-mono text-sm tabular-nums text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              />
              {activeResource === 'projetos' && projetos.length > 0 && (
                <select
                  aria-label="Selecionar projeto existente"
                  value={
                    projetos.some((p) => String(p.id) === targetId)
                      ? targetId
                      : ''
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
              {activeResource === 'usuarios' && usuarios.length > 0 && (
                <select
                  aria-label="Selecionar usuário existente"
                  value={
                    usuarios.some((u) => String(u.id) === targetId)
                      ? targetId
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) handleTargetIdChange(e.target.value);
                  }}
                  className="max-w-[180px] rounded-md border border-[#CBD5E1] bg-white px-2.5 py-2 text-xs text-[#334155] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="">Escolher usuário...</option>
                  {usuarios.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      #{user.id} — {user.email}
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
                    onChangeRequestBody(getDefaultBodyForPreset());
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
              activeResource === 'projetos' ? (
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
                      value={projetoFields.nomeDoProjeto}
                      onChange={(e) =>
                        updateProjetoField({ nomeDoProjeto: e.target.value })
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
                      value={projetoFields.area}
                      onChange={(e) =>
                        updateProjetoField({ area: e.target.value })
                      }
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
                      aria-checked={projetoFields.status}
                      onClick={() =>
                        updateProjetoField({ status: !projetoFields.status })
                      }
                      className={`w-full rounded-md border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        projetoFields.status
                          ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                          : 'border-[#CBD5E1] bg-white text-[#475569]'
                      }`}
                    >
                      {projetoFields.status ? 'Ativo (true)' : 'Inativo (false)'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="tester-user-email-input"
                      className="mb-1.5 block text-xs font-medium text-[#334155]"
                    >
                      Email
                    </label>
                    <input
                      id="tester-user-email-input"
                      type="email"
                      value={usuarioFields.email}
                      onChange={(e) =>
                        updateUsuarioField({ email: e.target.value })
                      }
                      placeholder="Ex.: email@sp.br"
                      className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tester-user-senha-input"
                      className="mb-1.5 block text-xs font-medium text-[#334155]"
                    >
                      {activePreset.id === 'usuarios-atualizar'
                        ? 'Senha (opcional para alterar)'
                        : 'Senha'}
                    </label>
                    <input
                      id="tester-user-senha-input"
                      type="text"
                      value={usuarioFields.senha}
                      onChange={(e) =>
                        updateUsuarioField({ senha: e.target.value })
                      }
                      placeholder="Ex.: 1234"
                      className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                </div>
              )
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
