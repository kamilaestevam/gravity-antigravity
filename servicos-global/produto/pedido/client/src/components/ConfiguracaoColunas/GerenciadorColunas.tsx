/**
 * GerenciadorColunas.tsx — Tela de gerenciamento de colunas customizadas do usuário
 *
 * Renderiza tabela de colunas com drag-and-drop para reordenar,
 * botões editar e excluir por linha.
 *
 * Usado dentro da página Configurações do produto Pedido.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
} from '@phosphor-icons/react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import type { ColunaUsuario } from '../../shared/types'
import { colunasUsuarioApi } from '../../shared/api'
import { COLUNAS_PAI_CHAVES } from '../../pages/Pedidos'
import { ModalNovaColunaUsuario } from './ModalNovaColunaUsuario'
import './GerenciadorColunas.css'

// ── Item sortável (linha da tabela) ───────────────────────────────────────────

interface LinhaColunaSortavelProps {
  coluna: ColunaUsuario
  onEditar: (coluna: ColunaUsuario) => void
  onExcluir: (id: string) => void
  tipoLabels: Record<string, string>
  escopoLabels: Record<string, string>
  visibilidadeLabels: Record<string, string>
  ariaEditar: (nome: string) => string
  ariaExcluir: (nome: string) => string
  ariaArrastar: string
}

function LinhaColunaSortavel({ coluna, onEditar, onExcluir, tipoLabels, escopoLabels, visibilidadeLabels, ariaEditar, ariaExcluir, ariaArrastar }: LinhaColunaSortavelProps) {
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
          aria-label={ariaArrastar}
          type="button"
        >
          <DotsSixVertical size={16} weight="bold" />
        </button>
      </td>
      <td className="gc-celula gc-celula--nome">{coluna.nome}</td>
      <td className="gc-celula">
        <span className="gc-badge gc-badge--tipo">
          {tipoLabels[coluna.tipo] ?? coluna.tipo}
        </span>
      </td>
      <td className="gc-celula">
        <span className="gc-badge gc-badge--escopo">
          {escopoLabels[coluna.escopo] ?? coluna.escopo}
        </span>
      </td>
      <td className="gc-celula">
        <span className="gc-badge gc-badge--visibilidade">
          {visibilidadeLabels[coluna.visibilidade] ?? coluna.visibilidade}
        </span>
      </td>
      <td className="gc-celula gc-celula--acoes">
        <button
          type="button"
          className="gc-btn-acao gc-btn-acao--editar"
          onClick={() => onEditar(coluna)}
          aria-label={ariaEditar(coluna.nome)}
        >
          <PencilSimple size={14} weight="bold" />
        </button>
        <button
          type="button"
          className="gc-btn-acao gc-btn-acao--excluir"
          onClick={() => onExcluir(coluna.id)}
          aria-label={ariaExcluir(coluna.nome)}
        >
          <Trash size={14} weight="bold" />
        </button>
      </td>
    </tr>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function GerenciadorColunas() {
  const { t } = useTranslation()
  const tipoLabels = useMemo<Record<string, string>>(() => ({
    texto:          t('pedido.config_colunas.tipo_texto'),
    numero:         t('pedido.config_colunas.tipo_numero'),
    data:           t('pedido.config_colunas.tipo_data'),
    select:         t('pedido.config_colunas.tipo_select'),
    checkbox:       t('pedido.config_colunas.tipo_checkbox'),
    percentual:     t('pedido.config_colunas.tipo_percentual'),
    tipo_documento: t('pedido.config_colunas.tipo_documento'),
  }), [t])
  const escopoLabels = useMemo<Record<string, string>>(() => ({
    pedido: t('pedido.config_colunas.escopo_pedido'),
    item:   t('pedido.config_colunas.escopo_item'),
    ambos:  t('pedido.config_colunas.escopo_ambos'),
  }), [t])
  const visibilidadeLabels = useMemo<Record<string, string>>(() => ({
    todos:   t('pedido.config_colunas.visib_todos'),
    roles:   t('pedido.config_colunas.visib_roles'),
    privado: t('pedido.config_colunas.visib_privado'),
  }), [t])
  const [colunas, setColunas]         = useState<ColunaUsuario[]>([])
  const [carregando, setCarregando]   = useState(true)
  const [erro, setErro]               = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [colunaEdicao, setColunaEdicao] = useState<ColunaUsuario | undefined>(undefined)
  const [confirmarExcluirColunaId, setConfirmarExcluirColunaId] = useState<string | null>(null)

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
      setErro(t('pedido.config_colunas.erro_carregar'))
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

  const handleExcluir = useCallback((id: string) => {
    setConfirmarExcluirColunaId(id)
  }, [])

  const handleExcluirConfirmado = useCallback(async () => {
    const id = confirmarExcluirColunaId
    if (!id) return
    setConfirmarExcluirColunaId(null)
    try {
      await colunasUsuarioApi.excluir(id)
      setColunas(prev => prev.filter(c => c.id !== id))
    } catch {
      setErro(t('pedido.config_colunas.erro_excluir'))
    }
  }, [confirmarExcluirColunaId])

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
        <h3 className="gc-titulo">{t('pedido.config_colunas.titulo')}</h3>
        <BotaoGlobal
          variante="primario"
          tamanho="pequeno"
          icone={<Plus size={14} />}
          onClick={handleNova}
        >
          {t('pedido.config_colunas.nova_coluna')}
        </BotaoGlobal>
      </div>

      {erro && (
        <p className="gc-erro" role="alert">{erro}</p>
      )}

      {carregando ? (
        <div className="gc-carregando" aria-label={t('pedido.config_colunas.aria_carregando')}>
          <GravityLoader tamanho="sm" />
        </div>
      ) : colunas.length === 0 ? (
        <p className="gc-vazio">{t('pedido.config_colunas.vazio')}</p>
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
            <table className="gc-tabela" aria-label={t('pedido.config_colunas.aria_tabela')}>
              <thead>
                <tr>
                  <th className="gc-th gc-th--drag" aria-label={t('pedido.config_colunas.aria_arrastar_th')} />
                  <th className="gc-th">{t('pedido.config_colunas.th_nome')}</th>
                  <th className="gc-th">{t('pedido.config_colunas.th_tipo')}</th>
                  <th className="gc-th">{t('pedido.config_colunas.th_escopo')}</th>
                  <th className="gc-th">{t('pedido.config_colunas.th_visibilidade')}</th>
                  <th className="gc-th gc-th--acoes">{t('pedido.config_colunas.th_acoes')}</th>
                </tr>
              </thead>
              <tbody>
                {colunas.map(coluna => (
                  <LinhaColunaSortavel
                    key={coluna.id}
                    coluna={coluna}
                    onEditar={handleEditar}
                    onExcluir={handleExcluir}
                    tipoLabels={tipoLabels}
                    escopoLabels={escopoLabels}
                    visibilidadeLabels={visibilidadeLabels}
                    ariaEditar={(nome) => t('pedido.config_colunas.aria_editar', { nome })}
                    ariaExcluir={(nome) => t('pedido.config_colunas.aria_excluir', { nome })}
                    ariaArrastar={t('pedido.config_colunas.aria_arrastar_reordenar')}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      )}

      <ModalConfirmarExcluirGlobal
        aberto={confirmarExcluirColunaId !== null}
        titulo={t('pedido.config_colunas.modal_excluir_titulo')}
        descricao={t('pedido.config_colunas.modal_excluir_descricao')}
        nomeItem={colunas.find(c => c.id === confirmarExcluirColunaId)?.nome}
        aoConfirmar={handleExcluirConfirmado}
        aoCancelar={() => setConfirmarExcluirColunaId(null)}
      />

      {modalAberto && (
        <ModalNovaColunaUsuario
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
