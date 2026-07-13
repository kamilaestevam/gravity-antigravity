// TODO(preview-temp, 2026-07-11): página só para conferência visual manual — remover após validar.
import { Component, useState, type ReactNode } from 'react'
import { JornadaModulo, __TRILHAS_PREVIEW_TEMP } from './UniversityGravity'

const SLUGS = Object.keys(__TRILHAS_PREVIEW_TEMP)

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: '#f87171', background: '#1e293b', padding: 16, whiteSpace: 'pre-wrap' }}>
          {this.state.error.message}
          {'\n\n'}
          {this.state.error.stack}
        </pre>
      )
    }
    return this.props.children
  }
}

function PreviewJornadaTempInner() {
  const [slug, setSlug] = useState('login')
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set(['o-que-e-o-gravity', 'criando-sua-conta', 'configurando-seu-perfil']))
  const trilha = __TRILHAS_PREVIEW_TEMP[slug]?.[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app,#0f172a)', padding: '32px 40px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {SLUGS.map(s => (
            <button key={s} onClick={() => setSlug(s)} style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid #334155', cursor: 'pointer',
              background: s === slug ? '#818cf8' : '#1e293b', color: s === slug ? '#0b1220' : '#f1f5f9',
            }}>{s}</button>
          ))}
          <button onClick={() => setConcluidas(new Set())} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#f1f5f9', cursor: 'pointer' }}>
            zerar progresso
          </button>
        </div>
        {trilha && (
          <JornadaModulo
            trilha={trilha}
            aulasConcluidas={concluidas}
            onAbrirFase={(faseSlug) => setConcluidas(prev => new Set(prev).add(faseSlug))}
          />
        )}
      </div>
    </div>
  )
}

export function PreviewJornadaTemp() {
  return (
    <PreviewErrorBoundary>
      <PreviewJornadaTempInner />
    </PreviewErrorBoundary>
  )
}
