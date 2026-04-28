# DDD — Nomenclatura (operacionalização do Mandamento 03)

> **Esta skill é a lei única de nomenclatura do projeto Gravity.**
> Todo agente, em toda criação ou refactor, deve consultar este documento.
> Em caso de conflito com qualquer outro documento, esta skill prevalece.

---

## Princípio fundamental

**Toda nomeação no código é em PT-BR sem acentos. Inglês só quando forçado.**

A regra vale para o **CÓDIGO** — schema, campos, classes, funções, variáveis, rotas, env vars, i18n keys, nomes de arquivo. Nunca se traduz código.

Para **TEXTO EXIBIDO NA UI**, o canonical é PT-BR. Traduções para EN/ES vivem nos arquivos i18n e não são DDD — são localização.

Inglês no código aparece **apenas** quando uma destas 4 condições se aplica:

- Keyword de linguagem (`select`, `where`, `id`, `function`, `interface`, `async`)
- Identificador de sistema externo (`clerk_user_id`, `stripe_customer_id`)
- Padrão técnico universal (`HTTP`, `JSON`, `JWT`, `URL`, `ISO8601`)
- Valor de enum (constante técnica do banco — ver REGRA 7)

Fora dessas 4 → **PT-BR sem perdão**.

---

## Onde se aplica (escopo)

A nomenclatura DDD vale para **todo artefato nomeável** do projeto:

| Artefato | Exemplo correto |
|---|---|
| **Tabelas/Models** | `Organizacao`, `PedidoItem`, `AssinaturaProdutoGravity` |
| **Campos/Colunas** | `id_organizacao`, `data_criacao_pedido`, `tipo_usuario` |
| **Relations Prisma** | `usuarios`, `workspaces`, `assinaturas` |
| **Enums (nome)** | `UsuarioTipo`, `OrganizacaoStatus`, `FaturaStatusGravity` |
| **Rotas/Endpoints** | `/organizacoes`, `/usuarios/:id_usuario/permissoes` |
| **Schemas Zod** | `OrganizacaoSchema`, `ConvidarUsuarioSchema` |
| **Funções/Métodos** | `criarOrganizacao()`, `validarPermissoes()` |
| **Componentes React** | `TabelaUsuarios`, `ModalEditarOrganizacao` |
| **Hooks** | `useOrganizacaoAtual`, `useCarregarPermissoes` |
| **Arquivos/Pastas** | `organizacao.ts`, `tabela-usuarios/`, `useOrganizacaoAtual.ts` |
| **Variáveis** | `usuarioAtual`, `organizacaoSelecionada` |
| **Env vars** | `CONFIGURADOR_DATABASE_URL` |
| **i18n keys** | `pedido.coluna_pai.numero_pedido` |
| **Labels canonical (UI)** | `"Nº do Pedido"`, `"Razão Social"`, `"CNPJ"` |
| **Mensagens de erro canonical** | `"Workspace não encontrado"` |

Se algo é nomeado, esta skill se aplica.

---

## Quando consultar

- **Antes** de aprovar qualquer nome novo (campo, tabela, rota, função, arquivo, label)
- **Antes** de criar artefato em código
- **Antes** de criar PR — autor verifica; reviewer verifica de novo
- **Antes** de gerar migration ou rodar script que cria nome
- **Sempre** que houver dúvida — em vez de inventar, consulte

---

## Glossário canônico

Em código, **só os nomes da coluna direita aparecem**. Os da esquerda não existem mais no projeto:

| ❌ Termo abandonado | ✅ DDD canônico |
|---|---|
| `Tenant`, `tenant_id`, `tenantId` | `Organizacao`, `id_organizacao` |
| `Company`, `company_id`, `companyId` | `Workspace`, `id_workspace` |
| `User`, `user_id`, `userId` | `Usuario`, `id_usuario` |
| `Role`, `role` (em DTO/JSON/UI) | `tipo_usuario` |
| `Subscription`, `subscriptions` | `Assinatura`, `assinaturas` |
| `UserMembership`, `membership` | `UsuarioWorkspace`, `vinculo_workspace` |
| `Admin`, `is_gravity_admin` (boolean) | `gravity_admin` |

---

## As 11 Regras

### REGRA 1 — Nomes de campos físicos (colunas)

1. **Campo novo** → nome PT-BR seguindo o glossário canônico.
2. **Nome genérico** (`status`, `tipo`, `nome`, `descricao`, `titulo`, `categoria`, `prioridade`, `codigo`) que aparece em **>1 model** → adiciona sufixo de entidade: `<nome>_<entidade>` (ex: `status_pedido`, `tipo_organizacao`).
3. **Caso contrário** → nome único e descritivo em PT-BR, sem sufixo.

---

### REGRA 2 — `@map` de coluna PROIBIDO; `@@map` de tabela OBRIGATÓRIO quando model name ≠ snake_case

**Atualizada em 24/04/2026 (fix_model_casing_revert).** A regra original "sem `@@map`" foi revertida: a paridade do **nome de coluna** (campo Prisma == coluna PG) continua absoluta, mas o **nome do model** segue a convenção Prisma (PascalCase) e precisa de `@@map("snake_case")` para a tabela PG ficar em snake_case.

**Estado correto (único permitido):**

1. **Campo Prisma === coluna PG** — sempre. Nenhum `@map()` de coluna, nunca.
2. **Model Prisma em PascalCase** + **`@@map("tabela_snake_case")`** — tabela PG fica em snake_case.

```prisma
// ✅ Correto — padrão DDD Gravity pós-fix_model_casing_revert
model Empresa {
  suid_empresa     String @id
  nome_empresa     String
  cnpj_empresa     String?

  @@map("empresa")
}

model OpeHistoricoStatus {
  id_historico_status_ope   String @id @default(cuid())
  suid_ope_historico_status_ope  String

  @@map("ope_historico_status")
}
```

```prisma
// 🚫 Proibido — @map de coluna (rompe paridade Prisma-PG)
model Empresa {
  suid_empresa  String @id @map("suid_novo")   // BLOQUEADO
}

// 🚫 Proibido — model sem @@map e sem PascalCase (Prisma Client fica "feio": prisma.empresa vs prisma.nCM)
model empresa {                                 // BLOQUEADO — use "Empresa" + @@map("empresa")
  suid_empresa  String @id
}

// 🚫 Proibido — PascalCase sem @@map (tabela PG viraria "Empresa" com aspas)
model Empresa {                                 // BLOQUEADO — falta @@map("empresa")
  suid_empresa  String @id
}
```

**Histórico da regra:** entre 22/04/2026 e 24/04/2026 o padrão tentado foi "model name lowercase igual ao PG, sem @@map". Isso gerou accessors Prisma Client esquisitos (`prisma.oPE`, `prisma.nCM`) e quebrou a convenção idiomática. A correção (migration `fix_model_casing_revert`) restaurou PascalCase + `@@map`. **Nunca mais proponha model em lowercase sem `@@map`.**

---

### REGRA 3 — Audit fields (padrão DDD uniforme)

| Conceito | DDD |
|---|---|
| Identificador primário | `id_<entidade>` (ex: `id_organizacao`, `id_usuario`) |
| Data de criação | `data_criacao_<entidade>` |
| Data de atualização | `data_atualizacao_<entidade>` |
| Data de exclusão (soft delete) | `data_exclusao_<entidade>` |
| FK pra organização | `id_organizacao` |
| FK pra workspace | `id_workspace` |
| FK pra usuário | `id_usuario` |

---

### REGRA 4 — Foreign Keys

- **FK pra entidade do glossário** → usa o mapeamento da REGRA 3.
- **FK pra outra entidade DDD** → `id_<nome_entidade_alvo>` (ex: `id_workspace_preferido`, `id_pedido_origem`).
- **IDs de sistemas externos** (`clerk_*`, `stripe_*`, `gemini_*`, `resend_*`) → mantém o nome original em inglês.

---

### REGRA 5 — Booleans em PT-BR (sem prefixo)

Booleans usam o **adjetivo direto em PT-BR**, sem prefixo. O tipo `Boolean` já diz que é booleano.

| Conceito | DDD |
|---|---|
| Ativo/inativo | `ativo` |
| Excluído (soft delete) | `excluido` |
| É admin Gravity | `gravity_admin` |
| É fornecedor | `fornecedor` |
| Tem acesso | `tem_acesso` |
| Pode editar | `pode_editar` |
| Aceita os termos | `aceita_termos` |

**Sem `is_`. Sem exceções.**

---

### REGRA 6 — Relations (1:N, N:1, M:N)

Plural em snake_case PT-BR, **sem sufixo de entidade**, com tradução literal preferida:

| Conceito | DDD |
|---|---|
| Lista de usuários | `usuarios` |
| Lista de assinaturas | `assinaturas` |
| Lista de workspaces | `workspaces` |
| Permissões do usuário | `permissoes_usuario` |
| Configurações de produto | `configuracoes_produto` |
| Vínculos com workspace | `vinculos_workspace` |

**Renomeação semântica permitida** quando a relação tem significado de domínio mais rico que a tradução literal (ex: relação que representa o ATO de ativar → `ativacoes_produto_workspace`).

**Critério para usar rename semântico:**
- A tradução literal seria genérica/sem informação útil.
- O conceito de domínio tem nome próprio (uma "ativação", uma "matrícula").
- Está documentado no PRD do produto ou skill da área.

Em dúvida → **traduz literal**.

---

### REGRA 7 — Enums

- **Nome do enum:** PascalCase em PT-BR (`UsuarioTipo`, `OrganizacaoStatus`, `FaturaStatusGravity`).
- **Valores do enum:** **mantém em inglês UPPER_SNAKE** (`ACTIVE`, `SUSPENDED`, `MASTER`, `STANDARD`).

**Por que valores em inglês:** são constantes técnicas armazenadas no banco, não labels de UI. Tradução para o usuário final vai no i18n.

```prisma
enum OrganizacaoStatus {
  ACTIVE        // i18n: "Ativa" (PT) / "Active" (EN) / "Activa" (ES)
  SUSPENDED     // i18n: "Suspensa" / "Suspended" / "Suspendida"
  CANCELLED     // i18n: "Cancelada" / "Cancelled" / "Cancelada"
}
```

---

### REGRA 8 — JSON / blobs técnicos

Campos `Json` (`configuracao`, `metadados`, `payload`, `campos_personalizados`) → **nome em PT-BR**.

- Não tentar traduzir estrutura interna (chaves dentro do JSON podem mudar sem migration).
- A `Descrição` do campo na planilha mestre documenta a estrutura interna quando ela for estável.
- Tela DDD = `—` (não aparecem como campo isolado em UI).

---

### REGRA 9 — Label canonical em tela: quando colocar `—`

A coluna **"Nome em tela - DDD"** representa o **label canonical em PT-BR** que o usuário PT-BR vê. Outras línguas vivem no i18n.

Marcar com `—` quando o campo **não aparece em tela do usuário final**:

- IDs (`id_*`, todos os FKs)
- Audit timestamps (`data_criacao_*`, `data_atualizacao_*`, `data_exclusao_*`)
- Tokens externos (`clerk_*`, `stripe_*`, `internal_*`)
- Relações (1:N, N:1, M:N)
- JSON técnico

**Caso aparece SOMENTE em painel admin/debug** → `— (admin debug)`.

**Caso aparece em tela de usuário** → label canonical em PT-BR, abreviações expandidas, capitalização correta.

| Errado | Certo (canonical PT-BR) |
|---|---|
| `Cnpj` | `CNPJ` |
| `Created At` | `Criado em` |
| `Organização Id` | `—` (interno) |
| `Valor total pedido` | `Valor Total do Pedido` |

**Abreviações aceitas no canonical:** `Nº`, `%`, `Qtd.`, `CNPJ`, `NCM`, `LPCO`, `DUIMP`, `BACEN`, `R$`, `US$`, `kg`, `m³`.

---

### REGRA 10 — Tabelas/Models (PascalCase Prisma, snake_case PG via `@@map`)

- **Model name** = PascalCase em PT-BR (`Organizacao`, `AssinaturaProdutoGravity`, `PedidoItem`, `Empresa`, `OpeHistoricoStatus`). Acrônimos podem ficar em caixa alta (`NCM`, `OPE`).
- **Tabela (DB)** = **snake_case em PT-BR**, declarado via `@@map("nome_tabela")` no final do model.
- **Todo model precisa de `@@map`** — não existe "o nome bate, então posso omitir": a convenção é explícita.
- Nome da tabela fica **no singular** em Cadastros/Configurador (`empresa`, `organizacao`) e alinhado ao dicionário DDD em produtos (`pedido`, `pedido_item`).

---

### REGRA 11 — Campos calculados / derivados

Campo `valor_total_pedido = quantidade × valor_unitario` (calculado em runtime, não persistido):

- **Nome DDD:** segue as regras 1-3 normalmente.
- **Coluna "Origem" na planilha:** marca como `Calculado`.
- **Coluna "Descrição":** explica a fórmula (`A × B`, `A − (B + C)`).
- **Tela DDD:** label canonical em PT-BR.
- **Banco DDD:** `—` se não persiste; nome normal se persiste como cache.

---

## Rotas e endpoints (REST)

> **Para regras de design — verbos, paginação, status, erro, headers, hierarquia DDD-aware — ver [`skills/governanca/convencao-tecnica/api-design/SKILL.md`](../../convencao-tecnica/api-design/SKILL.md). Em conflito de naming, esta skill (`ddd-nomenclatura`) prevalece.**

Sub-aplicação das regras pra URLs:

- **Path em PT-BR snake-case** (com hífen entre palavras): `/organizacoes`, `/workspaces/:id_workspace/usuarios`
- **Plural na coleção:** `/organizacoes`, não `/organizacao`
- **Singular no recurso específico:** `/organizacoes/:id_organizacao`
- **Verbo apenas em ação não-CRUD:** `/usuarios/:id_usuario/promover`, `/pedidos/:id_pedido/duplicar`
- **Query params:** PT-BR snake_case (`?ordenar_por=data_criacao&ordem=desc`)
- **Headers customizados:** kebab-case PT-BR com prefixo `x-` (`x-id-organizacao`, `x-chave-interna`)

---

## Quick reference — decisão em 5 segundos

```
Nome novo? → SEMPRE em PT-BR (princípio fundamental)
Campo físico? → REGRA 1 (com glossário canônico)
@map de coluna? → REGRA 2 (PROIBIDO — paridade Prisma-PG)
@@map de tabela? → REGRA 2 (OBRIGATÓRIO — PascalCase Prisma + snake_case PG)
Audit field (id, data_*)? → REGRA 3
FK? → REGRA 4
Boolean? → REGRA 5 (sem is_, só adjetivo PT-BR)
Relation? → REGRA 6 (plural snake_case PT-BR)
Enum? → REGRA 7 (nome PT-BR PascalCase, valores UPPER_SNAKE EN)
JSON? → REGRA 8 (PT-BR, mantém)
Label tela? → REGRA 9 (— ou canonical PT-BR)
Tabela/Model? → REGRA 10 (Model PascalCase + @@map("snake_case"))
Calculado? → REGRA 11
Rota/Endpoint? → seção "Rotas e endpoints"
Em dúvida? → consulta glossário canônico
```

---

## Anti-padrões proibidos

- ❌ Inventar nome novo sem consultar esta skill
- ❌ Usar termo legado (`organização`, `company`, `role`, `subscription`) em código
- ❌ Adicionar `@map("...")` em coluna (paridade Prisma-PG precisa ser total)
- ❌ Criar model Prisma em lowercase/snake_case (use PascalCase + `@@map`)
- ❌ Criar model PascalCase sem `@@map` (a tabela PG precisa ficar em snake_case)
- ❌ Traduzir valores de enum (`ACTIVE` → `ATIVO`)
- ❌ Adicionar `is_` em booleans (use só o adjetivo PT-BR)
- ❌ Sufixo de entidade em campo único (não-genérico)
- ❌ Renomear `schema.prisma` sem Coordenador (Mandamento 02)
- ❌ Renomear back sem renomear front no mesmo PR (Mandamento 07)
- ❌ Atualizar Zod schema sem atualizar consumers (Mandamento 09)
- ❌ Label de UI canonical com inglês (`Created At`) — sempre PT-BR
- ❌ Trocar nomes de IDs externos (`clerk_user_id`, `stripe_customer_id`)
- ❌ Misturar inglês e português sem motivo (`nome_user`, `data_creation`)

---

## Atlas DDD — Fonte da verdade

Para nomes finais de TODOS os models, enums, rotas, campos, páginas, modais
e componentes do monorepo, consulte:

[`documentos-tecnicos/ddd-atlas/`](../../../../documentos-tecnicos/ddd-atlas/README.md)

9 arquivos, um por aba da planilha mestre:

1. [`01-campos.md`](../../../../documentos-tecnicos/ddd-atlas/01-campos.md) — 1528 campos (db/back/front + label de tela)
2. [`02-rotas-api.md`](../../../../documentos-tecnicos/ddd-atlas/02-rotas-api.md) — 395 rotas backend
3. [`03-models.md`](../../../../documentos-tecnicos/ddd-atlas/03-models.md) — 188 Prisma models
4. [`04-enums.md`](../../../../documentos-tecnicos/ddd-atlas/04-enums.md) — 381 enum values
5. [`05-rotas-fe.md`](../../../../documentos-tecnicos/ddd-atlas/05-rotas-fe.md) — 529 rotas frontend / inter-serviço
6. [`06-paginas.md`](../../../../documentos-tecnicos/ddd-atlas/06-paginas.md) — 127 páginas
7. [`07-modais.md`](../../../../documentos-tecnicos/ddd-atlas/07-modais.md) — 46 modais
8. [`08-nucleo-global.md`](../../../../documentos-tecnicos/ddd-atlas/08-nucleo-global.md) — 106 componentes globais
9. [`09-componentes-locais.md`](../../../../documentos-tecnicos/ddd-atlas/09-componentes-locais.md) — 22 componentes locais

Atlas é regenerado automaticamente via [`scripts/sob-demanda/gerar-atlas-ddd.py`](../../../../scripts/sob-demanda/gerar-atlas-ddd.py).

**Antes de criar/renomear qualquer entidade, verifique se já existe no atlas.**

---

## Referências cruzadas

- **Mandamento 02** — Schema intocável, só Coordenador altera
- **Mandamento 03** — Dicionário oficial DDD
- **Mandamento 07** — Sincronia front+back na mesma entrega
- **Mandamento 09** — Zod schemas como contratos bilaterais
- **`skills/papeis/coordenador/SKILL.md`** — Quem executa scripts de rename de schema
- **`documentos-tecnicos/governanca/lei/ddd-nomenclatura/auditorias-execucao/`** — Auditorias de execução por área
- **`documentos-tecnicos/ddd-atlas/`** — Atlas com nomes DDD-finais (9 arquivos gerados)
- **Planilha mestre DDD** — `planilha_geral_gravity.xlsx`
