import React from 'react'
import { CardAnaliseArquivoDemoSimuladorSmartDoc } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/card-analise-arquivo-demo-simulador-smart-doc'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/card-analise-arquivo-demo-simulador-smart-doc.css'
import { ManualFaixaDemonstracaoAnimada } from './manual-faixa-demonstracao-animada'

class LimiteErroDemoCardAnalise extends React.Component<
  { children: React.ReactNode },
  { falhou: boolean }
> {
  state = { falhou: false }

  static getDerivedStateFromError(): { falhou: boolean } {
    return { falhou: true }
  }

  render() {
    if (this.state.falhou) {
      return (
        <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--ws-muted, #94a3b8)' }}>
          Demonstração animada indisponível neste preview. Recarregue a página (Ctrl+Shift+R).
        </p>
      )
    }
    return this.props.children
  }
}

/** Manual Smart Docs · Nova Leitura passo Análise — demo automática do card na sidebar. */
export function ManualSmartReadSimuladorCardAnaliseArquivo({
  fraseDemonstracaoAnimada,
}: {
  fraseDemonstracaoAnimada?: string
}) {
  return (
    <div className="sim-smart-read-card-analise-bloco">
      {fraseDemonstracaoAnimada ? (
        <ManualFaixaDemonstracaoAnimada texto={fraseDemonstracaoAnimada} />
      ) : null}
      <div
        id="sim-smart-read-card-analise-arquivo"
        className="uni-player-aula__figura sim-smart-read-card-analise-demo"
      >
        <LimiteErroDemoCardAnalise>
          <CardAnaliseArquivoDemoSimuladorSmartDoc modoDemonstracao />
        </LimiteErroDemoCardAnalise>
      </div>
    </div>
  )
}
