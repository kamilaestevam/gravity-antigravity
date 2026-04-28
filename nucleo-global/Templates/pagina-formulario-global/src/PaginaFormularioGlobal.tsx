import React from 'react'
import { PaginaGlobal } from '../../../Layout/pagina-global/src/index.js'
import { CabecalhoGlobal } from '../../../Layout/cabecalho-global/src/index.js'
import { BotoesSalvarGlobal } from '../../../Botoes/botoes-salvar-global/src/botoes-salvar.js'
import type { PaginaFormularioProps } from './tipos.js'

/**
 * PaginaFormularioGlobal — Template pronto para páginas de formulário.
 *
 * Compõe automaticamente Cabecalho + conteúdo centralizado + BotoesSalvarGlobal,
 * seguindo o padrão visual do Configurador (Organizacao.tsx).
 *
 * Use SecaoGlobal com card + GridGlobal com gap={5} (1.25rem) para os campos.
 *
 * @example
 * <PaginaFormularioGlobal
 *   titulo="Nova Empresa"
 *   subtitulo="Cadastre uma nova empresa filha."
 *   icone={<Buildings weight="duotone" size={22} />}
 *   dirty={isDirty}
 *   salvando={isLoading}
 *   aoSalvar={handleSalvar}
 *   aoCancelar={handleCancelar}
 * >
 *   <SecaoGlobal titulo="Dados Gerais" icone={<Buildings weight="duotone" size={14} />} card>
 *     <GridGlobal colunas={2} gap={5}>
 *       <CampoGeralGlobal label="Razão Social" ... />
 *       <CampoGeralGlobal label="CNPJ" ... />
 *     </GridGlobal>
 *   </SecaoGlobal>
 * </PaginaFormularioGlobal>
 */
export function PaginaFormularioGlobal({
  titulo,
  subtitulo,
  icone,
  children,
  dirty = false,
  salvando = false,
  aoSalvar,
  aoCancelar,
  semAcoes = false,
  toolbar,
  className,
}: PaginaFormularioProps) {
  return (
    <PaginaGlobal
      layout="formulario"
      className={className}
      cabecalho={
        <CabecalhoGlobal
          titulo={titulo}
          subtitulo={subtitulo}
          icone={icone}
        />
      }
      toolbar={toolbar}
    >
      {children}

      {!semAcoes && (aoSalvar || aoCancelar) && (
        <BotoesSalvarGlobal
          dirty={dirty}
          salvando={salvando}
          onSalvar={aoSalvar}
          onCancelar={aoCancelar}
          alinhamento="direita"
        />
      )}
    </PaginaGlobal>
  )
}
