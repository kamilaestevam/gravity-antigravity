/**
 * Gabi IA — guia visual da janela de chat (GabiOnboardingWidget / chat flutuante).
 */

import React from 'react'
import {
  Sparkle,
  ChatCircleDots,
  ArrowsOut,
  HandGrabbing,
  ArrowsOutCardinal,
  PaperPlaneRight,
} from '@phosphor-icons/react'

const CORPO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 72%, transparent)'
const CORPO_FRACO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 55%, transparent)'
const GABI = '#e879f9'

const PARTES_JANELA = [
  {
    num: 1,
    icone: ChatCircleDots,
    titulo: 'Abrir o chat',
    texto:
      'Clique no **botão roxo com brilho (✨)** no canto inferior direito da tela. A janela da Gabi abre por cima do que você está fazendo, sem sair da página.',
  },
  {
    num: 2,
    icone: HandGrabbing,
    titulo: 'Cabeçalho e controles',
    texto:
      'No topo: nome **Gabi**, status **Assistente IA** e três botões — **minimizar (−)** volta ao botão roxo; **expandir (□)** aumenta a janela; **fechar (×)** encerra a conversa. **Arraste o cabeçalho** para mover a janela pela tela.',
  },
  {
    num: 3,
    icone: ArrowsOutCardinal,
    titulo: 'Expandir e mudar o tamanho',
    texto:
      'Use **expandir** para ocupar quase a tela inteira; clique de novo para **voltar ao tamanho anterior**. Fora do modo expandido, **puxe as bordas ou os cantos** da janela para deixá-la maior ou menor do seu jeito.',
  },
  {
    num: 4,
    icone: PaperPlaneRight,
    titulo: 'Conversar',
    texto:
      'No centro: mensagens da Gabi e **sugestões rápidas** (toque para enviar a pergunta pronta). Embaixo: campo **Pergunte algo…** e o botão roxo de **enviar**. A conversa continua mesmo se você minimizar e voltar depois.',
  },
] as const

function renderTextoLeve(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>
    }
    return <span key={i}>{p}</span>
  })
}

export function ManualInfograficoGabiJanela() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <style>{`
        .uni-gabi-janela-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          align-items: stretch;
        }
        @media (max-width: 720px) {
          .uni-gabi-janela-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Sparkle size={18} weight="duotone" color={GABI} />
        <span style={{ fontWeight: 800, fontSize: '.82rem', color: '#f1f5f9' }}>
          A janela da Gabi em 4 partes
        </span>
      </div>
      <p style={{ margin: '0 0 14px', fontSize: '.7rem', color: CORPO_FRACO, lineHeight: 1.45 }}>
        O chat flutuante é uma janela que você controla: abre, move, expande, redimensiona e conversa sem perder o contexto da tela.
      </p>

      <div className="uni-gabi-janela-grid">
        {PARTES_JANELA.map((p) => {
          const Icone = p.icone
          return (
            <div
              key={p.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                height: '100%',
                borderRadius: 10,
                padding: '12px 14px',
                background: 'rgba(232,121,249,.06)',
                border: '1px solid rgba(232,121,249,.22)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '.62rem',
                  fontWeight: 800,
                  color: '#fae8ff',
                  background: 'rgba(232,121,249,.25)',
                  border: '1px solid rgba(232,121,249,.4)',
                  flexShrink: 0,
                }}>
                  {p.num}
                </span>
                <Icone size={16} weight="duotone" color={GABI} />
                <span style={{ fontWeight: 700, fontSize: '.72rem', color: '#e2e8f0' }}>{p.titulo}</span>
              </div>
              <p style={{ margin: 0, fontSize: '.64rem', color: CORPO, lineHeight: 1.5 }}>
                {renderTextoLeve(p.texto)}
              </p>
            </div>
          )
        })}
      </div>

      <div style={{
        marginTop: 14,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'rgba(30,41,59,.5)',
        border: '1px solid rgba(148,163,184,.12)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
      }}>
        <ArrowsOut size={16} weight="duotone" color="#93c5fd" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ margin: 0, fontSize: '.64rem', color: CORPO, lineHeight: 1.45 }}>
          <strong style={{ color: '#cbd5e1' }}>Dica:</strong> em telas menores, expandir ajuda a ler respostas longas.
          Se a janela estiver cobrindo um campo importante, arraste pelo cabeçalho ou redimensione pelas bordas.
        </p>
      </div>
    </div>
  )
}
