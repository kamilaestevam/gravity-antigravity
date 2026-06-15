/**
 * Carrega catálogo Cadastros para resolução de rota na importação — paridade modal manual.
 */
import { carregarCatalogoAeroportosCadastros } from '@nucleo/catalogo-aeroportos-cadastros'
import type { ContextoCatalogoRota } from '../../../shared/rota-cotacao-bid-frete-internacional'
import { cadastrosApi } from './cadastrosApi'

export async function carregarContextoCatalogoRotaImportacaoBid(): Promise<ContextoCatalogoRota> {
  const [portosResp, aeroportosItens] = await Promise.all([
    cadastrosApi.listarPortos({ limit: 500 }),
    carregarCatalogoAeroportosCadastros(p => cadastrosApi.listarAeroportos(p)),
  ])

  return {
    portos: portosResp.itens.map(p => ({
      codigo_unlocode_porto: p.codigo_unlocode_porto,
      nome_porto: p.nome_porto,
      codigo_pais_porto: p.codigo_pais_porto ?? null,
    })),
    aeroportos: aeroportosItens.map(a => ({
      codigo_unlocode_aeroporto: a.codigo_unlocode_aeroporto,
      codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? null,
      nome_aeroporto: a.nome_aeroporto,
      codigo_pais_aeroporto: a.codigo_pais_aeroporto ?? null,
    })),
  }
}
