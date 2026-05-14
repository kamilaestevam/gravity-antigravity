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
