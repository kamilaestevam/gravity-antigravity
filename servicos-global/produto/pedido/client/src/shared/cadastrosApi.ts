/**
 * cadastrosApi.ts — Cliente HTTP do Pedido para o serviço Cadastros.
 *
 * Endpoints consumidos:
 *   GET  /api/v1/empresas                    — lista paginada (suporta `busca`, `por_pagina`)
 *   POST /api/v1/empresas                    — cria nova empresa (cadastro rápido inline)
 *   GET  /api/v1/cadastros/paises            — catálogo de países (fonte única)
 *
 * Histórico DDD: o router de Empresa foi montado em /api/v1/empresas (raiz)
 * em vez de /api/v1/cadastros/empresas — ver cadastros/server/src/index.ts:42.
 * O Vite tem proxy `/api/v1/empresas` → 8031 (configurador/vite.config.ts:128).
 *
 * Mandamentos respeitados:
 *   - 03 (DDD): nomes em PT-BR (`nome_empresa`, `pais_empresa`, `pode_ser_*`)
 *   - 06 (Zod no backend): validação principal está no Cadastros via
 *     `criarEmpresaSchema`. Frontend não duplica regras, só envia o shape certo.
 *   - 08 (fim dos fallbacks silenciosos): erros 401/403/409/422 propagam mensagens
 *     específicas pra UI tratar — `request<T>` já preserva `error.details`.
 *
 * Tipos: declarados localmente para evitar problemas de rootDir cross-produto.
 * Source-of-truth: servicos-global/cadastros/shared/schemas/empresa.schema.ts
 * (manter em sincronia se o schema do Cadastros evoluir).
 */

import { request, getApiContext } from './api'

// ── Tipos (espelho do empresaSchema do Cadastros) ─────────────────────────────

export interface Empresa {
  suid_empresa: string
  id_organizacao: string
  nome_empresa: string
  cnpj_empresa: string | null
  tin_empresa: string | null
  pais_empresa: string
  estado_empresa: string | null
  cidade_empresa: string | null
  endereco_empresa: string | null
  zipcode_empresa: string | null
  email_empresa: string | null
  telefone_empresa: string | null
  whatsapp_empresa: string | null
  pode_ser_importador_empresa: boolean
  pode_ser_exportador_empresa: boolean
  pode_ser_fabricante_empresa: boolean
  pode_ser_agente_empresa: boolean
  pode_ser_despachante_empresa: boolean
  pode_ser_armador_empresa: boolean
  pode_ser_cia_aerea_empresa: boolean
  pode_ser_transportadora_rodoviaria_nacional_empresa: boolean
  pode_ser_transportadora_rodoviaria_internacional_empresa: boolean
  pode_ser_armazem_alfandegado_empresa: boolean
  pode_ser_armazem_nacional_empresa: boolean
  pode_ser_banco_empresa: boolean
  pode_ser_seguradora_internacional_empresa: boolean
  pode_ser_seguradora_corretora_cambio_empresa: boolean
  ativo_empresa: boolean
}

export interface ListaEmpresas {
  itens: Empresa[]
  total: number
  pagina: number
  por_pagina: number
}

export interface Pais {
  id_pais: string
  codigo_pais_iso_alpha2: string      // ISO-2 (BR, US, CN...)
  codigo_pais_iso_alpha3: string      // ISO-3 (BRA, USA, CHN...)
  nome_pais_portugues: string
  nome_pais_ingles: string
  ativo_pais: boolean
}

// ── Payload de criação rápida — papel definido pelo contexto do modal ────────

export type PapelEmpresaRapido =
  | 'importador'
  | 'exportador'
  | 'fabricante'

export interface CriarEmpresaRapidoInput {
  nome_empresa: string
  pais_empresa: string
  cnpj_empresa?: string | null
  papel: PapelEmpresaRapido
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toCriarEmpresaPayload(input: CriarEmpresaRapidoInput): Record<string, unknown> {
  // id_organizacao é EXIGIDO pelo criarEmpresaSchema (Zod) do Cadastros — Mand.
  // 06/09. O `request()` já injeta o header x-id-organizacao, mas o schema
  // valida o body antes do controller, então enviamos explícito também.
  // Defesa em profundidade: header (proxy) + body (Zod).
  const { idOrganizacao } = getApiContext()

  const papelFlags: Record<string, boolean> = {
    pode_ser_importador_empresa:  input.papel === 'importador',
    pode_ser_exportador_empresa:  input.papel === 'exportador',
    pode_ser_fabricante_empresa:  input.papel === 'fabricante',
  }

  return {
    id_organizacao:      idOrganizacao,
    nome_empresa:        input.nome_empresa.trim(),
    pais_empresa:        input.pais_empresa,
    cnpj_empresa:        input.pais_empresa === 'BR' && input.cnpj_empresa ? input.cnpj_empresa : null,
    ...papelFlags,
    ativo_empresa:       true,
  }
}

// ── API público ───────────────────────────────────────────────────────────────

export const cadastrosApi = {
  /**
   * Lista empresas da organização. Suporta filtro por busca textual no nome.
   * `por_pagina` máximo é 200 no backend; usamos 200 por padrão para evitar
   * paginação no SelectGlobal (cenário Manual de criar pedido).
   */
  listarEmpresas: (busca?: string, por_pagina = 200): Promise<ListaEmpresas> => {
    const params = new URLSearchParams({ por_pagina: String(por_pagina) })
    if (busca && busca.trim()) params.set('busca', busca.trim())
    return request<ListaEmpresas>(`/api/v1/empresas?${params.toString()}`)
  },

  /**
   * Cria empresa via fluxo rápido do modal de Pedido. Apenas nome+país+papel
   * são preenchidos — usuário completa demais dados depois no Cadastros.
   * Lança erro com mensagem específica para 401/403/409/422 (Mandamento 08).
   */
  criarEmpresa: async (input: CriarEmpresaRapidoInput): Promise<Empresa> => {
    const payload = toCriarEmpresaPayload(input)
    return request<Empresa>('/api/v1/empresas', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Lista países (fonte única — já vem ordenado: Brasil primeiro).
   */
  listarPaises: (): Promise<{ itens: Pais[] }> =>
    request<{ itens: Pais[] }>('/api/v1/cadastros/paises'),
}
