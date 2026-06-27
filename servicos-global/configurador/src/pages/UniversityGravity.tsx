/**
 * UniversityGravity — placeholder de acesso à Gravity University (serviço de plataforma).
 *
 * ⚠️ PROTÓTIPO / WIP — destino temporário do ícone GraduationCap na topbar.
 * A implementação real (Academy/Docs/Builders) está especificada em
 * documentos-tecnicos/produtos-gravity/university-gravity/ (PRD + MODELO-DADOS + SPECS).
 */

import { GraduationCap, Books, FileText, PuzzlePiece, ArrowLeft, Sparkle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

const AREAS = [
  { id: 'academy', icon: <Books weight="duotone" size={26} />, cor: '#818cf8', titulo: 'Academy', desc: 'Trilhas de onboarding por produto, com jornada, quiz e certificado.', ativo: true },
  { id: 'docs', icon: <FileText weight="duotone" size={26} />, cor: '#94a3b8', titulo: 'Docs', desc: 'Manuais e vídeos navegáveis — a base de conhecimento da GABI.', ativo: false },
  { id: 'builders', icon: <PuzzlePiece weight="duotone" size={26} />, cor: '#94a3b8', titulo: 'Builders', desc: 'Integradores e desenvolvedores — direciona ao API Cockpit.', ativo: false },
]

export function UniversityGravity() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body-dark, #0f172a)', color: 'var(--ws-text, #f1f5f9)' }}>
      <header style={{
        height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
      }}>
        <button
          onClick={() => navigate('/hub')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
            borderRadius: 9999, border: '1px solid rgba(148,163,184,.15)', background: '#0e1626',
            color: 'var(--ws-text, #f1f5f9)', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Hub
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6 }}>
          <GraduationCap weight="duotone" size={22} color="#818cf8" />
          <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-.01em' }}>Gravity University</span>
        </div>
      </header>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '34px 26px 60px' }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          background: 'linear-gradient(135deg, rgba(167,139,250,.12), rgba(129,140,248,.05))',
          border: '1px solid rgba(167,139,250,.28)', borderRadius: 14, padding: '14px 16px', marginBottom: 28,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center',
            background: 'linear-gradient(135deg,#a78bfa,#818cf8)', color: '#0b1220',
          }}>
            <Sparkle weight="fill" size={18} />
          </div>
          <div>
            <div style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.08em', color: '#a78bfa', textTransform: 'uppercase' }}>
              Em construção
            </div>
            <p style={{ fontSize: '.88rem', marginTop: 4, lineHeight: 1.55, color: 'var(--ws-text,#f1f5f9)' }}>
              Hub único de aprendizado da plataforma — onboarding por produto, jornada gamificada e certificado,
              com a GABI como fonte de conhecimento e tutora. Especificação completa em
              <code style={{ color: '#c4b5fd' }}> documentos-tecnicos/produtos-gravity/university-gravity</code>.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16,
        }}>
          {AREAS.map(a => (
            <div key={a.id} style={{
              background: 'var(--bg-base, #1e293b)', border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 14, padding: 20,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 12,
                background: a.ativo ? 'rgba(129,140,248,.15)' : 'rgba(148,163,184,.1)', color: a.cor,
              }}>
                {a.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {a.titulo}
                {!a.ativo && (
                  <span style={{
                    fontSize: '.66rem', fontWeight: 700, padding: '3px 9px', borderRadius: 9999,
                    background: 'rgba(148,163,184,.12)', color: '#94a3b8',
                  }}>Em breve</span>
                )}
              </h3>
              <p style={{ fontSize: '.84rem', color: 'var(--ws-muted,#94a3b8)', marginTop: 7, lineHeight: 1.55 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
