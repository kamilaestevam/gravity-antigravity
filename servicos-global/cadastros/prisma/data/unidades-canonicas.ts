/**
 * unidades-canonicas.ts — Lista canônica de unidades de medida.
 *
 * Fonte de dados pro `seed-unidades.ts` E pra qualquer teste que precise
 * validar a integridade da lista. Importável (módulo), diferentemente do
 * `seed-unidades.ts` que é um script com `process.exit`.
 *
 * Origem: Tabela Mestre ERP × uTrib (Siscomex) × uCom (NF-e), mantida pelo
 * dono do projeto. Em 2026-05-08 foi adotada como SSOT (resposta ao bug
 * da migration `fix_model_casing_revert` que apagou a tabela `unidade`).
 *
 * Mapeamento aplicado pelo seed (Caminho A — schema.prisma intacto):
 *   - codigo_unidade ← sigla     (coluna ERP do master, ex: KG, CX10)
 *   - nome_unidade   ← descricao (coluna Descrição, ex: "Quilograma")
 *   - tipo_unidade   ← categoria (categoria lowercased, ex: "peso", "embalagem")
 *   - ativo_unidade  ← true
 *
 * Campos NÃO armazenados (decisão do dono — backlog para próximo schema):
 *   - codigo_utrib_siscomex  (uTrib do master)
 *   - codigo_ucom_nfe        (uCom do master)
 *   - escopo_unidade         (Escopo: Ambos | Apenas NF-e | Apenas Siscomex)
 *   - fator_conversao + unidade_destino (regras "×1000 → KG", "÷100 → METRO")
 * Quando integração ERP/Siscomex/NF-e for prioridade real, abrir migration
 * controlada pelo Coordenador para incluir esses campos.
 */

export interface UnidadeCanonica {
  sigla: string
  descricao: string
  categoria:
    | 'peso'
    | 'volume'
    | 'comprimento'
    | 'area'
    | 'contagem'
    | 'energia'
    | 'gemas'
    | 'agrupamento'
    | 'embalagem'
    | 'caixa'
}

export const UNIDADES_CANONICAS: UnidadeCanonica[] = [
  // ── Peso ────────────────────────────────────────────────────────────
  { sigla: 'G',         descricao: 'Grama',                            categoria: 'peso' },
  { sigla: 'KG',        descricao: 'Quilograma',                       categoria: 'peso' },
  { sigla: 'TON',       descricao: 'Tonelada',                         categoria: 'peso' },
  // ── Volume ──────────────────────────────────────────────────────────
  { sigla: 'ML',        descricao: 'Mililitro',                        categoria: 'volume' },
  { sigla: 'LT',        descricao: 'Litro',                            categoria: 'volume' },
  { sigla: 'M3',        descricao: 'Metro cúbico',                     categoria: 'volume' },
  // ── Comprimento ─────────────────────────────────────────────────────
  { sigla: 'CM',        descricao: 'Centímetro',                       categoria: 'comprimento' },
  { sigla: 'M',         descricao: 'Metro',                            categoria: 'comprimento' },
  // ── Área ────────────────────────────────────────────────────────────
  { sigla: 'CM2',       descricao: 'Centímetro quadrado',              categoria: 'area' },
  { sigla: 'M2',        descricao: 'Metro quadrado',                   categoria: 'area' },
  // ── Contagem ────────────────────────────────────────────────────────
  { sigla: 'UN',        descricao: 'Unidade',                          categoria: 'contagem' },
  { sigla: 'PC',        descricao: 'Peça',                             categoria: 'contagem' },
  { sigla: 'PARES',     descricao: 'Pares',                            categoria: 'contagem' },
  { sigla: 'DUZIA',     descricao: 'Dúzia',                            categoria: 'contagem' },
  { sigla: 'CENTO',     descricao: 'Cento',                            categoria: 'contagem' },
  { sigla: 'MILHEI',    descricao: 'Milheiro',                         categoria: 'contagem' },
  // ── Energia ─────────────────────────────────────────────────────────
  { sigla: 'MWH',       descricao: 'Megawatt-hora',                    categoria: 'energia' },
  // ── Gemas ───────────────────────────────────────────────────────────
  { sigla: 'QUILAT',    descricao: 'Quilate',                          categoria: 'gemas' },
  // ── Agrupamento ─────────────────────────────────────────────────────
  { sigla: 'JOGO',      descricao: 'Jogo',                             categoria: 'agrupamento' },
  { sigla: 'CJ',        descricao: 'Conjunto',                         categoria: 'agrupamento' },
  { sigla: 'KIT',       descricao: 'Kit',                              categoria: 'agrupamento' },
  // ── Embalagem ───────────────────────────────────────────────────────
  { sigla: 'AMPOLA',    descricao: 'Ampola',                           categoria: 'embalagem' },
  { sigla: 'BALDE',     descricao: 'Balde',                            categoria: 'embalagem' },
  { sigla: 'BANDEJ',    descricao: 'Bandeja',                          categoria: 'embalagem' },
  { sigla: 'BARRA',     descricao: 'Barra',                            categoria: 'embalagem' },
  { sigla: 'BISNAG',    descricao: 'Bisnaga',                          categoria: 'embalagem' },
  { sigla: 'BLOCO',     descricao: 'Bloco',                            categoria: 'embalagem' },
  { sigla: 'BOBINA',    descricao: 'Bobina',                           categoria: 'embalagem' },
  { sigla: 'BOMB',      descricao: 'Bombona',                          categoria: 'embalagem' },
  { sigla: 'CAPS',      descricao: 'Cápsula',                          categoria: 'embalagem' },
  { sigla: 'CART',      descricao: 'Cartela',                          categoria: 'embalagem' },
  { sigla: 'DISP',      descricao: 'Display',                          categoria: 'embalagem' },
  { sigla: 'EMBAL',     descricao: 'Embalagem',                        categoria: 'embalagem' },
  { sigla: 'FARDO',     descricao: 'Fardo',                            categoria: 'embalagem' },
  { sigla: 'FOLHA',     descricao: 'Folha',                            categoria: 'embalagem' },
  { sigla: 'FRASCO',    descricao: 'Frasco',                           categoria: 'embalagem' },
  { sigla: 'GALAO',     descricao: 'Galão',                            categoria: 'embalagem' },
  { sigla: 'GF',        descricao: 'Garrafa',                          categoria: 'embalagem' },
  { sigla: 'LATA',      descricao: 'Lata',                             categoria: 'embalagem' },
  { sigla: 'PACOTE',    descricao: 'Pacote',                           categoria: 'embalagem' },
  { sigla: 'PALETE',    descricao: 'Palete',                           categoria: 'embalagem' },
  { sigla: 'POTE',      descricao: 'Pote',                             categoria: 'embalagem' },
  { sigla: 'RESMA',     descricao: 'Resma',                            categoria: 'embalagem' },
  { sigla: 'ROLO',      descricao: 'Rolo',                             categoria: 'embalagem' },
  { sigla: 'SACO',      descricao: 'Saco',                             categoria: 'embalagem' },
  { sigla: 'SACOLA',    descricao: 'Sacola',                           categoria: 'embalagem' },
  { sigla: 'TAMBOR',    descricao: 'Tambor',                           categoria: 'embalagem' },
  { sigla: 'TANQUE',    descricao: 'Tanque',                           categoria: 'embalagem' },
  { sigla: 'TUBO',      descricao: 'Tubo',                             categoria: 'embalagem' },
  { sigla: 'VASIL',     descricao: 'Vasilhame',                        categoria: 'embalagem' },
  { sigla: 'VIDRO',     descricao: 'Vidro',                            categoria: 'embalagem' },
  // ── Caixa ───────────────────────────────────────────────────────────
  { sigla: 'CX',        descricao: 'Caixa',                            categoria: 'caixa' },
  { sigla: 'CX2',       descricao: 'Caixa com 2 unidades',             categoria: 'caixa' },
  { sigla: 'CX3',       descricao: 'Caixa com 3 unidades',             categoria: 'caixa' },
  { sigla: 'CX5',       descricao: 'Caixa com 5 unidades',             categoria: 'caixa' },
  { sigla: 'CX10',      descricao: 'Caixa com 10 unidades',            categoria: 'caixa' },
  { sigla: 'CX15',      descricao: 'Caixa com 15 unidades',            categoria: 'caixa' },
  { sigla: 'CX20',      descricao: 'Caixa com 20 unidades',            categoria: 'caixa' },
  { sigla: 'CX25',      descricao: 'Caixa com 25 unidades',            categoria: 'caixa' },
  { sigla: 'CX50',      descricao: 'Caixa com 50 unidades',            categoria: 'caixa' },
  { sigla: 'CX100',     descricao: 'Caixa com 100 unidades',           categoria: 'caixa' },
]
