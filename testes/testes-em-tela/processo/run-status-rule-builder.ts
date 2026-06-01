/**
 * Teste em tela (Playwright) — Status do Processo + GABI rule validator
 *
 * STATUS: pendente — requer sessao Clerk configurada.
 *
 * Os MESMOS 5 cenarios estao implementados como testes de componente
 * em servicos-global/produto/processo/client/src/__tests__/
 *   - StatusProcesso.test.tsx (10 testes em tela com Testing Library + jsdom)
 *   - status-validacao.test.ts (33 testes unitarios)
 *
 * Para rodar esta versao Playwright (browser real):
 *   1. Configurar @clerk/testing seguindo o exemplo:
 *      testes/testes-em-tela/pedido/run-import-limite-linhas.ts
 *   2. Executar:
 *      npx tsx testes/testes-em-tela/processo/run-status-rule-builder.ts
 *
 * Os 5 testes (mesmos do StatusProcesso.test.tsx):
 *   1. Pagina carrega com os 5 status mockados (Rascunho/Aberto/Em
 *      Embarque/Em Desembaraco/Concluido)
 *   2. Expandir Rascunho → GABI verde REGRAS VÁLIDAS
 *   3. Trocar condicao p/ incompativel ("maior_que" em texto) → GABI
 *      vermelho REGRA INVÁLIDA
 *   4. Condicao igual com valor vazio → GABI vermelho valor de comparacao
 *   5. AND com vazio+preenchido no mesmo campo → GABI vermelho conflito;
 *      OR resolve
 */

console.log('Este teste requer sessao Clerk configurada.')
console.log('Veja testes/testes-em-tela/pedido/run-import-limite-linhas.ts')
console.log('Versao funcional sem auth: rode `npm run test` no processo/')
process.exit(0)
