import React from 'react'
import { PaginaGlobal } from '../../../Layout/pagina-global/src/index.js'
import { CabecalhoGlobal } from '../../../Layout/cabecalho-global/src/index.js'
import type { PaginaDashboardProps } from './tipos.js'
import './pagina-dashboard.css'

/**
 * PaginaDashboardGlobal — Template pronto para páginas de dashboard.
 *
 * Compõe automaticamente Cabecalho + KPI cards em grid + conteúdo flexível,
 * eliminando a montagem manual de dashboards.
 *
 * @example
 * <PaginaDashboardGlobal
 *   titulo="Dashboard"
 *   subtitulo="Visão geral do período."
 *   icone={<ChartBar weight="duotone" size={22} />}
 *   toolbar={<FiltrosPeriodo ... />}
 *   kpis={<>
 *     <CardEstatisticaGlobal titulo="Receita" valor="R$ 150k" />
 *     <CardEstatisticaGlobal titulo="Clientes" valor={342} />
 *     <CardEstatisticaGlobal titulo="Conversão" valor="12.5%" />
 *     <CardEstatisticaGlobal titulo="Tickets" valor={18} />
 *   </>}
 * >
 *   <GridGlobal colunas={2} gap={4}>
 *     <SecaoGlobal titulo="Vendas por Mês" card>
 *       <GraficoLinhas ... />
 *     </SecaoGlobal>
 *     <SecaoGlobal titulo="Top Produtos" card>
 *       <GraficoBarras ... />
 *     </SecaoGlobal>
 *   </GridGlobal>
 * </PaginaDashboardGlobal>
 */
export function PaginaDashboardGlobal({
  titulo,
  subtitulo,
  icone,
  acoes,
  viewToggle,
  kpis,
  toolbar,
  children,
  className,
}: PaginaDashboardProps) {
  return (
    <PaginaGlobal
      layout="lista"
      className={className}
      cabecalho={
        <CabecalhoGlobal
          titulo={titulo}
          subtitulo={subtitulo}
          icone={icone}
          viewToggle={viewToggle}
          acoes={acoes}
        />
      }
      stats={kpis}
      toolbar={toolbar}
    >
      <div className="pd-conteudo">
        {children}
      </div>
    </PaginaGlobal>
  )
}
