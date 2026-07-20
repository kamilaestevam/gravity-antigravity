import React from 'react'
import { DownloadSimple, FileCode, FileCsv, FilePdf, FileText, FileXls } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type FormatoExportacaoLista = {
  rotulo: string
  extensao: string
  icone: React.ReactNode
  uso: string
  cor: string
  borda: string
  fundo: string
}

const FORMATOS_EXPORTACAO_LISTA_SMART_DOCS: FormatoExportacaoLista[] = [
  {
    rotulo: 'Excel',
    extensao: '.xlsx',
    icone: <FileXls size={22} weight="duotone" style={{ color: '#34d399' }} aria-hidden />,
    uso: 'Planilha com **colunas visíveis** e **filtros** da Lista: ideal para repassar leituras ao time, cruzar status e montar controles no Excel.',
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    rotulo: 'CSV',
    extensao: '.csv',
    icone: <FileCsv size={22} weight="duotone" style={{ color: '#60a5fa' }} aria-hidden />,
    uso: 'Valores separados por vírgula: importe em **Power BI**, **Looker** ou outro BI sem perder o recorte da tela.',
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    rotulo: 'TXT',
    extensao: '.txt',
    icone: <FileText size={22} weight="duotone" style={{ color: '#94a3b8' }} aria-hidden />,
    uso: 'Texto tabulado para **sistemas legados** ou rotinas que leem arquivo posicional delimitado por tabulação.',
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.08)',
  },
  {
    rotulo: 'XML',
    extensao: '.xml',
    icone: <FileCode size={22} weight="duotone" style={{ color: '#f59e0b' }} aria-hidden />,
    uso: 'Estrutura hierárquica para **integrações enterprise** que consomem XML de listagens operacionais.',
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.32)',
    fundo: 'rgba(245,158,11,.08)',
  },
  {
    rotulo: 'PDF',
    extensao: '.pdf',
    icone: <FilePdf size={22} weight="duotone" style={{ color: '#f87171' }} aria-hidden />,
    uso: 'Documento para **impressão**, **e-mail** ou arquivo de auditoria com o recorte exato da página atual.',
    cor: '#f87171',
    borda: 'rgba(248,113,113,.32)',
    fundo: 'rgba(248,113,113,.08)',
  },
  {
    rotulo: 'JSON',
    extensao: '.json',
    icone: <FileCode size={22} weight="duotone" style={{ color: '#fb923c' }} aria-hidden />,
    uso: 'Dados estruturados para **scripts**, **APIs** e automações que reprocessam leituras fora da interface.',
    cor: '#fb923c',
    borda: 'rgba(251,146,60,.32)',
    fundo: 'rgba(251,146,60,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardFormato({ formato }: { formato: FormatoExportacaoLista }) {
  return (
    <div style={{
      borderRadius: 12,
      padding: '13px 14px 12px',
      background: formato.fundo,
      border: `1px solid ${formato.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${formato.borda}`,
          flexShrink: 0,
        }}>
          {formato.icone}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontWeight: 800,
            fontSize: '.78rem',
            color: '#e2e8f0',
            lineHeight: 1.3,
          }}>
            {formato.rotulo}
          </p>
          <p style={{
            margin: '2px 0 0',
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            color: formato.cor,
          }}>
            {formato.extensao}
          </p>
        </div>
      </div>
      <p style={{
        margin: 0,
        fontSize: '.72rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        {renderizarNegrito(formato.uso)}
      </p>
    </div>
  )
}

/** Manual Smart Docs §05 — formatos de exportação da Lista e como usar cada um */
export function ManualInfograficoSmartDocsListaExportarFormatos({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  return (
    <div
      role="group"
      aria-label="Formatos de exportação da Lista Smart Docs e usos recomendados"
      style={{
        background: 'linear-gradient(165deg, rgba(52,211,153,.07) 0%, rgba(148,163,184,.04) 42%, rgba(96,165,250,.06) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: margemSuperiorPx,
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
        flexWrap: 'wrap',
      }}>
        <DownloadSimple size={18} weight="duotone" color="#34d399" aria-hidden />
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: '.9rem',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.35,
          }}>
            Seis formatos, um único recorte da Lista
          </p>
          <p style={{
            margin: '6px 0 0',
            fontSize: '.74rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            Todos exportam as **mesmas linhas** visíveis: filtros, colunas marcadas e página da tabela virtual.
            Só muda a extensão e o destino do arquivo.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {FORMATOS_EXPORTACAO_LISTA_SMART_DOCS.map((formato) => (
          <CardFormato key={formato.extensao} formato={formato} />
        ))}
      </div>
    </div>
  )
}
