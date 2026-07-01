/**
 * SSOT client — colunas editáveis na lista Smart Docs (paridade Pedido columnBehaviorConfig).
 */
import { CATALOGO_COLUNAS_DOCUMENTO_SMART_READ } from './catalogo-colunas-documento-smart-read'
import {
  colunaEditavelListaSmartRead,
  listarChavesColunaEditavelListaSmartRead,
  type ColunaCatalogoListaEdicao,
} from '../../../shared/lista-edicao-espelhada-smart-read'

const CATALOGO_LISTA_EDICAO: ColunaCatalogoListaEdicao[] = CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map(
  (col) => ({
    key: col.key,
    tipos: col.tipos,
    caminhos: col.caminhos,
    status: col.status,
  }),
)

export function getEditavelFilhoListaSmartRead(campoColuna: string): boolean {
  if (campoColuna === 'numeros_documento') return true
  return colunaEditavelListaSmartRead(campoColuna, CATALOGO_LISTA_EDICAO)
}

export const CAMPOS_EDITAVEIS_FILHO_LISTA_SMART_READ: string[] =
  listarChavesColunaEditavelListaSmartRead(CATALOGO_LISTA_EDICAO)
