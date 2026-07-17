import React from 'react'
import {
  ArrowsLeftRight,
  CheckCircle,
  PencilSimpleLine,
  TextAa,
  WarningCircle,
} from '@phosphor-icons/react'
import {
  MANUAL_ESPACO_PARAGRAFO_PX,
  MANUAL_TITULO_INFOGRAFICO_ESTILO,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CategoriaPerformance = {
  rotulo: string
  subtitulo: string
  explicacao: string
  cor: string
  borda: string
  fundo: string
  icone: React.ReactNode
}

const CATEGORIAS_PERFORMANCE_RESULTADO: CategoriaPerformance[] = [
  {
    rotulo: 'Acerto',
    subtitulo: 'Dados validados',
    explicacao:
      'Campo **não editado** na Conferência ou confirmado **sem mudar o valor comercial** — a extração original vale.',
    cor: '#22c55e',
    borda: 'rgba(34,197,94,.32)',
    fundo: 'rgba(34,197,94,.08)',
    icone: <CheckCircle size={18} weight="duotone" color="#22c55e" aria-hidden />,
  },
  {
    rotulo: 'Ajustes',
    subtitulo: 'Ajustes de forma',
    explicacao:
      'Você **editou** na Conferência só **formatação ou equivalência** (data, moeda, porto abreviado) — o **significado** do campo não mudou.',
    cor: '#f59e0b',
    borda: 'rgba(245,158,11,.32)',
    fundo: 'rgba(245,158,11,.08)',
    icone: <TextAa size={18} weight="duotone" color="#f59e0b" aria-hidden />,
  },
  {
    rotulo: 'Erro',
    subtitulo: 'Corrigidos (IA)',
    explicacao:
      'Você **substituiu** na Conferência um valor **diferente** do que a IA tinha extraído — houve **correção real** do conteúdo.',
    cor: '#ef4444',
    borda: 'rgba(239,68,68,.32)',
    fundo: 'rgba(239,68,68,.08)',
    icone: <WarningCircle size={18} weight="duotone" color="#ef4444" aria-hidden />,
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardCategoria({ categoria }: { categoria: CategoriaPerformance }) {
  return (
    <div style={{
      borderRadius: 12,
      padding: '13px 14px 12px',
      background: categoria.fundo,
      border: `1px solid ${categoria.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${categoria.borda}`,
          flexShrink: 0,
        }}>
          {categoria.icone}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: categoria.cor,
            lineHeight: 1.2,
          }}>
            {categoria.rotulo}
          </p>
          <p style={{
            margin: '2px 0 0',
            fontSize: '.78rem',
            fontWeight: 800,
            color: '#e2e8f0',
            lineHeight: 1.3,
          }}>
            {categoria.subtitulo}
          </p>
        </div>
      </div>
      <p style={{
        margin: 0,
        fontSize: '.72rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        {renderizarNegrito(categoria.explicacao)}
      </p>
    </div>
  )
}

/** Manual Smart Docs § Nova Leitura Resultado — acerto, ajuste e erro no painel Performance. */
export function ManualInfograficoSmartDocsPerformanceResultado({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  return (
    <div
      role="group"
      aria-label="Acerto, ajustes e erros no painel Performance de acertos"
      style={{
        background: 'linear-gradient(165deg, rgba(34,197,94,.06) 0%, rgba(148,163,184,.04) 38%, rgba(239,68,68,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: margemSuperiorPx,
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
        <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
          Performance de acertos
        </p>
        <p style={{
          margin: 0,
          fontSize: '.88rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          {renderizarNegrito('Tudo parte do que você **editou ou manteve** na **Conferência de Campos**')}
        </p>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
        flexWrap: 'wrap',
      }}>
        <PencilSimpleLine size={18} weight="duotone" color="#a78bfa" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70, flex: '1 1 220px' }}>
          {renderizarNegrito(
            'Para cada campo, o produto **compara** o valor que a IA extraiu com o valor **final** que ficou no passo anterior. Essa diferença (ou a falta dela) define a categoria no painel.',
          )}
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '.62rem',
          fontWeight: 700,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          flexShrink: 0,
        }}>
          <ArrowsLeftRight size={14} weight="bold" aria-hidden />
          Extração IA × Conferência
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 12,
      }}>
        {CATEGORIAS_PERFORMANCE_RESULTADO.map((categoria) => (
          <CardCategoria key={categoria.subtitulo} categoria={categoria} />
        ))}
      </div>
    </div>
  )
}
