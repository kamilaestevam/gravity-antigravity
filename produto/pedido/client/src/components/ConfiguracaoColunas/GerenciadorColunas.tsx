/**
 * GerenciadorColunas.tsx — Tela de gerenciamento de colunas customizadas do usuário
 *
 * Renderiza tabela de colunas com drag-and-drop para reordenar,
 * botões editar e excluir por linha.
 *
 * Usado dentro da página Configurações do produto Pedido.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DotsSixVertical,
  PencilSimple,
  Trash,
  Plus,
  Spinner,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ColunaUsuario } from '../../shared/types'
import { colunasUsuarioApi } from '../../shared/api'
import { COLUNAS_PAI_CHAVES } from '../../pages/ListaPedidos'
import { ModalNovaColuna } from './ModalNovaColuna'
import './GerenciadorColunas.css'

// ── Labels de exibição ────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  texto:          'Texto',
  numero:         'Número',
  data:           'Data',
  select:         'Select',
  checkbox:       'Checkbox',
  percentual:     'Percentual (%)',
  tipo_documento: 'Tipo de Documento',
}

const ESCOPO_LABELS: Record<string, string> = {
  pedido: 'Pedido',
  item:   'Item',
  ambos:  'Ambos',
}

const VISIBILIDADE_LABELS: Record<string, string> = {
  todos:   'Todos',
  roles:   'Por Perfil',
  privado: 'Só eu',
}

// ── Item sortável (linha da tabela) ───────────────────────────────────────────

interface LinhaColunaSortavelProps {
  coluna: ColunaUsuario
  onEditar: (coluna: ColunaUsuario) => void
  onExcluir: (id: string) => void
}

function LinhaColunaSortavel({ coluna, onEditar, onExcluir }: LinhaColunaSortavelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: coluna.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`gc-linha${isDragging ? ' gc-linha--arrastando' : ''}`}
    >
      <td className="gc-celula gc-celula--drag">
        <button
          className="gc-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Arrastar para reordenar"
          type="button"
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>
      </td>
      <td className="gc-celula gc-celula--nome">{coluna.nome}</td>
      <td className="gc-celula">
        <span className="gc-badge gc-badge--tipo">
          {TIPO_LABELS[coluna.tipo] ?? coluna.tipo}
        </span>
      </td>
      <td className="gc-celula">
        <span className="gc-badge gc-badge--escopo">
          {ESCOPO_LABELS[coluna.escopo] ?? coluna.escopo}
        </span>
      </td>
      <td className="gc-celula">
        <span className="gc-badge gc-badge--visibilidade">
          {VISIBILIDADE_LABELS[coluna.visibilidade] ?? coluna.visibilidade}
        </span>
      </td>
      <td className="gc-celula gc-celula--acoes">
        <button
          type="button"
          className="gc-btn-acao gc-btn-acao--editar"
          onClick={() => onEditar(coluna)}
          aria-label={`Editar coluna ${coluna.nome}`}
        >
          <PencilSimple size={14} weight="bold" />
        </button>
        <button
          type="button"
          className="gc-btn-acao gc-btn-acao--excluir"
          onClick={() => onExcluir(coluna.id)}
          aria-label={`Excluir coluna ${coluna.nome}`}
        >
          <Trash size={14} weight="bold" />
        </button>
      </td>
    </tr>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function GerenciadorColunas() {
  const [colunas, setColunas]         = useState<ColunaUsuario[]>([])
  const [carregando, setCarregando]   = useState(true)
  const [erro, setErro]               = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [colunaEdicao, setColunaEdicao] = useState<ColunaUsuario | undefined>(undefined)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const camposDisponiveisParaFormula = useMemo<string[]>(
    () => [
      ...COLUNAS_PAI_CHAVES,
      ...colunas.filter(c => c.tipo !== 'formula').map(c => c.chave),
    ],
    [colunas],
  )

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const lista = await colunasUsuarioApi.listar()
      setColunas(lista.sort((a, b) => a.ordem - b.ordem))
    } catch {
      setErro('Não foi possível carregar as colunas. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = colunas.findIndex(c => c.id === active.id)
    const newIndex = colunas.findIndex(c => c.id === over.id)
    const novaOrdem = arrayMove(colunas, oldIndex, newIndex)

    setColunas(novaOrdem)
    try {
      await colunasUsuarioApi.reordenar(novaOrdem.map(c => c.id))
    } catch {
      setColunas(colunas) // reverte se falhar
    }
  }, [colunas])

  const handleEditar = useCallback((coluna: ColunaUsuario) => {
    setColunaEdicao(coluna)
    setModalAberto(true)
  }, [])

  const handleExcluir = useCallback(async (id: string) => {
    const coluna = colunas.find(c => c.id === id)
    if (!coluna) return
    if (!window.confirm(`Excluir a coluna "${coluna.nome}"? Os valores existentes serão preservados.`)) return

    try {
      await colunasUsuarioApi.excluir(id)
      setColunas(prev => prev.filter(c => c.id !== id))
    } catch {
      setErro('Erro ao excluir coluna. Tente novamente.')
    }
  }, [colunas])

  const handleNova = useCallback(() => {
    setColunaEdicao(undefined)
    setModalAberto(true)
  }, [])

  const handleSalvarModal = useCallback(async () => {
    setModalAberto(false)
    setColunaEdicao(undefined)
    await carregar()
  }, [carregar])

  return (
    <div className="gc-container">
      <div className="gc-header">
        <h3 className="gc-titulo">Colunas Customizadas</h3>
        <BotaoGlobal
          variante="primario"
          tamanho="pequeno"
          icone={<Plus size={14} />}
          onClick={handleNova}
        >
          Nova Coluna
        </BotaoGlobal>
      </div>

      {erro && (
        <p className="gc-erro" role="alert">{erro}</p>
      )}

      {carregando ? (
        <div className="gc-carregando" aria-label="Carregando colunas">
          <Spinner size={24} className="gc-spinner" />
        </div>
      ) : colunas.length === 0 ? (
        <p className="gc-vazio">Nenhuma coluna criada. Clique em "Nova Coluna" para começar.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={colunas.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="gc-tabela" aria-label="Colunas customizadas">
              <thead>
                <tr>
                  <th className="gc-th gc-th--drag" aria-label="Arrastar" />
                  <th className="gc-th">Nome</th>
                  <th className="gc-th">Tipo</th>
                  <th className="gc-th">Escopo</th>
                  <th className="gc-th">Visibilidade</th>
                  <th className="gc-th gc-th--acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {colunas.map(coluna => (
                  <LinhaColunaSortavel
                    key={coluna.id}
                    coluna={coluna}
                    onEditar={handleEditar}
                    onExcluir={handleExcluir}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      )}

      {modalAberto && (
        <ModalNovaColuna
          colunaEdicao={colunaEdicao}
          onFechar={() => { setModalAberto(false); setColunaEdicao(undefined) }}
          onSalvo={handleSalvarModal}
          camposDisponiveis={camposDisponiveisParaFormula}
          todasColunas={colunas}
        />
      )}
    </div>
  )
}
