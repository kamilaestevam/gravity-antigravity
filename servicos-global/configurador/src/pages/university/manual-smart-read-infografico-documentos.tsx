import React from 'react'
import {
  FileText,
  Boat,
  Certificate,
  CurrencyCircleDollar,
  DotsThreeCircle,
  SealCheck,
  type Icon,
} from '@phosphor-icons/react'
import { MANUAL_ESPACO_IMAGEM_FRASE_PX, MANUAL_ESPACO_PARAGRAFO_PX, MANUAL_TITULO_INFOGRAFICO_ESTILO } from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type GrupoDocumento = {
  titulo: string
  cor: string
  borda: string
  fundo: string
  icone: Icon
  itens: string[]
  compacto?: boolean
}

const GRUPOS: GrupoDocumento[] = [
  {
    titulo: 'Comercial',
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(99,102,241,.08)',
    icone: FileText,
    itens: [
      'Invoice — Commercial Invoice, Fatura',
      'Proforma',
      'Purchase Order / Pedido',
      'Packing List — Lista de Embalagem / Romaneio',
    ],
  },
  {
    titulo: 'Transporte',
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.28)',
    fundo: 'rgba(56,189,248,.08)',
    icone: Boat,
    itens: [
      'BL — Bill of Lading / Conhecimento de Embarque',
      'AWB — Air Waybill / Conhecimento Aéreo',
    ],
  },
  {
    titulo: 'Financeiro',
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
    icone: CurrencyCircleDollar,
    itens: [
      'Boleto',
      'Nota Fiscal',
      'Fechamento',
      'Faturamento',
    ],
  },
  {
    titulo: 'Certificados e exportação',
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
    icone: Certificate,
    compacto: true,
    itens: [
      'Certificado de Origem',
      'Certificado Sanitário / CSI',
      'Certificado de Fumigação / ISPM 15',
      'Declaração Adicional',
      'Relatório de Ordens de Venda (ZE16/ZE16N)',
      'Certificado de Rastreabilidade',
      'Declaração de Lote',
      'Certificado de Análise / COA',
      'Certificado Sanitário MP/PROD',
      'Relatório Carga de Navio (ZE17/ZE17N)',
      'Carta Remessa / Cover Letter bancária',
      'Saque / Letra de Câmbio',
      'CNCA / ARCCLA (carga Angola)',
      'Certificado de Congelamento',
      'Livre de Hormônios',
    ],
  },
  {
    titulo: 'Halal e Câmara Árabe',
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.28)',
    fundo: 'rgba(139,92,246,.08)',
    icone: SealCheck,
    itens: [
      'Halal (FAMBRAS)',
      'Halal CDIAL',
      'Halal THA',
      'Halal SIIL',
      'Câmara de Comércio Árabe / CCAB',
    ],
  },
]

/** Seção 01 do manual Smart Docs — tipos de documento que a leitura identifica */
export function ManualInfograficoSmartDocsDocumentos() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Principais documentos lidos pelo Smart Docs
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: MANUAL_ESPACO_PARAGRAFO_PX,
      }}>
        {GRUPOS.map((grupo) => {
          const Icone = grupo.icone
          return (
            <div
              key={grupo.titulo}
              style={{
                borderRadius: 12,
                padding: '12px 14px',
                background: grupo.fundo,
                border: `1px solid ${grupo.borda}`,
                gridColumn: grupo.compacto ? '1 / -1' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icone size={18} weight="duotone" color={grupo.cor} />
                <span style={{ fontWeight: 800, fontSize: '.78rem', color: '#e2e8f0' }}>
                  {grupo.titulo}
                </span>
              </div>
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: grupo.compacto
                  ? 'repeat(auto-fit, minmax(220px, 1fr))'
                  : '1fr',
                gap: grupo.compacto ? 5 : 6,
              }}>
                {grupo.itens.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: grupo.compacto ? '.7rem' : '.74rem',
                      lineHeight: 1.4,
                      color: CORPO_70,
                      paddingLeft: 10,
                      borderLeft: `2px solid ${grupo.borda}`,
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        <div style={{
          borderRadius: 12,
          padding: '12px 14px',
          background: 'rgba(148,163,184,.06)',
          border: '1px dashed rgba(148,163,184,.22)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DotsThreeCircle size={18} weight="duotone" color="#94a3b8" />
            <span style={{ fontWeight: 800, fontSize: '.78rem', color: '#e2e8f0' }}>
              Entre outros
            </span>
          </div>
          <p style={{ fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70, margin: 0 }}>
            NF-e, DI, planilhas comerciais e demais documentos de importação e exportação em
            **PDF**, imagem, **XML**, **CSV** ou **Excel** — a IA classifica o tipo após a leitura.
          </p>
        </div>
      </div>

      <p style={{
        fontSize: '.68rem', color: CORPO_70, margin: `${MANUAL_ESPACO_IMAGEM_FRASE_PX}px 0 0`, lineHeight: 1.45,
      }}>
        Formatos de arquivo aceitos no envio: PDF, JPG, PNG, XML, CSV, XLS e XLSX (até 50 MB por arquivo).
      </p>
    </div>
  )
}
