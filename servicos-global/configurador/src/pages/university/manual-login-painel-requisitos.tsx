import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'

const COR_META = '#64748b'
const COR_CORPO = 'rgba(226,232,240,.72)'

/** Painel de exigências do formulário de cadastro — SSOT visual manual + Guia Gravity Login. */
export function ManualPainelRequisitosCadastro({
  semMargemSuperior = false,
  compactoGuia = false,
}: {
  semMargemSuperior?: boolean
  compactoGuia?: boolean
}) {
  const grupos: { rotulo: string; itens: string[] }[] = [
    {
      rotulo: 'Composição da senha',
      itens: [
        'No mínimo 8 caracteres',
        'Pelo menos 1 letra maiúscula',
        'Pelo menos 1 letra minúscula',
        'Pelo menos 1 número',
        'Pelo menos 1 caractere especial',
      ],
    },
    {
      rotulo: 'Confirmação e aceite legal',
      itens: [
        'A confirmação de senha confere',
        'Aceite dos Termos de Uso e Política de Privacidade',
      ],
    },
  ]

  return (
    <div style={{
      marginTop: semMargemSuperior ? 0 : MANUAL_ESPACO_PARAGRAFO_PX,
      borderRadius: 12,
      border: '1px solid rgba(99,102,241,.22)',
      background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(15,23,42,.35) 48%)',
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '10px 14px', borderBottom: '1px solid rgba(148,163,184,.12)',
        background: 'rgba(99,102,241,.06)',
      }}>
        <span style={{
          fontSize: '.65rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
          color: '#a5b4fc',
        }}>
          Exigências obrigatórias
        </span>
        <span style={{
          fontSize: '.62rem', fontWeight: 700, color: '#818cf8',
          background: 'rgba(99,102,241,.14)', border: '1px solid rgba(99,102,241,.25)',
          borderRadius: 999, padding: '2px 8px',
        }}>
          7 itens
        </span>
      </div>

      <div style={{ padding: compactoGuia ? '12px 14px 12px' : '12px 14px 10px' }}>
        {grupos.map((grupo, gi) => (
          <div key={grupo.rotulo} style={{ marginTop: gi === 0 ? 0 : 12 }}>
            <p style={{
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
              color: COR_META, margin: '0 0 8px', paddingBottom: 6,
              borderBottom: '1px solid rgba(148,163,184,.1)',
            }}>
              {grupo.rotulo}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {grupo.itens.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, position: 'relative' }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 1,
                    display: 'grid', placeItems: 'center',
                    background: 'rgba(239,68,68,.12)', border: '1px solid rgba(248,113,113,.45)',
                    color: '#f87171',
                  }}>
                    <WarningCircle size={11} weight="fill" />
                  </span>
                  <span style={{ fontSize: '.78rem', color: COR_CORPO, lineHeight: 1.45 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: compactoGuia ? '0 14px' : '8px 14px',
          marginTop: 12,
          marginBottom: 0,
          paddingTop: compactoGuia ? 10 : 10,
          paddingBottom: 0,
          borderTop: '1px dashed rgba(148,163,184,.15)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', lineHeight: 1, color: '#4ade80' }}>
            <CheckCircle size={13} weight="fill" /> Atendido: item verde no formulário
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', lineHeight: 1, color: '#f87171' }}>
            <WarningCircle size={13} weight="fill" /> Pendente: item vermelho até corrigir
          </span>
        </div>
      </div>
    </div>
  )
}
