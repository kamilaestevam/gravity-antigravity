/**
 * gabi/server/init.ts
 * Inicializacao do servico GABI quando rodando dentro do super-server.
 *
 * Padrao espelhado de historico-global/server/init.ts: o super-server
 * chama esta funcao no bootstrap antes de app.listen para subir workers
 * que dependem de fila / cron / setInterval.
 *
 * NOTE: o `gabi/server/index.ts` tem seu proprio app.listen para o modo
 * standalone (porta dedicada). Workers que precisam rodar em AMBOS os
 * modos devem ser disparados aqui — este init.ts e' chamado pelo
 * super-server, e por gabi/server/index.ts via importacao explicita.
 */

import { iniciarLimiteWorker } from './queue/limite-worker.js'

let inicializado = false

export async function initGabi(): Promise<void> {
  if (inicializado) return
  inicializado = true

  // F2-G: worker horario de avaliacao de limites monetarios + e-mail
  iniciarLimiteWorker()

  console.log('[gabi] init concluido (limite-worker em background)')
}
