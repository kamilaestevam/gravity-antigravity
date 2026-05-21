import { ListBullets } from '@phosphor-icons/react'

export default function Lista() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <ListBullets size={24} weight="duotone" style={{ color: 'var(--text-muted)' }} />
        <h2 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          Lista
        </h2>
      </div>
      <div style={{
        padding: '3rem',
        borderRadius: '0.75rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        Visualização em lista — em construção
      </div>
    </div>
  )
}
