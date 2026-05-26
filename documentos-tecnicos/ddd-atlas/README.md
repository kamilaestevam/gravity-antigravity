# Atlas DDD - Fonte da verdade dos nomes finais do monorepo

> Gerado automaticamente a partir da planilha mestre `planilha_geral_gravity.xlsx`.
> NAO edite manualmente. Re-execute o script apos mudanca na planilha mestre.

Este atlas e a **fonte unica de verdade** dos nomes DDD-finais de tudo que e nomeavel no monorepo: campos, models, enums, rotas, paginas, modais e componentes.

Ele nao substitui a skill [`ddd-nomenclatura`](../../skills/governanca/lei/ddd-nomenclatura/SKILL.md) - que define **as regras** de como nomear. O atlas registra **os nomes ja decididos** segundo essas regras.

---

## Indice

| # | Arquivo | O que mapeia | Linhas acionaveis | Linhas exempt |
|---|---|---|---:|---:|
| 1 | [`01-campos.md`](./01-campos.md) | Campos (db/back/front + label de tela) | 1528 | 22 |
| 2 | [`02-rotas-api.md`](./02-rotas-api.md) | Rotas API (backend Express) | 395 | 20 |
| 3 | [`03-models.md`](./03-models.md) | Models Prisma | 188 | 0 |
| 4 | [`04-enums.md`](./04-enums.md) | Enums (nome + valores) | 381 | 0 |
| 5 | [`05-rotas-fe.md`](./05-rotas-fe.md) | Rotas (consumo frontend / inter-servico) | 529 | 145 |
| 6 | [`06-paginas.md`](./06-paginas.md) | Paginas | 127 | 15 |
| 7 | [`07-modais.md`](./07-modais.md) | Modais | 46 | 1 |
| 8 | [`08-nucleo-global.md`](./08-nucleo-global.md) | Componentes de `nucleo-global/` | 106 | 37 |
| 9 | [`09-componentes-locais.md`](./09-componentes-locais.md) | Componentes locais por produto | 22 | 1 |

**Total acionavel:** 3322 linhas. **Total exempt** (no apendice de cada arquivo): 241.

### Suplementos manuais (fora da planilha)

| Arquivo | Motivo |
|---------|--------|
| [`apendice-rotas-auth-signup.md`](./apendice-rotas-auth-signup.md) | Rotas FE `/trial`, porteiro `/me`, guards pós-PR #79 — até entrar na planilha |

---

## Como usar

### Antes de criar uma entidade nova

1. Abra o arquivo correspondente do atlas (ex: `03-models.md` para um model novo).
2. Confirme que o nome **nao existe ainda** (procure pelo nome candidato).
3. Confirme que o **alias historico** tambem nao colide (evita reciclagem inadvertida).
4. Confira a coluna `Local` / `Produto` para garantir o escopo correto.

### Antes de renomear uma entidade existente

1. Localize a linha atual no atlas pela coluna `Alias historico`.
2. Verifique o nome DDD ja registrado.
3. Se houver divergencia entre codigo e atlas, **o atlas vence** - alinhe o codigo.
4. Atualize a planilha mestre primeiro, depois rode o script para regenerar o atlas, depois faca o rename no codigo no mesmo PR (Mandamento 07).

### Antes de aprovar uma PR de rename

1. Confira que o nome novo aparece no atlas.
2. Confira que o nome antigo aparece como `Alias historico` (rastro para `git log --follow` e `grep`).
3. Confira que o tipo de artefato bate (campo vs model vs rota vs pagina vs componente).

---

## Como atualizar

O atlas e regenerado automaticamente. Nunca edite os `.md` a mao.

```bash
# 1. Atualize a planilha mestre (planilha_geral_gravity.xlsx)
# 2. Coloque a planilha em local conhecido, ex: .claude/planilha-tmp.xlsx
# 3. Rode o script gerador
python scripts/sob-demanda/gerar-atlas-ddd.py .claude/planilha-tmp.xlsx

# 4. Comite o resultado
git add documentos-tecnicos/ddd-atlas/
git commit -m "chore(atlas-ddd): regenera atlas a partir da planilha vNN"
```

O script:
- E idempotente (rodar de novo sobre a mesma planilha gera o mesmo resultado, modulo a data).
- Sobrescreve os 9 `.md` + nao toca em nenhum outro arquivo.
- Filtra linhas marcadas `—` na planilha para o apendice (nao acionaveis).
- Ordena por `Local`/`Produto` e depois por `Nome DDD`.

Se a versao da planilha mudou, edite a constante `PLANILHA_VERSAO` no inicio do script antes de rodar.

---

## Convencoes de nomenclatura (referencia rapida)

> A **lei completa** vive em [`skills/governanca/lei/ddd-nomenclatura/SKILL.md`](../../skills/governanca/lei/ddd-nomenclatura/SKILL.md). Abaixo, so o resumo operacional.

### Campos / colunas
- `id_<entidade>` para chaves primarias e estrangeiras (`id_organizacao`, `id_pedido`).
- `nome_<entidade>` para nomes (`nome_workspace`, `nome_organizacao`).
- `data_<evento>_<entidade>` para timestamps semanticos (`data_criacao_pedido`).
- `tipo_<entidade>` para enums (`tipo_usuario`).
- `pode_<acao>_<entidade>` ou adjetivo para booleans - **nunca** `is_*` (`gravity_admin`, `pode_editar`).

### Models Prisma
- PascalCase: `Organizacao`, `PedidoItem`, `AssinaturaProdutoGravity`.
- **Sempre** com `@@map("snake_case_plural")` para o nome da tabela PG.

### Enums
- Nome: `<Entidade><Atributo>` PascalCase (`UsuarioTipo`, `PedidoStatus`).
- Valores: UPPER_SNAKE_CASE em ingles (`ACTIVE`, `PENDING`) - constante tecnica do banco.
- **NAO** traduzir valores (Mandamento 03 / REGRA 7 da skill).

### Rotas
- `/api/v1/<recurso-no-plural>` em kebab-case PT-BR (`/api/v1/usuarios`, `/api/v1/pedidos/:id_pedido`).
- Sub-recursos sob path: `/api/v1/usuarios/:id_usuario/permissoes`.

### Componentes React
- PascalCase. Prefixo opcional por tipo: `Tabela*`, `Modal*`, `Card*`, `Sidebar*`.
- Arquivo `.tsx` com nome igual ao componente.

### Paginas
- URL em kebab-case PT-BR (`/pedidos`, `/historico-alteracoes`).
- Arquivo: PascalCase `PaginaXxx.tsx` ou nome semantico do agregado.
- Titulo exibido: nome da view atual (Lista, Dashboard, Kanban) - nao o nome do produto.

### Sufixos especiais
- `*Gravity`: artefatos da empresa Gravity vs do tenant (ex: `AssinaturaProdutoGravity`, `FaturaStatusGravity`).
- `*Workspace`: artefatos por filial (ex: `tipo_usuario_workspace`).

---

## Links

- [Skill `ddd-nomenclatura`](../../skills/governanca/lei/ddd-nomenclatura/SKILL.md) - lei unica de nomenclatura
- [Skill `9-mandamentos`](../../skills/governanca/lei/9-mandamentos/SKILL.md) - REGRA 03 (DDD), 07 (sincronia front/back), 09 (Zod bilateral)
- [Skill `code-standards`](../../skills/governanca/convencao-tecnica/code-standards/SKILL.md) - padroes de codigo
- [Script gerador](../../scripts/sob-demanda/gerar-atlas-ddd.py) - regenera o atlas
