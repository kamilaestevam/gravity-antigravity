/**
 * Helpers — tipo_fornecedor_organizacao (Cadastros SSOT).
 * Importado pelo front (Usuarios.tsx) e back (prestador-fornecedor-vinculo-service).
 */
import {
  tipoFornecedorOrganizacaoEnum,
  type CriarFornecedorOrganizacaoInput,
} from '../../cadastros/shared/schemas/fornecedor-organizacao.schema.js'
import type { CriarFornecedorInput } from '../../cadastros/shared/schemas/fornecedor.schema.js'

export { tipoFornecedorOrganizacaoEnum }
export type TipoFornecedorOrganizacao = CriarFornecedorOrganizacaoInput['tipo_fornecedor_organizacao']

export const ROTULOS_TIPO_FORNECEDOR_ORGANIZACAO: Record<TipoFornecedorOrganizacao, string> = {
  AGENTE_CARGA: 'Agente de carga',
  DESPACHANTE_ADUANEIRO: 'Despachante aduaneiro',
  ARMADOR: 'Armador',
  CIA_AEREA: 'Companhia aérea',
  TRANSPORTADORA_RODOVIARIA_NACIONAL: 'Transportadora rodoviária nacional',
  TRANSPORTADORA_RODOVIARIA_INTERNACIONAL: 'Transportadora rodoviária internacional',
  ARMAZEM_ALFANDEGADO: 'Armazém alfandegado',
  ARMAZEM_NACIONAL: 'Armazém nacional',
  BANCO: 'Banco',
  SEGURADORA_INTERNACIONAL: 'Seguradora internacional',
  CORRETORA_CAMBIO: 'Corretora de câmbio',
  FABRICANTE: 'Fabricante',
}

/** Tipos mais usados no BID Frete — ordem do select no convite. */
export const TIPOS_FORNECEDOR_BID_FRETE: TipoFornecedorOrganizacao[] = [
  'AGENTE_CARGA',
  'ARMADOR',
  'CIA_AEREA',
  'DESPACHANTE_ADUANEIRO',
  'TRANSPORTADORA_RODOVIARIA_INTERNACIONAL',
]

type FlagsFornecedor = Pick<
  CriarFornecedorInput,
  | 'pode_ser_agente_fornecedor'
  | 'pode_ser_despachante_fornecedor'
  | 'pode_ser_armador_fornecedor'
  | 'pode_ser_cia_aerea_fornecedor'
  | 'pode_ser_transportadora_rodoviaria_nacional_fornecedor'
  | 'pode_ser_transportadora_rodoviaria_internacional_fornecedor'
  | 'pode_ser_armazem_alfandegado_fornecedor'
  | 'pode_ser_armazem_nacional_fornecedor'
  | 'pode_ser_banco_fornecedor'
  | 'pode_ser_seguradora_internacional_fornecedor'
  | 'pode_ser_seguradora_corretora_cambio_fornecedor'
  | 'pode_ser_fabricante_fornecedor'
>

const FLAGS_ZERADAS: FlagsFornecedor = {
  pode_ser_agente_fornecedor: false,
  pode_ser_despachante_fornecedor: false,
  pode_ser_armador_fornecedor: false,
  pode_ser_cia_aerea_fornecedor: false,
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
  pode_ser_armazem_alfandegado_fornecedor: false,
  pode_ser_armazem_nacional_fornecedor: false,
  pode_ser_banco_fornecedor: false,
  pode_ser_seguradora_internacional_fornecedor: false,
  pode_ser_seguradora_corretora_cambio_fornecedor: false,
  pode_ser_fabricante_fornecedor: false,
}

/** Mapeia categoria COMEX → flags `pode_ser_*` no cartório Cadastros. */
export function flagsCadastroPorTipoFornecedorOrganizacao(
  tipo: TipoFornecedorOrganizacao,
): FlagsFornecedor {
  const base = { ...FLAGS_ZERADAS }
  switch (tipo) {
    case 'AGENTE_CARGA':
      return { ...base, pode_ser_agente_fornecedor: true }
    case 'DESPACHANTE_ADUANEIRO':
      return { ...base, pode_ser_despachante_fornecedor: true }
    case 'ARMADOR':
      return { ...base, pode_ser_armador_fornecedor: true }
    case 'CIA_AEREA':
      return { ...base, pode_ser_cia_aerea_fornecedor: true }
    case 'TRANSPORTADORA_RODOVIARIA_NACIONAL':
      return { ...base, pode_ser_transportadora_rodoviaria_nacional_fornecedor: true }
    case 'TRANSPORTADORA_RODOVIARIA_INTERNACIONAL':
      return { ...base, pode_ser_transportadora_rodoviaria_internacional_fornecedor: true }
    case 'ARMAZEM_ALFANDEGADO':
      return { ...base, pode_ser_armazem_alfandegado_fornecedor: true }
    case 'ARMAZEM_NACIONAL':
      return { ...base, pode_ser_armazem_nacional_fornecedor: true }
    case 'BANCO':
      return { ...base, pode_ser_banco_fornecedor: true }
    case 'SEGURADORA_INTERNACIONAL':
      return { ...base, pode_ser_seguradora_internacional_fornecedor: true }
    case 'CORRETORA_CAMBIO':
      return { ...base, pode_ser_seguradora_corretora_cambio_fornecedor: true }
    case 'FABRICANTE':
      return { ...base, pode_ser_fabricante_fornecedor: true }
    default: {
      const _exhaustive: never = tipo
      return _exhaustive
    }
  }
}
