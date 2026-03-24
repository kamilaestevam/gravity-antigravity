import { ReactNode } from 'react'
import './modal-select-global.css'

export interface ModalSelectGlobalProps {
  /**
   * Ícone exibido ao lado do título.
   */
  icone?: ReactNode

  /**
   * Título principal do bloco, renderizado no topo-esquerdo.
   */
  titulo: ReactNode

  /**
   * Texto ou nó que descreve o propósito da seleção (renderizado logo abaixo do título).
   */
  descricao?: ReactNode

  /**
   * Label acima do campo de seleção (select).
   */
  labelContext?: ReactNode

  /**
   * Componente de SelectGlobal ou elemento JSX representando o campo de seleção (cobre 100% da flex).
   */
  selectElement: ReactNode

  /**
   * Elemento ou componente extra que entra alinhado com o campo Select (ex: algum botão lateral).
   */
  botoesAcao?: ReactNode

  /**
   * Exibe um item ativo renderizado em uma caixa verde brilhante embaixo do Select.
   */
  itemAtivo?: {
    icone: ReactNode
    texto: ReactNode
    subtexto?: ReactNode
  } | null

  /**
   * Classes extras que podem ser aplicadas ao wrapper
   */
  className?: string
}

export function ModalSelectGlobal({
  icone,
  titulo,
  descricao,
  labelContext,
  selectElement,
  botoesAcao,
  itemAtivo,
  className = ''
}: ModalSelectGlobalProps) {
  return (
    <div className={`modal-select-global ${className}`}>
      {titulo && (
        <p className="modal-select-global__title" style={{ width: 'max-content' }}>
          {icone}
          {titulo}
        </p>
      )}

      {descricao && (
        <p className="modal-select-global__desc">
          {descricao}
        </p>
      )}

      <div className="modal-select-global__row">
        <div className="modal-select-global__field ws-field">
          {labelContext && <label>{labelContext}</label>}
          {selectElement}
        </div>
        {botoesAcao && (
          <div className="modal-select-global__action">
            {botoesAcao}
          </div>
        )}
      </div>

      {itemAtivo && (
        <div className="modal-select-global__active">
          {itemAtivo.icone}
          <span>
            {itemAtivo.texto}&nbsp;
            {itemAtivo.subtexto && (
              <span className="modal-select-global__active-sub">
                {itemAtivo.subtexto}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
