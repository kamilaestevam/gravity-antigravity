/**
 * ConfiguracoesLayout — wrapper das telas de Configuracao do Processo.
 *
 * Estrutura: sub-sidebar com categorias (Visualizacoes / Processo / Sistema)
 * + Outlet pro conteudo da sub-pagina ativa.
 *
 * Espelha o padrao do produto Pedido: Configuracoes vira um "hub" com
 * varias telas de tunning, navegadas via sub-sidebar.
 */

import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  GearSix, SquaresFour, ChartPieSlice, Table,
  Columns, Kanban, Tag, Hash, FileText, Funnel,
  FolderOpen, CurrencyCircleDollar, Bookmark, Bell, Export,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import './ConfiguracoesLayout.css'

interface ItemConfig {
  id: string
  to: string
  label: string
  icone: React.ReactNode
  /** Quando true, o item esta apenas como stub (ainda nao implementado) */
  stub?: boolean
}

interface GrupoConfig {
  titulo: string
  itens: ItemConfig[]
}

const GRUPOS: GrupoConfig[] = [
  {
    titulo: 'Visualizações',
    itens: [
      { id: 'cards',       to: 'cards',       label: 'Cards',       icone: <SquaresFour size={16} weight="duotone" />, stub: true },
      { id: 'visao-geral', to: 'visao-geral', label: 'Visão Geral', icone: <ChartPieSlice size={16} weight="duotone" />, stub: true },
      { id: 'tabela',      to: 'tabela',      label: 'Tabela',      icone: <Table size={16} weight="duotone" />, stub: true },
      { id: 'colunas',     to: 'colunas',     label: 'Colunas',     icone: <Columns size={16} weight="duotone" />, stub: true },
      { id: 'kanban',      to: 'kanban',      label: 'Kanban',      icone: <Kanban size={16} weight="duotone" />, stub: true },
    ],
  },
  {
    titulo: 'Processo',
    itens: [
      { id: 'status',         to: 'status',         label: 'Status',          icone: <Tag size={16} weight="duotone" /> },
      { id: 'numeracao',      to: 'numeracao',      label: 'Numeração',       icone: <Hash size={16} weight="duotone" />, stub: true },
      { id: 'templates-pdf',  to: 'templates-pdf',  label: 'Templates PDF',   icone: <FileText size={16} weight="duotone" />, stub: true },
      { id: 'regras',         to: 'regras',         label: 'Regras',          icone: <Funnel size={16} weight="duotone" />, stub: true },
      { id: 'categ-anexos',   to: 'categ-anexos',   label: 'Categ. Anexos',   icone: <FolderOpen size={16} weight="duotone" />, stub: true },
      { id: 'taxa-cambio',    to: 'taxa-cambio',    label: 'Taxa de Câmbio',  icone: <CurrencyCircleDollar size={16} weight="duotone" />, stub: true },
      { id: 'cadastros',      to: 'cadastros',      label: 'Cadastros',       icone: <Bookmark size={16} weight="duotone" />, stub: true },
    ],
  },
  {
    titulo: 'Sistema',
    itens: [
      { id: 'notificacoes', to: 'notificacoes', label: 'Notificações', icone: <Bell size={16} weight="duotone" />, stub: true },
      { id: 'exportacao',   to: 'exportacao',   label: 'Exportação',   icone: <Export size={16} weight="duotone" />, stub: true },
    ],
  },
]

interface ConfiguracoesLayoutProps {
  /** Quando informado, substitui o <Outlet /> (rotas manuais no ProcessoDetalheRotas). */
  children?: React.ReactNode
}

export default function ConfiguracoesLayout({ children }: ConfiguracoesLayoutProps) {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<GearSix weight="duotone" size={22} />}
          titulo="Configurações"
          subtitulo="Personalize cards, colunas, status e regras do processo"
        />
      }
    >
      <div className="cfg-layout">
        <aside className="cfg-sidebar" aria-label="Navegação Configurações">
          {GRUPOS.map(grupo => (
            <div key={grupo.titulo} className="cfg-grupo">
              <div className="cfg-grupo-titulo">{grupo.titulo}</div>
              {grupo.itens.map(item => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    `cfg-item ${isActive ? 'cfg-item--ativa' : ''} ${item.stub ? 'cfg-item--stub' : ''}`
                  }
                  title={item.stub ? 'Em desenvolvimento' : undefined}
                >
                  <span className="cfg-item-icone">{item.icone}</span>
                  <span className="cfg-item-label">{item.label}</span>
                  {item.stub && <span className="cfg-item-tag">soon</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        <main className="cfg-main">
          {children ?? <Outlet />}
        </main>
      </div>
    </PaginaGlobal>
  )
}
