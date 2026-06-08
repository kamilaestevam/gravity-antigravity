# Chamado ao Coordenador — Sombreamento de `.js` compilado e duplicata legada em `nucleo-global`

- **Data:** 2026-06-08
- **Origem:** investigação do bug de tooltip "Moeda do Pedido/Item" (PR [#224](https://github.com/dmmltda/gravity-antigravity/pull/224), já mergeado e deployado) + ressalva de QA "5 — Arquitetura e Escopo" levantada por outro agente sobre `GTPreferencias` duplicado.
- **Natureza:** núcleo (`nucleo-global`) + cross-cutting + fora da Onda 2 → requer aprovação do Coordenador (REGRA 02 / governança / ressalva do QA).
- **Status:** apenas diagnóstico e plano. **Nada foi executado** além do fix pontual já mergeado.

---

## 1. Resumo executivo

Existe um mecanismo sistêmico no `nucleo-global` que faz edições em código-fonte **`.tsx` não terem efeito em runtime**, mesmo após reiniciar o dev server. É a causa real do sintoma recorrente "edito, edito e nada muda na tela" (relatado como ~30 tentativas sem efeito no caso da tooltip).

São **dois problemas independentes que se reforçam**:

1. **Artefatos compilados `.js` sombreando os `.tsx`** dentro de `src/` — **88 ocorrências** no `nucleo-global`.
2. **Duplicata legada** do pacote `@nucleo/tabela-virtual-global` em `Tabelas/tabelas-componentes/` — peso morto que volta a morder em edições (ex.: `GTPreferencias` editado em 2 cópias).

---

## 2. Diagnóstico técnico

### 2.1. Sombreamento `.js` → fonte do "edits don't apply"

- O `index.ts` dos pacotes do núcleo reexporta com **extensão `.js` explícita**, ex.:
  `export { TabelaVirtualGlobal } from './TabelaVirtualGlobal.js'`
- Quando existe um `TabelaVirtualGlobal.js` **compilado** ao lado do `.tsx`, o Vite resolve o **`.js`** (build antigo) e **ignora o `.tsx`**.
- No caso investigado: `TabelaVirtualGlobal.js` datado de **05/jun** sombreava o `.tsx` editado em **08/jun**. Comprovado com instrumentação: o código do `.tsx` **nunca executava** em runtime.
- **Escopo:** `find nucleo-global -name '*.tsx'` com `.js` irmão → **88 arquivos** sombreados. Cada um é um landmine idêntico.

### 2.2. Duplicata legada `tabelas-componentes/tabela-virtual-global`

- Cópia completa do pacote (`TabelaVirtualGlobal.tsx`, `tipos.ts` com `GTPreferencias`, etc.).
- **Nenhum código de produção a importa** — a única referência ao caminho `tabelas-componentes/tabela-virtual-global` é o **`demo/vite.config.ts` da própria cópia legada** (replicado nos worktrees). Os apps reais já resolvem pelo canônico via alias (`vite.config.ts` do Configurador força *"nunca tabelas-componentes/"*).
- Risco prático: edições "no lugar certo" caem na cópia errada (o que aconteceu com `GTPreferencias`, editado em ambas).

---

## 3. Impacto / risco atual

- **Produtividade:** qualquer dev pode perder horas editando `.tsx` sem efeito (já aconteceu). 88 pontos vulneráveis.
- **Correção silenciosamente perdida:** um fix correto pode "sumir" no deploy se o `.js` sombreador for empacotado.
- **Divergência de fonte da verdade:** 2 cópias do mesmo pacote → contratos/tipos podem divergir sem ninguém perceber.

---

## 4. Plano de remediação proposto (para aprovação)

### Fase A — Parar o sombreamento (alto valor, baixo risco)
1. Build do núcleo passa a emitir em **`dist/`** (não em `src/`).
2. `index.ts` reexporta **sem extensão `.js`** (ou de `dist/`), para o dev resolver o `.tsx`/`.ts` fonte.
3. `.gitignore` cobrindo `**/src/**/*.js`, `*.d.ts`, `*.js.map` gerados.
4. Remover os **88** `.js`/`.d.ts`/`.map` órfãos já presentes em `src/`.

### Fase B — Remover a duplicata legada (hygiene)
5. Excluir `nucleo-global/Tabelas/tabelas-componentes/tabela-virtual-global` (morto em produção).
6. Consolidar `GTPreferencias` (e demais tipos) **somente** no canônico — fechar a ressalva do QA.

### Fase C — Validação
7. Smoke test das listas (Pedido, e demais consumidores da GTV) em dev e build de produção.
8. Conferir que uma edição trivial num `.tsx` do núcleo reflete na tela após reload (teste de regressão do próprio mecanismo).

---

## 5. O que precisa de decisão do Coordenador

- [ ] Aprovar Fase A (mudança de pipeline de build do núcleo — afeta todos os pacotes).
- [ ] Aprovar Fase B (remoção de pacote do núcleo + consolidação de `GTPreferencias`).
- [ ] Definir janela (fora de horário de entrega) e responsável pela execução + QA.

---

## 6. Referências

- PR do fix pontual (já em produção): [dmmltda/gravity-antigravity#224](https://github.com/dmmltda/gravity-antigravity/pull/224)
- Ressalva do QA: "5 — Arquitetura e Escopo ⚠ RESSALVA" (`GTPreferencias` em `tipos.ts`, duplicata persistente).
- Governança: CLAUDE.md REGRA 02 (schema/núcleo intocável sem Coordenador) e princípio SSOT.
