# Admin › Testes — Frontend (LogTestes + modais)

> **SSOT do modal «Detalhe do plano de teste»** (`ModalDetalhePlanoTeste.tsx`).  
> Código: `servicos-global/configurador/src/pages/admin/ModalDetalhePlanoTeste.tsx`  
> Parser: `servicos-global/configurador/server/lib/extrair-casos-plano.ts`  
> API: `GET /api/v1/admin/planos-teste/:id_plano_teste/casos?ambiente=Local|Staging|Producao`

---

## Quando abre

Aba **Plano de Teste** em `LogTestes.tsx` → clique na linha do registry → modal de detalhe.

Dados vêm de:
- **Registry** (`test-plans-registry.json`): `id`, `tipo`, `modulo`, `sublocal`, `specFile`, `casosTotal`, …
- **Arquivo do plano** (`planoFile` no registry): conteúdo `.md` ou `.json` parseado pelo backend
- **Ambiente** selecionado no modal «Rodar Testes»: adapta URLs localhost ↔ staging/produção

---

## Layout do modal (ordem fixa)

De cima para baixo — **nunca inverter**:

| # | Bloco | Fonte | O que mostra |
|---|--------|-------|--------------|
| 1 | **Cabeçalho** | registry | Badge `UNI`/`FUN`/…, `id`, título (`tela` ou `modulo`), `sublocal`, `N casos no registry` |
| 2 | **Ambiente de execução** | query `?ambiente=` | UI/API URL, nota Playwright ou produção |
| 3 | **Objetivo** | `planoFile` (.md) | Por que o teste existe — parágrafo legível (card verde) |
| 4 | **O que será testado** | `planoFile` parseado | Lista de casos/passos com **Ação** e **APROVADO quando**; ETAPAs colapsáveis (EMT) |
| 5 | **Script de execução** | registry `specFile` | Caminho do runner + texto explicando o que o arquivo indica |

### O que cada bloco significa

- **Objetivo** — intenção de negócio do pacote (não substitui casos individuais).
- **O que será testado** — contrato humano caso a caso; cada linha deve ser verificável; ao clicar «Visualizar», modal filho mostra **Ação** / **APROVADO quando** (ou **Detalhe** se legado).
- **Script** — arquivo que o CI/runner executa (`*.test.ts`, `*.spec.ts`, `run-*.ts`); cada caso listado acima está implementado dentro dele; falha no runner aponta pelo código do caso (ex.: `U01`, `F03`, passo `**02**`).

**Proibido** entregar plano cujo modal mostre só o Script e «0 items» — isso indica `planoFile` vazio para o parser ou arquivo ausente no deploy.

---

## Formato do `.md` do plano (todos os tipos)

### Objetivo (bloco 3 do modal)

Preferencial — uma linha após o escopo:

```markdown
**Objetivo geral:** garantir que … (uma frase completa).
```

Fallbacks lidos por `extrairObjetivoDoPlano()`:
1. `**Objetivo geral:** …`
2. Primeiro parágrafo de `## Escopo`
3. Primeiro parágrafo de `## Resumo Executivo` ou `## Objetivo`
4. Linha `> **Escopo:** …` (EMT legado)

### Casos (bloco 4 do modal)

**Formato canônico (UNI, FUN, CRO, E2E e EMT):**

```markdown
> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

## Roteiro de execução

### ETAPA 1 — Contrato Zod

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | Validar favorito completo contra o schema | `safeParse(...).success === true` |
| **U02** | Validar favorito sem tipos | `success === false` — `min(1)` |
```

Regras:
- Coluna **Passo**: código do caso (`U01`, `F03`, `**02**`, `U-ZOD-01`)
- Coluna **Ação**: o que o teste faz
- Coluna **APROVADO quando**: critério de aceitação / resultado esperado
- Cada `### ETAPA N — …` vira grupo colapsável no modal (EMT)

**EMT adicional:** seção `## Prints planejados` (tabela `# | Arquivo | Estado`) somada ao total de items; ver `.cursor/commands/testes-criar.md` §Formato EMT.

**Legado ainda suportado** (parser genérico, preferir migrar para ETAPA+tabela):
- Check-list `- [x] **U01** — descrição` (seta `→` separa Ação / APROVADO quando)
- Tabelas `| ID | Caso | Resultado Esperado |` sob headings `##`/`###` que mencionem caso, check, cenário, validação ou fluxo

### Exemplos ouro

| Escopo | Plano |
|--------|-------|
| Admin favoritos (5 tipos) | `testes/testes-unitarios/admin/testes/aba-plano-de-teste/plano-de-teste/preferencia-teste-usuario-admin-unitario.md` (+ FUN/E2E/CRO paralelos) |
| EMT completo | `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md` |
| UNI legado grande | `testes/testes-unitarios/pedido/lista/duplicar/plano-de-teste/TST-UNI-DUPLICAR-LISTA-PEDIDO-000026-unitario.md` (parser legado; migrar quando tocar) |

---

## API `GET …/casos`

Resposta (campos usados pelo modal):

```json
{
  "plano": { "id": "TST-UNI-…", "specFile": "testes-unitarios/…/TST-….test.ts", … },
  "objetivo": "garantir que …",
  "casos": [
    {
      "ordem": "U01",
      "titulo": "ETAPA 1 — Contrato Zod",
      "detalhe": "Validar … — safeParse …",
      "acao": "Validar …",
      "aprovadoQuando": "safeParse …",
      "secao": "Roteiro"
    }
  ],
  "total": 11,
  "planoFile": "testes-unitarios/…/plano.md",
  "ambienteExecucao": { "ambiente": "Local", "uiUrl": "http://localhost:8000", … }
}
```

`planoFile` no JSON é relativo a `testes/` (sem prefixo `testes/` duplicado). Resolução: `resolverArquivoPlanoTeste()` em `raiz-repositorio-gravity.ts`.

---

## Checklist antes de entregar plano novo

- [ ] `**Objetivo geral:**` presente (ou fallback documentado)
- [ ] `## Roteiro` + `### ETAPA` + tabela Passo/Ação/APROVADO quando
- [ ] Contagem de casos no `.md` coerente com `casosTotal` no registry
- [ ] `planoFile` e `specFile` existem no disco **antes** do registry
- [ ] Abrir modal no Admin local: Objetivo + N items + Script (não «0 items»)
- [ ] EMT: `## Prints planejados` + pares `-selecao`/`-resultado` — [regras/08-regras-prints-em-tela.md](../regras/08-regras-prints-em-tela.md)

---

## EMT — Prints no Log de Testes (verde / vermelho)

Após execução EMT, a expansão da linha no **LogTestes** exibe thumbnails dos PNG de `resultado-teste/<runId>/`.

| Cor da borda | Significado | Origem |
|--------------|-------------|--------|
| **Verde** (`#10b981`) | Print aprovado | Linha `✓` no log **depois** do(s) `📸` correspondente(s) |
| **Vermelho** (`#ef4444`) | Print reprovado | Linha `✗` no log, ou arquivo `99-erro*.png` |
| Cinza | Neutro | Print sem `✓`/`✗` associado ainda |

Implementação: `mapearResultadoPrintsEmt` + `estiloBordaPrintEmt` em `LogTestes.tsx`.  
Regra de log do runner: [regras/08-regras-prints-em-tela.md](../regras/08-regras-prints-em-tela.md).

---

## Referências

- Arquitetura geral: [01-arquitetura-sistema-testes.md](01-arquitetura-sistema-testes.md)
- Criação de planos (comando): `.cursor/commands/testes-criar.md` (`/testes-criar`)
- Skill coordenação: `skills/testes/SKILL.md` §Modal Admin
