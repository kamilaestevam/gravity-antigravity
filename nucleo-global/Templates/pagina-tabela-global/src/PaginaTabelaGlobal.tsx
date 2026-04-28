import React from 'react'
import { PaginaGlobal } from '../../../Layout/pagina-global/src/index.js'
import { CabecalhoGlobal } from '../../../Layout/cabecalho-global/src/index.js'
import { TabelaGlobal } from '../../../Tabelas/tabela-global/src/index.js'
import type { RegistroTabela } from '../../../Tabelas/tabela-global/src/tipos.js'
import type { PaginaTabelaProps } from './tipos.js'

/**
 * PaginaTabelaGlobal — Template pronto para páginas de listagem.
 *
 * Compõe automaticamente Cabecalho + Stats + Toolbar + Tabela
 * no layout padrão do PaginaGlobal, eliminando a montagem manual.
 *
 * @example
 * <PaginaTabelaGlobal
 *   titulo="Empresas"
 *   subtitulo="Gerencie as empresas do tenant."
 *   icone={<Buildings weight="duotone" size={22} />}
 *   acaoPrimaria={<BotaoGlobal variante="primario">Nova Empresa</BotaoGlobal>}
 *   stats={<>
 *     <CardEstatisticaGlobal titulo="Total" valor={42} />
 *     <CardEstatisticaGlobal titulo="Ativas" valor={38} />
 *   </>}
 *   tabela={{
 *     colunas: [...],
 *     dados: empresas,
 *     buscaGlobal: true,
 *     selecao: true,
 *     acoesLinha: [...],
 *   }}
 * />
 */
export function PaginaTabelaGlobal<T extends RegistroTabela = RegistroTabela>({
  titulo,
  subtitulo,
  icone,
  acaoPrimaria,
  viewToggle,
  stats,
  toolbar,
  tabela,
  className,
}: PaginaTabelaProps<T>) {
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
          acoes={acaoPrimaria}
        />
      }
      stats={stats}
      toolbar={toolbar}
    >
      <TabelaGlobal {...tabela} />
    </PaginaGlobal>
  )
}
