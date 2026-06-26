/**
 * modal-excluir-leituras-smart-read.tsx — confirmação de exclusão em lote
 */

import { Trash } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { NOME_PRODUTO_EXIBICAO } from '../shared/marca-smart-docs'

type Props = {
  aberto: boolean
  quantidade: number
  excluindo: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ModalExcluirLeiturasSmartRead({
  aberto,
  quantidade,
  excluindo,
  onConfirmar,
  onCancelar,
}: Props) {
  if (!aberto) return null

  const rotulo =
    quantidade === 1
      ? 'Excluir 1 leitura selecionada?'
      : `Excluir ${quantidade} leituras selecionadas?`

  return (
    <div className="sr-modal-overlay" role="presentation" onClick={onCancelar}>
      <div
        className="sr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sr-modal-excluir-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="sr-modal-excluir-titulo" className="sr-modal-titulo">
          {rotulo}
        </h3>
        <p className="sr-modal-descricao">
          Esta ação remove a leitura e os documentos processados no {NOME_PRODUTO_EXIBICAO}. Não pode ser desfeita.
        </p>
        <div className="sr-modal-acoes">
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={onCancelar} disabled={excluindo}>
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            tamanho="pequeno"
            icone={<Trash size={14} weight="duotone" />}
            onClick={onConfirmar}
            disabled={excluindo}
          >
            {excluindo ? 'Excluindo…' : 'Excluir'}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
