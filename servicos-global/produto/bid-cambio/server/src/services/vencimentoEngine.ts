/**
 * vencimentoEngine.ts — Motor de Calculo de Datas de Vencimento
 * Implementa os 7 metodos de calculo (BidCambioBaseVencimento enum).
 *
 * RN-107: Usa "Data Carga Pronta"; se vazia, fallback para "Data Esperada da Prontidao"
 */

interface DatasProcesso {
  data_carga_pronta?: Date | null
  data_esperada_prontidao?: Date | null
  data_embarque_final?: Date | null
  data_chegada_final?: Date | null
  data_registro_di?: Date | null
  data_desembaraco?: Date | null
  data_entrega?: Date | null
}

type BidCambioBaseVencimento =
  | 'DATA_EMBARQUE'
  | 'DATA_CHEGADA'
  | 'DATA_REGISTRO_DI'
  | 'DATA_DESEMBARACO'
  | 'DATA_ENTREGA'
  | 'PRONTIDAO_CARGA'
  | 'DATA_FIXA'

/**
 * Calcula a data de vencimento com base no metodo + prazo em dias
 * Retorna null se a data-base nao estiver disponivel ainda
 */
export function calcularDataVencimento(
  metodo: BidCambioBaseVencimento,
  prazoDias: number,
  datas: DatasProcesso,
  dataFixa?: Date | null,
): Date | null {
  let dataBase: Date | null = null

  switch (metodo) {
    case 'DATA_EMBARQUE':
      dataBase = datas.data_embarque_final ?? null
      break
    case 'DATA_CHEGADA':
      dataBase = datas.data_chegada_final ?? null
      break
    case 'DATA_REGISTRO_DI':
      dataBase = datas.data_registro_di ?? null
      break
    case 'DATA_DESEMBARACO':
      dataBase = datas.data_desembaraco ?? null
      break
    case 'DATA_ENTREGA':
      dataBase = datas.data_entrega ?? null
      break
    case 'PRONTIDAO_CARGA':
      // RN-107: Data Carga Pronta tem prioridade; fallback para Data Esperada da Prontidao
      dataBase = datas.data_carga_pronta ?? datas.data_esperada_prontidao ?? null
      break
    case 'DATA_FIXA':
      dataBase = dataFixa ?? null
      break
  }

  if (!dataBase) return null

  const vencimento = new Date(dataBase)
  vencimento.setDate(vencimento.getDate() + prazoDias)
  return vencimento
}

/**
 * Recalcula vencimentos de todas as parcelas pendentes de um pedido
 * Chamado quando datas do processo mudam
 */
export function recalcularVencimentosParcelas(
  parcelas: Array<{
    id_parcela_bid_cambio: string
    metodo_vencimento_parcela_bid_cambio: BidCambioBaseVencimento | null
    prazo_dias_parcela_bid_cambio: number | null
    status_parcela_bid_cambio: string
  }>,
  datas: DatasProcesso,
): Array<{ id_parcela_bid_cambio: string; data_vencimento_parcela_bid_cambio: Date | null }> {
  return parcelas
    .filter(p => p.status_parcela_bid_cambio === 'PENDENTE' && p.metodo_vencimento_parcela_bid_cambio && p.prazo_dias_parcela_bid_cambio != null)
    .map(p => ({
      id_parcela_bid_cambio: p.id_parcela_bid_cambio,
      data_vencimento_parcela_bid_cambio: calcularDataVencimento(
        p.metodo_vencimento_parcela_bid_cambio!,
        p.prazo_dias_parcela_bid_cambio!,
        datas,
      ),
    }))
}
