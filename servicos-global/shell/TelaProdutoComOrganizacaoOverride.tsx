/**
 * Wrapper de TelaProdutoGlobal com Pendência #4 (override de organização admin).
 *
 * Centraliza wire de menu 🔑 "Trocar Organização", banner âmbar e modal —
 * evita repetir o mesmo bloco em cada App.tsx de produto.
 */

import React, { useMemo, useState } from 'react'
import {
  TelaProdutoGlobal,
  type TelaProdutoGlobalProps,
} from '@nucleo/tela-produto-global'
import { BannerOrganizacaoOverride } from './BannerOrganizacaoOverride'
import { ModalTrocarOrganizacao } from './components/ModalTrocarOrganizacao'
import { useOrganizacaoOverride } from './hooks/useOrganizacaoOverride'
import { useProdutosSwitcher } from './hooks/useProdutosSwitcher'
import { slugsProdutoEquivalentes } from './utils/resolver-rota-produto'
import './banner-organizacao-override.css'

export type TelaProdutoComOrganizacaoOverrideProps = TelaProdutoGlobalProps

export function TelaProdutoComOrganizacaoOverride(
  props: TelaProdutoComOrganizacaoOverrideProps,
): JSX.Element {
  const { podeAtivarOverride, overrideAtivo, limparOverride } = useOrganizacaoOverride()
  const [modalTrocarOrgAberto, setModalTrocarOrgAberto] = useState(false)
  const {
    produtos: produtosSwitcher,
    exibirSeletor: exibirSeletorProduto,
    trocarProduto,
    produtoAtualSlug,
  } = useProdutosSwitcher(props.productId, props.productName)

  const usuario = useMemo(
    () => ({
      ...props.usuario,
      temAcessoTrocarOrganizacao: podeAtivarOverride,
      organizacaoOverrideAtiva:   overrideAtivo,
      aoTrocarOrganizacao:        () => setModalTrocarOrgAberto(true),
      aoVoltarParaGravity:         limparOverride,
    }),
    [props.usuario, podeAtivarOverride, overrideAtivo, limparOverride],
  )

  const layoutClassName = overrideAtivo ? 'layout--override-ativo' : undefined

  return (
    <>
      {overrideAtivo && <BannerOrganizacaoOverride />}
      <TelaProdutoGlobal
        {...props}
        usuario={usuario}
        layoutClassName={layoutClassName}
        produtos={exibirSeletorProduto ? produtosSwitcher : undefined}
        produtoAtualSlug={produtoAtualSlug}
        onSwitchProduct={exibirSeletorProduto ? trocarProduto : undefined}
        produtoSlugEquivalente={slugsProdutoEquivalentes}
      />
      <ModalTrocarOrganizacao
        aberto={modalTrocarOrgAberto}
        aoFechar={() => setModalTrocarOrgAberto(false)}
      />
    </>
  )
}
