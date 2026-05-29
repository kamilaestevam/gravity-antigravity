// shared/migracaoColunas.ts
//
// Helpers de migração de preferências de coluna do Pedido.
//
// Quando uma entrega adiciona uma coluna nova OU reposiciona uma coluna existente
// na sequência padrão, usuários com preferências SALVAS no backend precisam ter
// suas listas ajustadas. Estes helpers padronizam essa lógica para reuso em
// migrações futuras (refactor D12 — 2026-05-13).
//
// Antes da extração: lógica inline em Pedidos.tsx (~40 linhas duplicadas e
// difíceis de testar). Depois: 2 funções puras + cobertura unitária.

/**
 * Insere uma coluna nova nas preferências do usuário, em uma posição lógica
 * (após uma âncora). Idempotente — se a coluna já existe, retorna no-op.
 *
 * Útil quando uma entrega adiciona uma coluna built-in nova e usuários com
 * `colunas_visiveis` salvas precisam recebê-la sem perder customizações.
 *
 * Estratégia de posicionamento:
 *   1. Tenta inserir após cada âncora em ordem de prioridade (ex: ['tipo_operacao',
 *      'numero_pedido'] → tenta tipo_operacao primeiro).
 *   2. Se nenhuma âncora existir nas prefs do usuário, insere no INÍCIO.
 *
 * @param visiveis      Array atual de chaves visíveis (vem das prefs do usuário)
 * @param keyInserir    Chave da coluna a inserir
 * @param ancorasApos   Chaves de coluna após as quais inserir, em ordem de prioridade
 *
 * @returns `{ resultado, mudou }`. `mudou=true` indica que o array foi alterado
 *          e a preferência precisa ser persistida no backend.
 */
export function inserirColunaAposAncora(
  visiveis: string[],
  keyInserir: string,
  ancorasApos: string[],
): { resultado: string[]; mudou: boolean } {
  // Idempotência: se já existe, nada a fazer
  if (visiveis.includes(keyInserir)) {
    return { resultado: visiveis, mudou: false }
  }

  const novo = [...visiveis]

  // Tenta cada âncora em ordem
  for (const ancora of ancorasApos) {
    const idx = novo.indexOf(ancora)
    if (idx >= 0) {
      novo.splice(idx + 1, 0, keyInserir)
      return { resultado: novo, mudou: true }
    }
  }

  // Fallback: nenhuma âncora encontrada → insere no início
  return { resultado: [keyInserir, ...novo], mudou: true }
}

/**
 * Move uma coluna existente para depois de uma âncora, preservando todas as
 * outras colunas. Idempotente — se a coluna já está depois da âncora, no-op.
 *
 * Útil quando uma entrega muda a POSIÇÃO padrão de uma coluna built-in e
 * usuários que abriram a tela entre versões têm a coluna salva em posição
 * antiga.
 *
 * Casos de borda tratados:
 *   - Coluna não existe nas prefs → no-op
 *   - Âncora não existe nas prefs → no-op
 *   - Coluna já está DEPOIS da âncora → no-op (não move)
 *   - Coluna está ANTES da âncora → move
 *
 * @param visiveis  Array atual de chaves visíveis
 * @param keyMover  Chave da coluna a mover
 * @param keyApos   Chave da âncora (a coluna ficará logo após esta)
 *
 * @returns `{ resultado, mudou }`. `mudou=true` indica que a posição foi
 *          alterada e a preferência precisa ser persistida no backend.
 */
export function moverColunaParaAposAncora(
  visiveis: string[],
  keyMover: string,
  keyApos: string,
): { resultado: string[]; mudou: boolean } {
  const idxMover = visiveis.indexOf(keyMover)
  const idxApos = visiveis.indexOf(keyApos)

  // Qualquer um ausente → no-op
  if (idxMover < 0 || idxApos < 0) {
    return { resultado: visiveis, mudou: false }
  }

  // Coluna já está depois da âncora → no-op
  if (idxMover > idxApos) {
    return { resultado: visiveis, mudou: false }
  }

  // Move: remove + insere logo após a âncora (recalculando índice após o splice)
  const novo = [...visiveis]
  novo.splice(idxMover, 1)
  const novoIdxApos = novo.indexOf(keyApos)
  novo.splice(novoIdxApos + 1, 0, keyMover)
  return { resultado: novo, mudou: true }
}

/**
 * Insere colunas faltantes de um bloco (ex.: logística) após âncora ou após
 * a última coluna do bloco já presente nas prefs. Idempotente por coluna.
 */
export function inserirBlocoColunasFaltantes(
  visiveis: string[],
  blocoReferencia: readonly string[],
  ancoraInicial: string,
): { resultado: string[]; mudou: boolean } {
  let atual = visiveis
  let mudou = false

  for (const key of blocoReferencia) {
    const ancoras = [
      ...blocoReferencia.filter(k => k !== key && atual.includes(k)).slice(-1),
      ancoraInicial,
    ]
    const passo = inserirColunaAposAncora(atual, key, ancoras)
    if (passo.mudou) mudou = true
    atual = passo.resultado
  }

  return { resultado: atual, mudou }
}

/**
 * Reordena colunas de um bloco conforme ordem do schema, preservando posição
 * do bloco na lista e demais colunas do usuário.
 */
export function reordenarBlocoColunas(
  visiveis: string[],
  blocoReferencia: readonly string[],
): { resultado: string[]; mudou: boolean } {
  const setBloco = new Set<string>(blocoReferencia)
  const presentes = blocoReferencia.filter(k => visiveis.includes(k))
  if (presentes.length <= 1) {
    return { resultado: visiveis, mudou: false }
  }

  const semBloco = visiveis.filter(k => !setBloco.has(k))
  const primeiroIdxBloco = Math.min(...presentes.map(k => visiveis.indexOf(k)))
  let insertAt = 0
  for (let i = 0; i < primeiroIdxBloco; i++) {
    if (!setBloco.has(visiveis[i])) insertAt++
  }

  const resultado = [
    ...semBloco.slice(0, insertAt),
    ...presentes,
    ...semBloco.slice(insertAt),
  ]

  const mudou = resultado.length !== visiveis.length
    || resultado.some((k, i) => k !== visiveis[i])

  return { resultado, mudou }
}
