'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, FileCode2, Database } from 'lucide-react';
import { EXO_FILE_TEMPLATES, type CodeStage } from '@/lib/exo-templates';
import { downloadCriaDbSql } from '@/lib/sql-generator';

interface CodeExplorerPanelProps {
  selectedFileId: string;
  onSelectFile: (id: string) => void;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function CodeExplorerPanel({
  selectedFileId,
  onSelectFile,
}: CodeExplorerPanelProps) {
  const [stage, setStage] = useState<CodeStage>('etapa2');
  const [copied, setCopied] = useState(false);

  const activeFile =
    EXO_FILE_TEMPLATES.find((f) => f.id === selectedFileId) ??
    EXO_FILE_TEMPLATES[0];

  const codeContent = activeFile.getCode(stage);
  const lines = codeContent.split('\n');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard errors in restricted frames
    }
  }

  function handleDownloadCurrent() {
    if (activeFile.id === 'cria-db') {
      downloadCriaDbSql();
      return;
    }
    downloadTextFile(activeFile.fileName, codeContent);
  }

  function handleDownloadBundle() {
    const sections = EXO_FILE_TEMPLATES.map((tpl) => {
      const content = tpl.getCode(stage);
      return [
        '================================================================================',
        `ARQUIVO: ${tpl.path}`,
        `FUNÇÃO: ${tpl.role}`,
        '================================================================================',
        content,
      ].join('\n');
    }).join('\n\n');

    downloadTextFile(
      stage === 'etapa1'
        ? 'ExoWebApi-Etapa1-Listar.txt'
        : 'ExoWebApi-Etapa2-CRUD-Completo.txt',
      sections
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#64748B]">
            Projeto Exo.WebApi · .NET 6/7 e SQL Server (SSMS)
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0F172A] text-balance">
            Arquivos C# e Script cria-db.sql
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Alterne entre o código inicial do método Listar e a implementação CRUD completa para copiar ou baixar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => downloadCriaDbSql()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] whitespace-nowrap"
          >
            <Database className="h-3.5 w-3.5 text-[#475569]" />
            <span>Baixar cria-db.sql</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadBundle}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar Pacote Completo</span>
          </button>
        </div>
      </div>

      {/* Stage Toggle + Mobile File Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F9] p-1 self-start">
          <button
            type="button"
            onClick={() => setStage('etapa1')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              stage === 'etapa1'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Etapa 1: Somente GET Listar
          </button>
          <button
            type="button"
            onClick={() => setStage('etapa2')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              stage === 'etapa2'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Etapa 2: CRUD Completo
          </button>
        </div>

        <div className="lg:hidden">
          <select
            aria-label="Selecionar arquivo do projeto"
            value={activeFile.id}
            onChange={(e) => onSelectFile(e.target.value)}
            className="w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 font-mono text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
          >
            {EXO_FILE_TEMPLATES.map((file) => (
              <option key={file.id} value={file.id}>
                {file.path}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E2E8F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-[#2563EB] shrink-0" />
              <span className="truncate font-mono text-sm font-semibold text-[#0F172A]">
                {activeFile.path}
              </span>
              {activeFile.hasStageToggle && (
                <>
                  <span aria-hidden="true" className="text-[#CBD5E1]">
                    ·
                  </span>
                  <span className="text-xs font-medium text-[#2563EB] whitespace-nowrap">
                    {stage === 'etapa1' ? 'Versão GET Listar' : 'Versão CRUD'}
                  </span>
                </>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[#64748B]">{activeFile.role}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>Copiar</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadCurrent}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5 text-[#64748B]" />
              <span>Baixar {activeFile.fileName}</span>
            </button>
          </div>
        </div>

        <div className="max-h-[520px] overflow-auto bg-[#F8FAFC] p-4">
          <table className="w-full border-collapse font-mono text-xs leading-6">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-[#EFF6FF]/60">
                  <td className="w-10 select-none pr-4 text-right tabular-nums text-[#94A3B8]">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre text-[#0F172A]">
                    {line.length > 0 ? line : ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
