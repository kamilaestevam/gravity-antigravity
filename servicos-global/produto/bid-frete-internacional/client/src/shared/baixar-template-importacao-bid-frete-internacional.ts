/**
 * Baixa template .xlsx com listas do Cadastros — paridade lista inline.
 */
import { carregarCatalogoAeroportosCadastros } from '@nucleo/catalogo-aeroportos-cadastros'
import { baixarTemplateXlsxGravity } from '../../../shared/gerar-template-xlsx-importacao-bid-frete-internacional'
import { formatarRotuloCodigoNomeImportacao } from '../../../shared/rotulo-cadastro-importacao-bid-frete-internacional'
import type { ListasCadastrosTemplateBid } from '../../../shared/template-importacao-config-bid-frete-internacional'
import { MOEDAS_PADRAO_TEMPLATE_BID } from '../../../shared/template-importacao-config-bid-frete-internacional'
import { cadastrosApi, rotuloContainerCadastro } from './cadastrosApi'

export async function carregarListasCadastrosTemplateBid(): Promise<ListasCadastrosTemplateBid> {
  const [paisesResp, portosResp, aeroportosItens, containersResp] = await Promise.all([
    cadastrosApi.listarPaises(),
    cadastrosApi.listarPortos({ limit: 500 }),
    carregarCatalogoAeroportosCadastros(p => cadastrosApi.listarAeroportos(p)),
    cadastrosApi.listarContainers({ limit: 500 }),
  ])

  return {
    portos: portosResp.itens
      .map(p => formatarRotuloCodigoNomeImportacao(p.codigo_unlocode_porto, p.nome_porto))
      .filter(Boolean),
    aeroportos: aeroportosItens
      .map(a => {
        const codigo = a.codigo_iata_aeroporto?.trim() || a.codigo_unlocode_aeroporto
        return formatarRotuloCodigoNomeImportacao(codigo, a.nome_aeroporto)
      })
      .filter(Boolean),
    paises: paisesResp.itens
      .map(p => formatarRotuloCodigoNomeImportacao(p.codigo_pais_iso_alpha2, p.nome_pais_portugues))
      .filter(Boolean),
    containers: containersResp.itens
      .map(c => {
        const codigo = c.codigo_iso_container?.trim()
        if (!codigo) return ''
        return formatarRotuloCodigoNomeImportacao(codigo, rotuloContainerCadastro(c))
      })
      .filter(Boolean),
    moedas: [...MOEDAS_PADRAO_TEMPLATE_BID],
  }
}

export async function baixarTemplateImportacaoBidFreteInternacional(): Promise<void> {
  const listas = await carregarListasCadastrosTemplateBid()
  await baixarTemplateXlsxGravity(listas)
}
