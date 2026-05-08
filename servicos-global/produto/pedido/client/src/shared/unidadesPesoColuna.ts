/**
 * unidadesPesoColuna.ts — Subset de unidades aceitas em colunas de PESO
 * (peso_liquido, peso_bruto) na tabela do Pedido.
 *
 * Por que NÃO vem do banco via useUnidades(): essas siglas são uma
 * **restrição UX por coluna** — colunas de peso só podem aceitar unidades
 * de massa. O banco `cadastros.unidade` tem TODAS as categorias (peso,
 * volume, embalagem, etc.); aqui filtramos as 3 que fazem sentido pra
 * peso de mercadoria. Usar o hook `useUnidades()` aqui exigiria componente
 * React (hook só roda em render); a coluna é definida em escopo
 * de módulo, então uma const local é o caminho correto.
 *
 * Espelho do banco: KG, G, TON estão na master canônica
 * (`cadastros/prisma/data/unidades-canonicas.ts` com categoria='peso').
 * Se a categoria no banco mudar, atualizar aqui também.
 */

export const UNIDADES_PESO_OPCOES_PEDIDO: Array<{ sigla: string; rotulo: string }> = [
  { sigla: 'KG',  rotulo: 'KG — Quilograma' },
  { sigla: 'G',   rotulo: 'G — Grama' },
  { sigla: 'TON', rotulo: 'TON — Tonelada' },
]
