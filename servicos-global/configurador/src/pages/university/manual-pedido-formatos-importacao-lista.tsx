import React from 'react'
import { File, FileCode, FileCsv, FilePdf, FileXls } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type FormatoImportacao = {
  rotulo: string
  extensao: string
  icone: React.ReactNode
  descricao: string
}

/** Paridade com Smart Import — `EtapaUpload` + extensão `.xls` legada */
const FORMATOS_IMPORTACAO: FormatoImportacao[] = [
  {
    rotulo: 'Excel',
    extensao: '.xlsx',
    icone: <FileXls size={26} weight="duotone" style={{ color: '#34d399' }} aria-hidden />,
    descricao: 'Planilha moderna — múltiplas abas suportadas',
  },
  {
    rotulo: 'Excel',
    extensao: '.xls',
    icone: <FileXls size={26} weight="duotone" style={{ color: '#2dd4bf' }} aria-hidden />,
    descricao: 'Planilha legada (Excel 97–2003)',
  },
  {
    rotulo: 'CSV',
    extensao: '.csv',
    icone: <FileCsv size={26} weight="duotone" style={{ color: '#60a5fa' }} aria-hidden />,
    descricao: 'Colunas delimitadas por vírgula ou ponto-e-vírgula',
  },
  {
    rotulo: 'XML',
    extensao: '.xml',
    icone: <FileCode size={26} weight="duotone" style={{ color: '#f59e0b' }} aria-hidden />,
    descricao: 'Arquivo estruturado de ERP ou integração',
  },
  {
    rotulo: 'TXT',
    extensao: '.txt',
    icone: <File size={26} weight="duotone" style={{ color: '#94a3b8' }} aria-hidden />,
    descricao: 'Texto tabulado ou delimitado',
  },
  {
    rotulo: 'JSON',
    extensao: '.json',
    icone: <FileCode size={26} weight="duotone" style={{ color: '#fb923c' }} aria-hidden />,
    descricao: 'Payload estruturado para importação programática',
  },
  {
    rotulo: 'PDF',
    extensao: '.pdf',
    icone: <FilePdf size={26} weight="duotone" style={{ color: '#f87171' }} aria-hidden />,
    descricao: 'Invoice com texto selecionável — extração via Gemini 2.5 Flash',
  },
]

/** Manual Pedido §05 — ícones dos 7 formatos aceitos no Smart Import */
export function ManualPedidoFormatosImportacaoLista() {
  return (
    <div
      role="group"
      aria-label="Formatos de importação aceitos no Smart Import"
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
        {FORMATOS_IMPORTACAO.map((formato) => (
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
