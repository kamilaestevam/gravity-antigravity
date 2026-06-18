import { z } from 'zod'

export const CamposRotaModalTabelaSchema = z.object({
  porto_origem_tabela_bid_frete_internacional: z.string().optional(),
  porto_destino_tabela_bid_frete_internacional: z.string().optional(),
  aeroporto_origem_tabela_bid_frete_internacional: z.string().optional(),
  aeroporto_destino_tabela_bid_frete_internacional: z.string().optional(),
  endereco_origem_tabela_bid_frete_internacional: z.string().optional(),
  endereco_destino_tabela_bid_frete_internacional: z.string().optional(),
  pais_origem_rodoviario_tabela_bid_frete_internacional: z.string().optional(),
  pais_destino_rodoviario_tabela_bid_frete_internacional: z.string().optional(),
  estado_provincia_origem_rodoviario_tabela_bid_frete_internacional: z.string().optional(),
  estado_provincia_destino_rodoviario_tabela_bid_frete_internacional: z.string().optional(),
  cidade_origem_rodoviario_tabela_bid_frete_internacional: z.string().optional(),
  cidade_destino_rodoviario_tabela_bid_frete_internacional: z.string().optional(),
  origem_codigo_tabela_bid_frete_internacional: z.string().optional(),
  origem_nome_tabela_bid_frete_internacional: z.string().optional(),
  origem_pais_tabela_bid_frete_internacional: z.string().optional(),
  destino_codigo_tabela_bid_frete_internacional: z.string().optional(),
  destino_nome_tabela_bid_frete_internacional: z.string().optional(),
  destino_pais_tabela_bid_frete_internacional: z.string().optional(),
})

export const TabelaBidFreteInternacionalInputSchema = z.object({
  modal_tabela_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_tabela_bid_frete_internacional: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
}).merge(CamposRotaModalTabelaSchema).extend({
  moeda_tabela_bid_frete_internacional: z.string().default('USD'),
  valor_frete_tabela_bid_frete_internacional: z.number().positive(),
  taxas_origem_tabela_bid_frete_internacional: z.number().min(0).default(0),
  taxas_destino_tabela_bid_frete_internacional: z.number().min(0).default(0),
  valor_total_tabela_bid_frete_internacional: z.number().positive(),
  dias_transito_tabela_bid_frete_internacional: z.number().int().positive(),
  dias_free_time_tabela_bid_frete_internacional: z.number().int().optional(),
  dias_prazo_pagamento_tabela_bid_frete_internacional: z.number().int().positive().optional(),
  validade_inicio_tabela_bid_frete_internacional: z.string().datetime(),
  validade_fim_tabela_bid_frete_internacional: z.string().datetime(),
})

export type TabelaBidFreteInternacionalInput = z.infer<typeof TabelaBidFreteInternacionalInputSchema>
