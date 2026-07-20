import React from 'react'
import {
  ArrowRight,
  Buildings,
  ChartLineUp,
  Key,
  ListMagnifyingGlass,
  PlugsConnected,
  Pulse,
  Table,
} from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX,
  MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const COLUNAS_LOG = [
  { rotulo: 'Método', exemplo: 'POST, GET' },
  { rotulo: 'Endpoint', exemplo: '/leituras, /pedidos' },
  { rotulo: 'Status', exemplo: '200, 401, 500' },
  { rotulo: 'Latência', exemplo: 'tempo da resposta' },
  { rotulo: 'Produto', exemplo: 'Smart Docs, Pedido…' },
] as const

const USOS = [
  {
    icone: Pulse,
    titulo: 'Cards do topo (24h)',
    descricao: 'Resumo rápido: tráfego, sucesso, latência média e falhas antes de abrir a tabela.',
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.28)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    icone: Table,
    titulo: 'Linha a linha',
    descricao: 'Cada chamada com token vira um registro: método, rota, código HTTP e produto de origem.',
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.28)',
    fundo: 'rgba(129,140,248,.08)',
  },
  {
    icone: ListMagnifyingGlass,
    titulo: 'Para investigar',
    descricao: 'Erros 4xx/5xx, picos de latência, integração parada ou token sem uso.',
    cor: '#34d399',
    borda: 'rgba(52,211,153,.28)',
    fundo: 'rgba(52,211,153,.08)',
  },
] as const

/** Mapa visual — aba Consumo do API Cockpit (público não técnico). */
export function ManualInfograficoApiCockpitConsumo() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(96,165,250,.08) 0%, rgba(148,163,184,.04) 48%, rgba(129,140,248,.07) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '20px 20px 18px',
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <p style={{
        fontSize: '.68rem',
        fontWeight: 700,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: 'var(--ws-muted,#94a3b8)',
        margin: 0,
        paddingBottom: MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX,
      }}>
        O que a aba Consumo registra
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.64rem', fontWeight: 700, color: '#fde68a' }}>
          <Buildings size={14} weight="duotone" />
          Seu ERP / sistema
        </div>
        <ArrowRight size={16} weight="bold" color="#94a3b8" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.64rem', fontWeight: 700, color: '#fcd34d' }}>
          <Key size={14} weight="duotone" />
          Token
        </div>
        <ArrowRight size={16} weight="bold" color="#94a3b8" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.64rem', fontWeight: 700, color: '#bfdbfe' }}>
          <PlugsConnected size={14} weight="duotone" />
          API Cockpit
        </div>
        <ArrowRight size={16} weight="bold" color="#94a3b8" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.64rem', fontWeight: 700, color: '#a5b4fc' }}>
          <ChartLineUp size={14} weight="duotone" />
          Produto Gravity
        </div>
      </div>

      <p style={{
        fontSize: '.7rem',
        color: CORPO_70,
        lineHeight: 1.55,
        margin: 0,
        paddingBottom: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
        textAlign: 'center',
      }}>
        Toda requisição autenticada com o <strong style={{ color: '#cbd5e1' }}>token da organização</strong> deixa
        rastro aqui: é o <strong style={{ color: '#cbd5e1' }}>extrato da integração</strong>, não o conteúdo dos documentos.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))',
        gap: 8,
        paddingTop: 0,
        marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
      }}>
        {COLUNAS_LOG.map((col) => (
          <div
            key={col.rotulo}
            style={{
              borderRadius: 8,
              padding: '8px 10px',
              textAlign: 'center',
              background: 'rgba(148,163,184,.06)',
              border: '1px solid rgba(148,163,184,.16)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '.66rem', color: '#e2e8f0', lineHeight: 1.25 }}>
              {col.rotulo}
            </div>
            <div style={{ fontSize: '.58rem', color: CORPO_70, marginTop: 4, lineHeight: 1.35 }}>
              {col.exemplo}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {USOS.map((uso) => {
          const Icone = uso.icone
          return (
            <div
              key={uso.titulo}
              style={{
                borderRadius: 12,
                padding: '12px 12px 10px',
                background: uso.fundo,
                border: `1px solid ${uso.borda}`,
              }}
            >
              <Icone size={16} weight="duotone" style={{ color: uso.cor, marginBottom: 6 }} />
              <div style={{ fontWeight: 800, fontSize: '.72rem', color: '#e2e8f0', lineHeight: 1.3 }}>
                {uso.titulo}
              </div>
              <div style={{ fontSize: '.64rem', color: CORPO_70, marginTop: 6, lineHeight: 1.45 }}>
                {uso.descricao}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
