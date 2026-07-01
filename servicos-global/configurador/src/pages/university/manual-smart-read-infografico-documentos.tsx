import React from 'react'
import {
  FileText,
  Receipt,
  Package,
  Boat,
  Airplane,
  Certificate,
  Leaf,
  CurrencyCircleDollar,
  Bank,
  DotsThreeCircle,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type GrupoDocumento = {
  titulo: string
  cor: string
  borda: string
  fundo: string
  icone: Icon
  itens: string[]
}

const GRUPOS: GrupoDocumento[] = [
  {
    titulo: 'Comercial',
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(99,102,241,.08)',
    icone: FileText,
    itens: ['Pedido', 'Proforma', 'Invoice', 'Packing List'],
  },
  {
    titulo: 'Transporte',
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.28)',
    fundo: 'rgba(56,189,248,.08)',
    icone: Boat,
    itens: ['BL (Bill of Lading)', 'AWB (Air Waybill)'],
  },
  {
    titulo: 'Certificados',
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
    icone: Certificate,
    itens: ['Certificado de Origem', 'Certificado Fitossanitário'],
  },
  {
    titulo: 'Financeiro',
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
    icone: CurrencyCircleDollar,
    itens: ['Fechamentos', 'Boletos', 'Duplicatas'],
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
      marginTop: 24,
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--ws-muted,#94a3b8)', margin: '0 0 14px',
      }}>
        Principais documentos lidos pelo Smart Docs
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icone size={18} weight="duotone" color={grupo.cor} />
                <span style={{ fontWeight: 800, fontSize: '.78rem', color: '#e2e8f0' }}>
                  {grupo.titulo}
                </span>
              </div>
              <ul style={{
                listStyle: 'none', margin: 0, padding: 0,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {grupo.itens.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: '.74rem', lineHeight: 1.4, color: CORPO_70,
                      paddingLeft: 10, borderLeft: `2px solid ${grupo.borda}`,
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
        fontSize: '.68rem', color: CORPO_70, margin: '14px 0 0', lineHeight: 1.45,
      }}>
        Formatos de arquivo aceitos no envio: PDF, JPG, PNG, XML, CSV, XLS e XLSX (até 50 MB por arquivo).
      </p>
    </div>
  )
}
