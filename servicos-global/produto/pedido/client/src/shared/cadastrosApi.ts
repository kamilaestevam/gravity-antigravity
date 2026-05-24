/**
 * cadastrosApi.ts — Cliente HTTP do Pedido para o serviço Cadastros.
 *
 * Endpoints consumidos:
 *   GET  /api/v1/fornecedores                    — lista paginada (suporta `busca`, `por_pagina`)
 *   POST /api/v1/fornecedores                    — cria nova empresa (cadastro rápido inline)
 *   GET  /api/v1/cadastros/paises            — catálogo de países (fonte única)
 *
 * Histórico DDD: o router de Empresa foi montado em /api/v1/fornecedores (raiz)
 * em vez de /api/v1/cadastros/empresas — ver cadastros/server/src/index.ts:42.
 * O Vite tem proxy `/api/v1/fornecedores` → 8031 (configurador/vite.config.ts:128).
 *
 * Mandamentos respeitados:
 *   - 03 (DDD): nomes em PT-BR (`nome_fornecedor`, `pais_fornecedor`, `pode_ser_*`)
 *   - 06 (Zod no backend): validação principal está no Cadastros via
 *     `criarFornecedorSchema`. Frontend não duplica regras, só envia o shape certo.
 *   - 08 (fim dos fallbacks silenciosos): erros 401/403/409/422 propagam mensagens
 *     específicas pra UI tratar — `request<T>` já preserva `error.details`.
 *
 * Tipos: declarados localmente para evitar problemas de rootDir cross-produto.
 * Source-of-truth: servicos-global/cadastros/shared/schemas/empresa.schema.ts
 * (manter em sincronia se o schema do Cadastros evoluir).
 */

import { request, getApiContext } from './api'

// ── Tipos (espelho do fornecedorSchema do Cadastros) ─────────────────────────────

export interface Empresa {
  id_fornecedor: string
  id_organizacao: string
  nome_fornecedor: string
  cnpj_fornecedor: string | null
  tin_fornecedor: string | null
  pais_fornecedor: string
  estado_provincia_fornecedor: string | null
  cidade_fornecedor: string | null
  endereco_fornecedor: string | null
  cep_zipcode_fornecedor: string | null
  email_principal_fornecedor: string | null
  telefone_principal_fornecedor: string | null
  whatsapp_principal_fornecedor: string | null
  pode_ser_importador_fornecedor: boolean
  pode_ser_exportador_fornecedor: boolean
  pode_ser_fabricante_fornecedor: boolean
  pode_ser_agente_fornecedor: boolean
  pode_ser_despachante_fornecedor: boolean
  pode_ser_armador_fornecedor: boolean
  pode_ser_cia_aerea_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean
  pode_ser_armazem_alfandegado_fornecedor: boolean
  pode_ser_armazem_nacional_fornecedor: boolean
  pode_ser_banco_fornecedor: boolean
  pode_ser_seguradora_internacional_fornecedor: boolean
  pode_ser_seguradora_corretora_cambio_fornecedor: boolean
  ativo_fornecedor: boolean
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
  nome_fornecedor: string
  pais_fornecedor: string
  /** CNPJ obrigatório quando pais_fornecedor==='BR'. Validado no cliente antes de chamar. */
  cnpj_fornecedor?: string | null
  /** TIN obrigatório quando pais_fornecedor!=='BR'. Validado no cliente antes de chamar. */
  tin_fornecedor?: string | null
  papel: PapelEmpresaRapido
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toCriarEmpresaPayload(input: CriarEmpresaRapidoInput): Record<string, unknown> {
  // id_organizacao é EXIGIDO pelo criarFornecedorSchema (Zod) do Cadastros — Mand.
  // 06/09. O `request()` já injeta o header x-id-organizacao, mas o schema
  // valida o body antes do controller, então enviamos explícito também.
  // Defesa em profundidade: header (proxy) + body (Zod).
  const { idOrganizacao } = getApiContext()

  const papelFlags: Record<string, boolean> = {
    pode_ser_importador_fornecedor:  input.papel === 'importador',
    pode_ser_exportador_fornecedor:  input.papel === 'exportador',
    pode_ser_fabricante_fornecedor:  input.papel === 'fabricante',
  }

  const ehBr = input.pais_fornecedor === 'BR'
  return {
    id_organizacao:      idOrganizacao,
    nome_fornecedor:        input.nome_fornecedor.trim(),
    pais_fornecedor:        input.pais_fornecedor,
    cnpj_fornecedor:        ehBr && input.cnpj_fornecedor ? input.cnpj_fornecedor.trim() : null,
    tin_fornecedor:         !ehBr && input.tin_fornecedor ? input.tin_fornecedor.trim() : null,
    ...papelFlags,
    ativo_fornecedor:       true,
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
    return request<ListaEmpresas>(`/api/v1/fornecedores?${params.toString()}`)
  },

  /**
   * Resolve a empresa-da-organização (1:1) — a Empresa cadastrada em Cadastros
   * que representa a própria organização do usuário. Distingue-se das demais
   * empresas (parceiros estrangeiros, fabricantes) via lookup cross-banco:
   * Configurador.Organizacao.id_fornecedor_organizacao → Cadastros.Empresa.
   *
   * Usado pelo ModalPedidoNovo para auto-preencher o Importador (em IMPORTACAO)
   * ou Exportador (em EXPORTACAO) — esse lado fica somente leitura, com tooltip.
   *
   * Mandamento 08 (sem fallbacks silenciosos): erro 404 sobe com mensagem clara
   * para a UI exibir ao master do workspace.
   */
  obterEmpresaDaOrganizacao: (): Promise<Empresa> =>
    request<Empresa>('/api/v1/fornecedores/da-organizacao'),

  /**
   * Cria empresa via fluxo rápido do modal de Pedido. Apenas nome+país+papel
   * são preenchidos — usuário completa demais dados depois no Cadastros.
   * Lança erro com mensagem específica para 401/403/409/422 (Mandamento 08).
   */
  criarEmpresa: async (input: CriarEmpresaRapidoInput): Promise<Empresa> => {
    const payload = toCriarEmpresaPayload(input)
    return request<Empresa>('/api/v1/fornecedores', {
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
