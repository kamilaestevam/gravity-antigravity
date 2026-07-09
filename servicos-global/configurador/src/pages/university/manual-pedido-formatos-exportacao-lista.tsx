import React from 'react'
import { FileCode, FileCsv, FilePdf, FileText, FileXls } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type FormatoExportacao = {
  rotulo: string
  extensao: string
  icone: React.ReactNode
  descricao: string
}

const FORMATOS_EXPORTACAO: FormatoExportacao[] = [
  {
    rotulo: 'Excel',
    extensao: '.xlsx',
    icone: <FileXls size={26} weight="duotone" style={{ color: '#34d399' }} aria-hidden />,
    descricao: 'Planilha com colunas visíveis e filtros aplicados',
  },
  {
    rotulo: 'CSV',
    extensao: '.csv',
    icone: <FileCsv size={26} weight="duotone" style={{ color: '#60a5fa' }} aria-hidden />,
    descricao: 'Valores separados por vírgula — abre em Excel ou BI',
  },
  {
    rotulo: 'TXT',
    extensao: '.txt',
    icone: <FileText size={26} weight="duotone" style={{ color: '#94a3b8' }} aria-hidden />,
    descricao: 'Texto tabulado para sistemas legados',
  },
  {
    rotulo: 'XML',
    extensao: '.xml',
    icone: <FileCode size={26} weight="duotone" style={{ color: '#f59e0b' }} aria-hidden />,
    descricao: 'Estrutura XML para integrações',
  },
  {
    rotulo: 'PDF',
    extensao: '.pdf',
    icone: <FilePdf size={26} weight="duotone" style={{ color: '#f87171' }} aria-hidden />,
    descricao: 'Documento para impressão ou compartilhamento',
  },
  {
    rotulo: 'JSON',
    extensao: '.json',
    icone: <FileCode size={26} weight="duotone" style={{ color: '#fb923c' }} aria-hidden />,
    descricao: 'Dados estruturados para APIs e automações',
  },
]

/** Manual Pedido §05 — ícones dos 6 formatos de exportação da Lista */
export function ManualPedidoFormatosExportacaoLista() {
  return (
    <div
      role="group"
      aria-label="Formatos de exportação permitidos na Lista do Pedido"
      style={{
        margin: '14px 0 18px',
        padding: '16px 18px 14px',
        borderRadius: 14,
        border: '1px solid rgba(148,163,184,.14)',
        background: 'rgba(8,12,24,.35)',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))',
        gap: 14,
      }}>
        {FORMATOS_EXPORTACAO.map((formato) => (
          <div
            key={formato.extensao}
            title={formato.descricao}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              textAlign: 'center',
            }}
          >
            {formato.icone}
            <span style={{
              fontSize: '.68rem',
              fontWeight: 700,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: '#cbd5e1',
            }}>
              {formato.rotulo}
            </span>
            <span style={{ fontSize: '.62rem', color: CORPO_70, lineHeight: 1.35 }}>
              {formato.extensao}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
