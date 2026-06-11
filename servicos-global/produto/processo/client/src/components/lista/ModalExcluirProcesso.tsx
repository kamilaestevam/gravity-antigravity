/**
 * ModalExcluirProcesso.tsx — Confirma exclusão em lote de processos.
 */
import React, { useState } from 'react'
import { Trash } from '@phosphor-icons/react'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'

interface Props {
  aberto: boolean
  processos: ProcessoAvoLinha[]
  onFechar: () => void
  onConfirmar: (ids: string[]) => Promise<void>
}

export function ModalExcluirProcesso({ aberto, processos, onFechar, onConfirmar }: Props) {
  const [carregando, setCarregando] = useState(false)

  const handleSalvar = async () => {
    setCarregando(true)
    try {
      await onConfirmar(processos.map(p => p.id_processo))
      onFechar()
    } finally {
      setCarregando(false)
    }
  }

  return (
    <ModalFormularioGlobal
      aberto={aberto}
      aoFechar={onFechar}
      aoSalvar={() => { void handleSalvar() }}
      icone={<Trash size={24} weight="duotone" />}
      titulo="Excluir processos"
      subtitulo="Esta ação remove os processos selecionados e todos os pedidos/itens vinculados (mock)."
      dirty
      podesSalvar={processos.length > 0 && !carregando}
      carregando={carregando}
      textoSalvar="Excluir"
      tamanho="md"
      altura="400px"
    >
      <ul style={{ margin: 0, padding: '0.5rem 1.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {processos.map(p => (
          <li key={p.id_processo}>{p.numero_processo}</li>
        ))}
      </ul>
    </ModalFormularioGlobal>
  )
}
