# Matriz de Cobertura RBAC — Workspaces + Permissões Granulares

**Task:** TASK-000305  
**Escopo:** Configurador — Cadeia 1 (`tipo_usuario`) + Cadeia 2 (granular `<slug>:<secao>:<acao>`)  
**Referência normativa:** `skills/seguranca/permissoes/SKILL.md`

---

## 1. Tipos de usuário (Cadeia 1)

| Código Prisma | Label UI | Bypass granular (Mand. 04) | Depende `UsuarioWorkspace` |
|:---|:---|:---:|:---:|
| `SUPER_ADMIN` | Super Admin | Sim | Não |
| `ADMIN` | Admin Gravity | Sim* | Não |
| `MASTER` | Master | Sim | Não |
| `PADRAO` | Standard | Não | **Sim** |
| `FORNECEDOR` | Fornecedor | Não | **Sim** |

\* Admin Gravity: leitura ampla; escrita no Admin Panel só com `PermissaoAdminGravity` explícita.

---

## 2. Ambiente de teste mínimo (pré-requisito QA)

| Recurso | Quantidade | Nomes sugeridos (fixtures) |
|:---|:---|:---|
| Organização cliente | 1 | `org-qa-rbac` (≥ 3 workspaces ativos) |
| Workspaces | 3 | `WS-Alpha`, `WS-Beta`, `WS-Gamma` |
| Produtos contratados | ≥ 2 | `pedido` (12 toggles) + `bid-frete` (12 toggles + `visao_fornecedor:cotar`) |
| Usuários fixture | 5 + 1 Master operador | Ver seção 3 |
| Contas Clerk | 1 por usuário fixture | E-mails dedicados `qa-rbac-*@…` |

**Master operador:** usado para habilitar/desabilitar workspaces e permissões entre cenários (nunca é o sujeito under test nos cenários de negação).

---

## 3. Usuários fixture (sujeitos under test)

| ID fixture | `tipo_usuario` | Uso principal |
|:---|:---|:---|
| `USR-SA` | SUPER_ADMIN | Baseline acesso global |
| `USR-ADM` | ADMIN | Baseline Gravity read + escrita condicional |
| `USR-MST` | MASTER | Baseline org total |
| `USR-STD` | PADRAO | Matriz workspace + granular |
| `USR-FOR` | FORNECEDOR | Matriz workspace + granular + visão fornecedor |

---

## 4. Matriz de combinações de workspace (PADRAO e FORNECEDOR)

Para org com workspaces `{A, B, C}`:

| ID cenário | Workspaces habilitados em `UsuarioWorkspace` | Esperado no HUB | Esperado no seletor `/core` |
|:---|:---|:---|:---|
| **WS-01** | `{A}` | Só card `WS-Alpha` | Dropdown só `WS-Alpha` |
| **WS-02** | `{B}` | Só `WS-Beta` | Só `WS-Beta` |
| **WS-03** | `{C}` | Só `WS-Gamma` | Só `WS-Gamma` |
| **WS-04** | `{A, B}` | Alpha + Beta | Alpha + Beta |
| **WS-05** | `{A, C}` | Alpha + Gamma | Alpha + Gamma |
| **WS-06** | `{B, C}` | Beta + Gamma | Beta + Gamma |
| **WS-07** | `{A, B, C}` | Todos | Todos |

**Verificações obrigatórias em cada cenário WS-0N:**

1. Workspaces **não** habilitados **não** aparecem no HUB nem no seletor.
2. URL direta com `id_workspace` de workspace não vinculado → **403** ou redirect seguro (sem dados vazados).
3. Produto aberto no workspace **não** vinculado → **403 FORBIDDEN** / tela bloqueada.
4. Após Master **revogar** um workspace, cache de sessão não mantém acesso (logout/login ou hard refresh).

**Baseline bypass (SUPER_ADMIN, ADMIN, MASTER):** cenário **WS-BYPASS** — sem linhas `UsuarioWorkspace` → veem **todos** os workspaces da org.

---

## 5. Permissões granulares — inventário canônico

### 5.1 Portão 3 (acesso ao produto)

| Chave | Efeito se ausente |
|:---|:---|
| `<slug>:acesso_usuario_produtos_gravity:permitido` | Produto **não** aparece no menu lateral / tile bloqueado |

### 5.2 Cadeia 2 — grid 6×2 por produto

Seções: `dashboard`, `kanban`, `lista`, `configuracao`, `relatorios`, `historico`  
Ações: `ver`, `editar`

| Chave exemplo (`pedido`) | Superfície UI típica se **negada** |
|:---|:---|
| `pedido:dashboard:ver` | Menu Dashboard oculto ou rota 403 |
| `pedido:dashboard:editar` | Widgets read-only / botões edição ocultos |
| `pedido:kanban:ver` | Aba Kanban inacessível |
| `pedido:kanban:editar` | Drag-and-drop / ações card desabilitadas |
| `pedido:lista:ver` | Lista inacessível (redirect ou empty locked) |
| `pedido:lista:editar` | Toolbar edição / inline edit bloqueados |
| `pedido:configuracao:ver` | Config produto inacessível |
| `pedido:configuracao:editar` | Formulários config read-only |
| `pedido:relatorios:ver` | Relatórios inacessíveis |
| `pedido:relatorios:editar` | Export/ações bloqueadas |
| `pedido:historico:ver` | Link Histórico oculto; `/historico-organizacao` → 403 |

### 5.3 Extra Fornecedor (BID Frete)

| Chave | Efeito se ausente |
|:---|:---|
| `bid-frete:visao_fornecedor:cotar` | Portal/responder cotação inacessível |

---

## 6. Metodologia «uma variável por vez» (negação isolada)

Para cada usuário `PADRAO` ou `FORNECEDOR` fixo em **WS-07** (todos workspaces) e produto `pedido` com Portão 3 **ligado**:

1. Master concede **todas** as 12 permissões granulares + Portão 3.
2. Confirmar baseline: todas as seções acessíveis.
3. Para cada chave `K` na lista §5.2:
   - Master **revoga somente** `K` (demais permanecem).
   - Login como sujeito → verificar superfície §5.2 para `K` **travada**.
   - Master **restaura** `K` antes do próximo passo.
4. Repetir para `bid-frete` (incluir passo extra `visao_fornecedor:cotar` para `USR-FOR`).
5. Repetir Portão 3: revogar `pedido:acesso_usuario_produtos_gravity:permitido` com granulares ligadas → produto **sumiu** do menu.

**Total mínimo de negações isoladas (pedido):** 12 granulares + 1 portão = **13** por tipo PADRAO.  
**FORNECEDOR adicional:** +1 (`visao_fornecedor:cotar`) + repetir matriz bid-frete.

---

## 7. Critérios «tela travada» (definição QA)

| Camada | APROVADO quando |
|:---|:---|
| **UI** | Botão/link/menu **ausente** ou **disabled** com tooltip/mensagem de permissão |
| **Rota client** | Guard redireciona ou exibe estado «Sem permissão» — **nunca** tela funcional parcial |
| **API** | `GET/POST/PUT/DELETE` na rota protegida → **403** `FORBIDDEN_PERMISSION` (ou código documentado) |
| **Network** | Nenhum payload de dados sensíveis em 200 quando permissão negada |
| **Console** | Zero erros JS não tratados |

---

## 8. Mapa plano → tipo de teste

| Plano | ID | Foco |
|:---|:---|:---|
| Unitário | TST-UNI-CONFIG-RBAC-WORKSPACES-000141 | Funções puras, Zod, bypass, defaults |
| Funcional | TST-FUN-CONFIG-RBAC-WORKSPACES-000142 | Rotas API, middleware, filtros hub/me |
| Cross-org | TST-CRO-CONFIG-RBAC-WORKSPACES-000143 | IDOR workspace, Fornecedor multi-org |
| E2E | TST-E2E-CONFIG-RBAC-WORKSPACES-000144 | Playwright fluxos automatizáveis |
| Em Tela | TST-EMT-CONFIG-RBAC-WORKSPACES-000145 | Matriz WS-01…07 + negação isolada com prints |

---

## 9. Produtos no Set `PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS`

Atualizar esta seção quando o Set mudar em `permissoes-canonicas.ts`:

- `pedido`
- `bid-frete`
- `bid-frete-internacional`

Produtos **fora** do Set: modal exibe «Em breve» — **não** entram na matriz de toggles até migração.
