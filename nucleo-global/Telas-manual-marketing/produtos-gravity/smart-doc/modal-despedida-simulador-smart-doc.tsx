import { Sparkle } from '@phosphor-icons/react'
import type {
  ConteudoDespedidaNovaLeituraSimulador,
  PendenciaDespedidaSimulador,
} from './despedida-saida-nova-leitura-simulador-smart-doc'
import './modal-despedida-simulador-smart-doc.css'

type Props = {
  aberto: boolean
  conteudo: ConteudoDespedidaNovaLeituraSimulador
  onContinuar: () => void
  onSair: () => void
  onFecharSair: () => void
  onPendencia?: (pendencia: PendenciaDespedidaSimulador) => void
}

export function ModalDespedidaSimuladorSmartDoc({
  aberto,
  conteudo,
  onContinuar,
  onSair,
  onFecharSair,
  onPendencia,
}: Props) {
  if (!aberto) return null

  return (
    <div
      className="sds-despedida-overlay"
      role="dialog"
      aria-modal
      aria-labelledby="sds-despedida-titulo"
      onClick={onContinuar}
    >
      <div className="sds-despedida" onClick={(e) => e.stopPropagation()}>
        <div className="sds-despedida-icone" aria-hidden>
          <Sparkle size={28} weight="fill" />
        </div>
        <p className="sds-despedida-saudacao">{conteudo.saudacao}</p>
        <h2 id="sds-despedida-titulo" className="sds-despedida-titulo">
          {conteudo.titulo}
        </h2>
        <p className="sds-despedida-contexto">{conteudo.contexto}</p>
        <ul className="sds-despedida-lista">
          {conteudo.pendencias.map((item) => (
            <li key={item.id}>
              {item.destino && onPendencia ? (
                <button
                  type="button"
                  className="sds-despedida-link"
                  onClick={() => onPendencia(item)}
                >
                  {item.rotulo}
                </button>
              ) : (
                item.rotulo
              )}
            </li>
          ))}
        </ul>
        <p className="sds-despedida-pergunta">{conteudo.pergunta}</p>
        <div className="sds-despedida-acoes">
          <button type="button" className="sds-nl-btn sds-nl-btn--prim" onClick={onContinuar}>
            {conteudo.rotuloContinuar}
          </button>
          <button type="button" className="sds-nl-btn sds-nl-btn--sec" onClick={onSair}>
            {conteudo.rotuloSair}
          </button>
          <button type="button" className="sds-nl-btn sds-nl-btn--ter" onClick={onFecharSair}>
            {conteudo.rotuloFecharSair}
          </button>
        </div>
      </div>
    </div>
  )
}
