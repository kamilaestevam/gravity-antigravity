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
      'Clique no **botão roxo com brilho (✨)** no canto inferior direito. A janela abre por cima da tela, sem sair da página.',
  },
  {
    num: 2,
    icone: HandGrabbing,
    titulo: 'Cabeçalho e controles',
    texto:
      'No topo: **Gabi**, status **Assistente IA** e os botões **minimizar (−)**, **expandir (□)** e **fechar (×)**. **Arraste o cabeçalho** para mover a janela.',
  },
  {
    num: 3,
    icone: ArrowsOutCardinal,
    titulo: 'Expandir e mudar o tamanho',
    texto:
      '**Expandir** ocupa quase a tela inteira; clique de novo para **voltar ao tamanho anterior**. Fora do expandido, **puxe bordas ou cantos** para ajustar largura e altura.',
  },
  {
    num: 4,
    icone: PaperPlaneRight,
    titulo: 'Conversar',
    texto:
      'No centro: mensagens e **sugestões rápidas**. Embaixo: **Pergunte algo…** e o botão **enviar**. A conversa continua se você minimizar e voltar depois.',
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
    <div className="uni-gabi-janela-root">
      <style>{`
        .uni-gabi-janela-root {
          background: rgba(148,163,184,.04);
          border: 1px solid rgba(148,163,184,.14);
          border-radius: 14px;
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .uni-gabi-janela-intro-titulo {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 22px;
        }
        .uni-gabi-janela-intro-texto {
          margin: 0;
          font-size: .7rem;
          color: ${CORPO_FRACO};
          line-height: 1.45;
        }
        .uni-gabi-janela-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
        }
        .uni-gabi-janela-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          min-height: 112px;
          border-radius: 10px;
          padding: 12px;
          background: rgba(232,121,249,.06);
          border: 1px solid rgba(232,121,249,.22);
        }
        .uni-gabi-janela-card-titulo {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 24px;
        }
        .uni-gabi-janela-card-num {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: .62rem;
          font-weight: 800;
          color: #fae8ff;
          background: rgba(232,121,249,.25);
          border: 1px solid rgba(232,121,249,.4);
          flex-shrink: 0;
        }
        .uni-gabi-janela-card-label {
          font-weight: 700;
          font-size: .72rem;
          color: #e2e8f0;
          line-height: 1.3;
        }
        .uni-gabi-janela-card-texto {
          margin: 0;
          flex: 1;
          font-size: .64rem;
          color: ${CORPO};
          line-height: 1.5;
        }
        .uni-gabi-janela-dica {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(30,41,59,.5);
          border: 1px solid rgba(148,163,184,.12);
        }
        .uni-gabi-janela-dica p {
          margin: 0;
          font-size: .64rem;
          color: ${CORPO};
          line-height: 1.45;
        }
        @media (max-width: 720px) {
          .uni-gabi-janela-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div>
        <div className="uni-gabi-janela-intro-titulo">
          <Sparkle size={18} weight="duotone" color={GABI} />
          <span style={{ fontWeight: 800, fontSize: '.82rem', color: '#f1f5f9' }}>
            A janela da Gabi em 4 partes
          </span>
        </div>
        <p className="uni-gabi-janela-intro-texto" style={{ marginTop: 8 }}>
          O chat flutuante é uma janela que você controla: abre, move, expande, redimensiona e conversa sem perder o contexto da tela.
        </p>
      </div>

      <div className="uni-gabi-janela-grid">
        {PARTES_JANELA.map((p) => {
          const Icone = p.icone
          return (
            <div key={p.num} className="uni-gabi-janela-card">
              <div className="uni-gabi-janela-card-titulo">
                <span className="uni-gabi-janela-card-num">{p.num}</span>
                <Icone size={16} weight="duotone" color={GABI} />
                <span className="uni-gabi-janela-card-label">{p.titulo}</span>
              </div>
              <p className="uni-gabi-janela-card-texto">
                {renderTextoLeve(p.texto)}
              </p>
            </div>
          )
        })}
      </div>

      <div className="uni-gabi-janela-dica">
        <ArrowsOut size={16} weight="duotone" color="#93c5fd" style={{ flexShrink: 0, marginTop: 1 }} />
        <p>
          <strong style={{ color: '#cbd5e1' }}>Dica:</strong> em telas menores, expandir ajuda a ler respostas longas.
          Se a janela cobrir um campo importante, arraste pelo cabeçalho ou redimensione pelas bordas.
        </p>
      </div>
    </div>
  )
}
