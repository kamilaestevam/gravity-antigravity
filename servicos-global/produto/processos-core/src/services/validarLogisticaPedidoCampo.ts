/**
 * validarLogisticaPedidoCampo.ts — Validação cruzada de campos logísticos
 * do Pedido contra Cadastros (Mandamentos 06+08).
 */
import { AppError } from './saldo-pedido.js'
import {
  buscarAeroportoPorCodigo,
  buscarPaisPorCodigo,
  buscarPortoPorUnlocode,
  type CadastrosRequestContext,
} from './cadastrosClient.js'

const CAMPOS_LOGISTICA = new Set([
  'porto_origem',
  'porto_destino',
  'local_de_origem',
  'local_de_destino',
  'aeroporto_origem',
  'aeroporto_destino',
])

function asAtivo(record: Record<string, unknown>, campo: string): boolean {
  const valor = record[campo]
  return valor === true || valor === undefined
}

export async function validarLogisticaPedidoCampo(
  campo: string,
  valor: unknown,
  ctx: CadastrosRequestContext,
): Promise<void> {
  if (!CAMPOS_LOGISTICA.has(campo)) return
  if (valor == null || valor === '') return

  if (typeof valor !== 'string') {
    throw new AppError(400, `Valor invalido para campo "${campo}" — esperado texto. [corr=${ctx.correlation_id}]`)
  }

  const codigo = valor.trim()
  if (!codigo) return

  switch (campo) {
    case 'porto_origem':
    case 'porto_destino': {
      const porto = await buscarPortoPorUnlocode(codigo, ctx)
      if (!porto) {
        throw new AppError(
          400,
          `Porto "${codigo}" nao existe em cadastros.porto (campo ${campo}). [corr=${ctx.correlation_id}]`,
        )
      }
      if (!asAtivo(porto, 'ativo_porto')) {
        throw new AppError(
          400,
          `Porto "${codigo}" esta inativo em cadastros.porto (campo ${campo}). [corr=${ctx.correlation_id}]`,
        )
      }
      break
    }
    case 'local_de_origem':
    case 'local_de_destino': {
      const pais = await buscarPaisPorCodigo(codigo, ctx)
      if (!pais) {
        throw new AppError(
          400,
          `Pais "${codigo}" nao existe em cadastros.pais (campo ${campo}). [corr=${ctx.correlation_id}]`,
        )
      }
      if (!asAtivo(pais, 'ativo_pais')) {
        throw new AppError(
          400,
          `Pais "${codigo}" esta inativo em cadastros.pais (campo ${campo}). [corr=${ctx.correlation_id}]`,
        )
      }
      break
    }
    case 'aeroporto_origem':
    case 'aeroporto_destino': {
      const aeroporto = await buscarAeroportoPorCodigo(codigo, ctx)
      if (!aeroporto) {
        throw new AppError(
          400,
          `Aeroporto "${codigo}" nao existe em cadastros.aeroporto (campo ${campo}). [corr=${ctx.correlation_id}]`,
        )
      }
      if (!asAtivo(aeroporto, 'ativo_aeroporto')) {
        throw new AppError(
          400,
          `Aeroporto "${codigo}" esta inativo em cadastros.aeroporto (campo ${campo}). [corr=${ctx.correlation_id}]`,
        )
      }
      break
    }
    default:
      break
  }
}
