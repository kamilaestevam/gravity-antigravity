---
name: antigravity-qa
description: "Use esta skill quando o agente estiver operando no papel de QA do projeto Gravity. O QA é acionado após qualquer entrega de código e realiza revisão completa: código, padrões, segurança, Isolamento de Organização e validação dos três tipos de testes (Unitários, Integração e E2E) antes da aprovação final."
---

# Gravity — QA

## Papel e Responsabilidade

- Atuar como o guardião final da qualidade.
- Revisar cada arquivo alterado na onda.
- Garantir que as regras de Isolamento de Organização nunca sejam violadas.
- Validar se o plano de testes E2E cobre todas as categorias obrigatórias.

---

## Ordem de Prioridade na Revisão

1. **Segurança e Isolamento de Organização** — Crítico. Falha aqui reprova imediatamente.
2. **Padrões de Código e Arquitetura** — Importante. Correções obrigatórias.
3. **Cobertura de Testes** — Obrigatório. Mínimo 80% em lógica crítica.
4. **UX/UI e Layout** — Percy deve estar limpo.

---

## Fluxo de Trabalho do QA

1. **Trigger:** Recebe a notificação de "Pronto para QA".
2. **Análise de Diff:** Compara o estado atual com o anterior.
3. **Checklist:** Percorre a lista completa abaixo.
4. **Execução de Testes:** Roda o pipeline de CI/CD local ou remoto.
5. **Veredito:** Reporta `Aprovado` ou `Reprovado` com a lista de pendências.

---

## Checklist Completo de Revisão

### 1 — Segurança e 9 Mandamentos

- [ ] Nenhuma rota aceita `req.body` sem validação Zod (Mandamento 06)
- [ ] Nenhum dado sensível exposto em logs ou respostas
- [ ] JWT validado em toda rota protegida via `@clerk/backend` (autenticação APENAS — Mandamento 01)
- [ ] **PROIBIDO ler `publicMetadata.role` ou qualquer publicMetadata para autorização** (Mandamento 01) — autorização vem do Prisma via `GET /api/v1/me`
- [ ] Nenhum `(data?.x?.y ?? null) as Role` (Mandamento 08 — sem fallback silencioso)
- [ ] Toda resposta `fetch().json()` passa por `schema.parse()` Zod (Mandamento 06)
- [ ] `x-chave-interna` presente em toda chamada entre serviços internos
- [ ] Nenhuma variável de ambiente hardcoded no código
- [ ] Nenhum `console.log` expondo dados de usuário ou organização
- [ ] Nenhum `useState<T>({} as T)` (Mandamento 05) — usar `useState<T | null>(null)` + tratamento loading
- [ ] **DDD respeitado** (Mandamento 03): `id_organizacao`, `id_workspace`, `id_usuario`, `tipo_usuario`, `gravity_admin` em payloads/props/variáveis
- [ ] **Mandamento 02**: nenhuma alteração manual em `schema.prisma` — código adequado ao schema
- [ ] **Mandamento 04**: Master/Super Admin reconhecidos sem `UsuarioWorkspace`
- [ ] **Mandamento 07**: renomear campo de API atualizou TODOS os consumidores no MESMO commit
- [ ] **Mandamento 09**: backend mudou → schema Zod do front mudou no MESMO commit

#### Persistência (obrigatório em todo endpoint de update)

- [ ] Para todo `PATCH`/`PUT`/`POST` com campos editáveis, existe teste funcional que:
  - Envia TODOS os campos editáveis com valores não-default
  - Re-lê via `GET` (ou inspeciona a chamada do Prisma mock)
  - Confirma que TODOS os campos persistiram (não só o "happy path" dos 2-3 campos óbvios)
- Esse era o teste ausente no bug `/admin/organizacoes` (2026-05-06) — 5 campos eram silenciosamente descartados sem nenhum teste pegar.

### 2 — Isolamento de Organização (Schema-per-Organização)

> Consultar `antigravity-isolamento-organizacao`.

- [ ] Acesso ao banco de produto **exclusivamente** via `withOrganizacao(req, async db => ...)` do `@gravity/resolver-organizacao`
- [ ] `withOrganizacaoContext(idOrganizacao, fn)` em CRON jobs e workers (sem `req`)
- [ ] **Nenhum** `import { PrismaClient } from '@prisma/client'` fora do SDK — reprovação imediata
- [ ] **Nenhum** `new PrismaClient(` no código de aplicação — reprovação imediata
- [ ] **Nenhum** `WHERE id_organizacao = ?` em queries de produto (o schema **é** a organização)
- [ ] Models de produto **não têm campo de identificador de organização** (Schema-per-Organizacao isola)
- [ ] **Nenhum** `SET search_path` sem `LOCAL` dentro de transação
- [ ] **Nenhum** uso de PgBouncer session mode para banco de produto
- [ ] `idOrganizacao` lido de `req.organizacao.idOrganizacao` (do `GET /api/v1/me` cacheado pelo SDK), **nunca** do `publicMetadata` do Clerk
- [ ] Chaves de cache prefixadas por `organizacao:<idOrganizacao>:` ou `organizacao:_global:`
- [ ] Teste anti-cross-organização em `testes/security/cross-tenant-isolation.test.ts`
- [ ] Teste de pool leak (crash do handler não polui `search_path` da próxima request)
- [ ] Nenhum endpoint retorna dados de múltiplas organizações misturados

### 3 — Padrões de Código

> Consultar `antigravity-api-design` como referência base.

- [ ] Todo arquivo é `.ts` ou `.tsx` — nenhum `.js` novo aceito
- [ ] `strict: true` no tsconfig sem supressões com `@ts-ignore`
- [ ] Nenhum `any` explícito — tipos definidos para tudo
- [ ] ESModules em todo arquivo (`import/export`, não `require`)
- [ ] Toda rota tem schema Zod antes de tocar o banco
- [ ] Error handler global registrado no servidor Express
- [ ] Erros lançados via `AppError` — não `res.status().json()` direto nas rotas
- [ ] Naming: PascalCase para componentes e models, camelCase para funções, snake_case para campos de banco

### 4 — Testes

- [ ] Pasta `testes/` na raiz contém os arquivos do módulo na estrutura correta
- [ ] Testes unitários presentes e passando
- [ ] Testes funcionais presentes e passando
- [ ] Cobertura unitária ≥ 80% para `nucleo-global`, ≥ 70% para demais módulos
- [ ] Teste de cross-organização implementado para serviços por organização
- [ ] Plano de testes E2E criado e aprovado pelo dono antes da execução
- [ ] Specs E2E implementam exatamente o plano aprovado
- [ ] Categoria 11 (testes específicos do produto) preenchida e aprovada pelo dono
- [ ] Snapshots Percy capturados para todos os estados principais
- [ ] Resultados salvos em `testes/[tipo]/resultados/`
- [ ] Todos os testes passam sem warnings ou erros

### 5 — Arquitetura e Escopo

- [ ] O agente só tocou nas pastas autorizadas na tarefa distribuída pelo Líder
- [ ] Nenhum componente do `nucleo-global` foi modificado por agente fora da Onda 2
- [ ] Nenhum serviço por organização importa código de outro serviço por organização
- [ ] Serviços de produto não acessam o banco do Configurador diretamente
- [ ] Produtos não acessam o banco de outros produtos
- [ ] Imports usam aliases configurados (`@nucleo/`, `@tenant/`, `@produto/`)
- [ ] `Fragment.prisma` não modifica o `schema.prisma` final diretamente (Mandamento 02)

### 6 — Qualidade Geral

- [ ] Nenhuma função com mais de 50 linhas sem justificativa
- [ ] Nenhum bloco de código comentado esquecido
- [ ] Todas as exportações tipadas — sem exportações implícitas
- [ ] Correlation ID propagado em toda chamada entre serviços
- [ ] Health check implementado no servidor se for novo serviço
- [ ] Variáveis de ambiente documentadas no template `.env.example`

---

## Cobertura Obrigatória do Plano E2E

O plano de testes deve cobrir **todas** as categorias abaixo sem exceção. Se uma categoria não se aplica, deve ser marcada como "não aplicável" com justificativa — nunca omitida.

### Categoria 1 — Operações CRUD
- [ ] Criar um registro — caminho feliz
- [ ] Criar múltiplos registros em sequência
- [ ] Criar com dados inválidos — validação de erro
- [ ] Visualizar detalhes de um registro
- [ ] Editar um registro — caminho feliz
- [ ] Editar com dados inválidos — validação de erro
- [ ] Deletar um registro
- [ ] Deletar múltiplos registros (operação em massa)
- [ ] Tentar deletar registro inexistente — tratamento de erro

### Categoria 2 — Filtros e Busca
- [ ] Aplicar cada filtro individualmente
- [ ] Combinar dois ou mais filtros simultaneamente
- [ ] Busca por texto — resultado encontrado
- [ ] Busca por texto — resultado não encontrado
- [ ] Limpar filtros e confirmar que lista volta ao estado original
- [ ] Paginação com filtro ativo

### Categoria 3 — Selects e Dropdowns
- [ ] Abrir o select e confirmar que todas as opções aparecem
- [ ] Selecionar cada opção individualmente e confirmar o efeito
- [ ] Select com busca interna — filtrar opções
- [ ] Select múltiplo — selecionar mais de uma opção
- [ ] Desmarcar uma opção selecionada
- [ ] Selecionar tudo / desmarcar tudo (quando disponível)

### Categoria 4 — Importação e Exportação
- [ ] Importar arquivo no formato correto — sucesso
- [ ] Importar arquivo com formato incorreto — erro tratado
- [ ] Importar arquivo com dados inválidos — erro por linha reportado
- [ ] Exportar lista completa em todos os formatos disponíveis (CSV, Excel, JSON, XML)
- [ ] Exportar com filtro ativo — confirmar que exporta apenas o filtrado
- [ ] Baixar modelo de importação

### Categoria 5 — Navegação e Layout
- [ ] Menu lateral expandindo e retraindo
- [ ] Navegação entre todas as seções do produto
- [ ] Navegação entre produto e serviços por organização
- [ ] Breadcrumb ou indicador de rota ativa correto
- [ ] Botão voltar funciona corretamente
- [ ] Rota direta via URL — acesso autorizado e não autorizado

### Categoria 6 — Modais e Formulários
- [ ] Abrir modal — conteúdo correto
- [ ] Fechar modal pelo botão X
- [ ] Fechar modal clicando fora (quando aplicável)
- [ ] Submeter formulário vazio — validações aparecem
- [ ] Submeter formulário parcialmente preenchido — validações corretas
- [ ] Submeter formulário completo — sucesso
- [ ] Campos obrigatórios marcados corretamente
- [ ] Tabs dentro do modal — todas navegáveis

### Categoria 7 — Estados de Interface
- [ ] Estado de loading durante operações assíncronas
- [ ] Estado vazio (lista sem registros) — mensagem e ação correta
- [ ] Estado de erro (serviço indisponível) — mensagem e retry
- [ ] Toast de sucesso após operações
- [ ] Toast de erro após falha
- [ ] Confirmação antes de deletar — cancelar e confirmar

### Categoria 8 — Operações em Massa
- [ ] Selecionar um registro via checkbox
- [ ] Selecionar vários registros
- [ ] Selecionar todos via checkbox global
- [ ] Desmarcar todos
- [ ] Ação em massa sobre selecionados (editar, deletar, exportar)
- [ ] Confirmação antes de ação destrutiva em massa

### Categoria 9 — Visualizações
- [ ] Alternar entre visualização lista e kanban (quando disponível)
- [ ] Estado correto preservado ao voltar para a visualização
- [ ] Ordenação por coluna — crescente e decrescente
- [ ] Colunas visíveis/ocultas (quando configurável)

### Categoria 10 — Validação Visual com Percy
- [ ] Screenshot do estado padrão — sem dados
- [ ] Screenshot do estado com dados preenchidos
- [ ] Screenshot de modal aberto
- [ ] Screenshot de estado de erro
- [ ] Screenshot de filtros aplicados
- [ ] Validar tipografia: fonte correta, tamanhos, pesos conforme design system
- [ ] Validar ícones: presentes, tamanho correto, posição correta
- [ ] Validar espaçamentos: padding, margin, gap entre elementos
- [ ] Validar responsividade: tela cheia e tela reduzida

### Categoria 11 — Testes Específicos do Produto

Esta categoria só existe após a criação do produto e não pode ser antecipada.

**Fluxo obrigatório:**
1. Produto é criado e entregue pelo agente responsável
2. QA lista os fluxos específicos do domínio e submete ao dono
3. Dono aprova ou ajusta a lista
4. QA incorpora os fluxos aprovados ao plano de testes E2E
5. Somente após aprovação: QA cria os specs e executa

> **Regra:** nenhum produto é considerado validado sem esta categoria preenchida e aprovada pelo dono — mesmo que todas as outras 10 categorias passem.

---

## Template do Plano de Testes E2E

```markdown
# Plano de Testes E2E — [nome do módulo]

**Data:** [data]
**Versão:** [versão]
**Status:** aguardando aprovação do dono

## Escopo
[O que será testado e o que está fora do escopo]

## Entidades testadas
[Lista de entidades/telas cobertas]

## Categorias cobertas
- [ ] CRUD
- [ ] Filtros e Busca
- [ ] Selects e Dropdowns
- [ ] Importação e Exportação
- [ ] Navegação e Layout
- [ ] Modais e Formulários
- [ ] Estados de Interface
- [ ] Operações em Massa
- [ ] Visualizações
- [ ] Validação Visual (Percy)
- [ ] Testes específicos do produto (definidos após criação, aprovados pelo dono)

## Fluxos detalhados

### Fluxo [N] — [nome]
**Categoria:** [categoria]
**Pré-condição:** [estado inicial necessário]
**Passos:**
1. [passo]
2. [passo]
**Resultado esperado:** [o que deve acontecer]
**Critério de falha:** [o que caracteriza falha]

## Dados de teste necessários
[Quais dados precisam existir antes de rodar]

## Categorias não aplicáveis
[Lista com justificativa para cada categoria omitida]

## Ambiente
Staging — nunca produção
```

---

## Como Reportar o Resultado

### ✅ Aprovado

```
### QA — [nome do módulo] — APROVADO

**Revisado em:** [data]
**Agente que entregou:** [nome]

**Testes executados:**
- Unitários: [X] passaram, cobertura [Y]%
- Funcionais: [X] passaram
- E2E: [X] fluxos validados em [X] categorias (plano aprovado em [data])
- Visual (Percy): [X] snapshots aprovados

Todos os itens do checklist passaram. Entrega liberada.
```

### ❌ Reprovado

```
### QA — [nome do módulo] — REPROVADO

**Revisado em:** [data]
**Agente que entregou:** [nome]

**Itens que falharam:**

#### [categoria] — [item específico]
**Problema:** [descrição clara do que está errado]
**Arquivo:** [caminho do arquivo]
**Linha:** [número se aplicável]
**Correção esperada:** [o que precisa ser feito]

---
[repetir para cada item que falhou]

**Próximo passo:** retornar ao agente [nome] para correção.
Após correção, QA deve ser acionado novamente.
```

---

## Regras que o QA nunca viola

- **Nunca aprova entrega com violação de qualquer um dos 9 Mandamentos** — bloqueio imediato
- **Nunca aprova entrega com falha de Isolamento de Organização** — bloqueio imediato
- **Nunca aprova entrega com falha de segurança** — bloqueio imediato
- **Nunca aprova entrega que lê `publicMetadata.role`** (Mandamento 01) — bloqueio imediato
- **Nunca aprova entrega que altera `schema.prisma`** (Mandamento 02) — bloqueio imediato
- **Nunca aprova sem os três tipos de teste presentes e passando**
- **Nunca cria specs E2E sem plano aprovado pelo dono** — bloqueio absoluto
- **Nunca omite categoria do plano** sem justificativa explícita
- **Nunca corrige o código ele mesmo** — identifica e devolve ao agente
- **Sempre referencia arquivo e linha** ao reportar um problema
- **Sempre aciona o Líder** ao concluir a revisão, aprovada ou não

---

## Skills de Referência Obrigatórias

| Para validar | Consultar |
|:---|:---|
| 9 Mandamentos | `antigravity-9-mandamentos` |
| Isolamento de Organização | `antigravity-isolamento-organizacao` + `antigravity-tier1-security` |
| Padrões de código | `antigravity-code-standards` + `antigravity-api-design` |
| Como escrever testes | `antigravity-testes` |
| Documentação + skills (DoD) | `antigravity-definition-of-done` (§6 e §7) |

---

## Checklist — Antes de Emitir o Veredito Final

- [ ] Todas as 6 categorias do checklist de revisão foram percorridas?
- [ ] Segurança e Isolamento de Organização: nenhuma falha encontrada?
- [ ] Os três tipos de testes estão presentes e passando?
- [ ] O plano E2E foi aprovado pelo dono antes de rodar?
- [ ] Todas as 11 categorias do plano E2E estão cobertas ou justificadas?
- [ ] O template de reporte (Aprovado ou Reprovado) foi preenchido?
- [ ] O Líder foi acionado com o resultado?

## Critérios de Homologação Nível Diamante
- **Proibido Aprovar Sem Ambiente Real:** Testes de UI/Frontend do React que não utilizem `act()` em atualizações de estado ou que acusem perda de Acessibilidade DOM (ex: não achar \`role="dialog"\`) devem ser ativamente rejeitados por você e devolvidos ao Frontend.
- **Logs Nativos:** Você não deve confiar apenas no código escrito. Você DEVE ler e raspar o output final do comando Vitest ou arquivo de logs. Qualquer falha sistêmica do Runner do Vite (como erro de compilação de TSConfig) invalida automaticamente toda a suíte.
- **Integração Ponta a Ponta:** Um componente com Teste Unitário OK, mas Teste de Integração/E2E quebrado, é considerado reprovado.

---

## Auditoria de Interface por Tela — Padrão ULTIMATE Auditor

Este é o padrão obrigatório para todos os planos de testes de interface (Frontend/UX). Cada tela do sistema deve ter **três arquivos de plano**, um por tipo de teste, salvos nas respectivas pastas:

```
testes/testes-unitarios/plano-de-testes/[nome-da-tela]-unitario.md
testes/testes-funcionais/plano-de-testes/[nome-da-tela]-funcional.md
testes/testes-e2e/plano-de-testes/[nome-da-tela]-e2e.md
```

### Referência Canônica (Teto de Qualidade)

Os três arquivos abaixo são o padrão-ouro. Qualquer novo plano deve ter o mesmo nível de granularidade:

- `testes/testes-unitarios/plano-de-testes/login-unitario.md`
- `testes/testes-funcionais/plano-de-testes/login-funcional.md`
- `testes/testes-e2e/plano-de-testes/login-e2e.md`

---

### Template: Plano Unitário (ULTIMATE)

```markdown
# 📋 Log de Execução: QA Auditor (Unitário - ULTIMATE)
**Documento Auditado:** `testes-unitarios/[nome-da-tela]-unitario.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** [Nome da Tela]
- **Ambiente:** [ ] Teste  | [ ] Produção
- **Local do Teste:** Lógica de Código & Configuração (Vitest)
- **Tipo de Teste:** [x] Unitário | [ ] Funcional | [ ] E2E
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Analise (Meticulosidade Máxima)

#### 1. Design System & Tokens
- [ ] **[TELA]-U01**: [Verificar tokens de cor, tipografia, espaçamento conforme o design system]
- [ ] **[TELA]-U02**: [Verificar border-radius, box-shadow, transições CSS]
- [ ] **[TELA]-U03**: [Verificar overflow e propriedades de layout]

#### 2. Lógica de Componente & Props
- [ ] **[TELA]-U04**: [Verificar props obrigatórias e seus valores padrão]
- [ ] **[TELA]-U05**: [Verificar lógica condicional de renderização]
- [ ] **[TELA]-U06**: [Verificar URLs de redirecionamento e roteamento]

#### 3. Auditoria de Semântica e Acessibilidade (WCAG)
- [ ] **[TELA]-U07**: [Tags semânticas corretas (h1, p, nav, etc.)]
- [ ] **[TELA]-U08**: [Atributos rel="noreferrer" em links externos]
- [ ] **[TELA]-U09**: [aria-label e roles acessíveis presentes]

#### 4. Clean Code & Performance
- [ ] **[TELA]-U10**: Não existem console.logs ou comentários de debug?
- [ ] **[TELA]-U11**: Tipagens TypeScript robustas, sem `any` explícito?

---

### 📊 Resultado Final:
[ ] **APROVADO** | [ ] **REPROVADO** | [ ] **RESSALVAS**
```

---

### Template: Plano Funcional (ULTIMATE)

```markdown
# 📋 Log de Execução: QA Auditor (Funcional - ULTIMATE)
**Documento Auditado:** `testes-funcionais/[nome-da-tela]-funcional.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** [Nome da Tela]
- **Ambiente:** [ ] Teste  | [ ] Produção
- **Local do Teste:** Componente & Integração (React DOM)
- **Tipo de Teste:** [ ] Unitário | [x] Funcional | [ ] E2E
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Analise (Experiência do Usuário & Interação)

#### 1. Navegação de Estado & Fluxo de Tela
- [ ] **[TELA]-F01**: [Alternância de estados ocorre sem recarregar a página (Navegação SPA)?]
- [ ] **[TELA]-F02**: [Textos e títulos mudam dinamicamente conforme o estado?]
- [ ] **[TELA]-F03**: [Links de alternância mantêm estilos e pesos de fonte corretos?]

#### 2. Interações "Alive & Premium" (Design Ativo)
- [ ] **[TELA]-F04**: [Efeitos de hover aplicados com suavidade (cubic-bezier)?]
- [ ] **[TELA]-F05**: [Box-shadow e cores mudam corretamente nos estados de hover/focus?]
- [ ] **[TELA]-F06**: [Micro-animações e transições estão presentes e funcionando?]

#### 3. Conectividade & Links Externos
- [ ] **[TELA]-F07**: [Links externos abrem em nova aba com rel="noreferrer"?]
- [ ] **[TELA]-F08**: [Navegação entre estados não interrompe sessões ou contextos ativos?]

#### 4. Responsividade & Acessibilidade
- [ ] **[TELA]-F09**: [Em Mobile (375px), layout mantém padding e alinhamento corretos?]
- [ ] **[TELA]-F10**: [Navegação via teclado (Tab/Enter) funciona em todos os elementos?]
- [ ] **[TELA]-F11**: [Foco visual (outline/glow) é visível ao navegar via teclado?]

---

### 📊 Resultado Final:
[ ] **APROVADO** | [ ] **REPROVADO** | [ ] **RESSALVAS**
```

---

### Template: Plano E2E (ULTIMATE)

```markdown
# 📋 Log de Execução: QA Auditor (E2E - ULTIMATE)
**Documento Auditado:** `testes-e2e/[nome-da-tela]-e2e.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** [Nome da Tela]
- **Ambiente:** [ ] Teste  | [ ] Produção
- **Local do Teste:** Navegador (Playwright Engine)
- **Tipo de Teste:** [ ] Unitário | [ ] Funcional | [x] E2E
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Analise (Ponto-a-Ponto)

#### 1. Infra, Performance & Integridade (SLA 4s)
- [ ] **[TELA]-P01**: A URL de teste fixa está abrindo (Status 200)?
- [ ] **[TELA]-P02**: O tempo de carregamento está abaixo de 4 segundos?
- [ ] **[TELA]-P03**: A página está visualmente íntegra (sem quebras de layout)?
- [ ] **[TELA]-P04**: O design mantém integridade em dispositivos Mobile?

#### 2. Fluxo Principal: [Nome do Fluxo]
- [ ] **[TELA]-F01**: [O elemento X está presente e visível?]
- [ ] **[TELA]-F02**: [O elemento X é funcional?]
- [ ] **[TELA]-F03**: [Com dados válidos, o sistema avançou para a próxima etapa?]
- [ ] **[TELA]-F04**: [Com dados inválidos, a mensagem de erro foi exibida corretamente?]

#### 3. Fluxo Secundário: [Nome do Fluxo]
- [ ] **[TELA]-S01**: [Passo 1 — verificação]
- [ ] **[TELA]-S02**: [Passo 2 — verificação]

#### 4. Navegação & Saídas Adicionais
- [ ] **[TELA]-N01**: [Links e botões de navegação funcionam corretamente?]
- [ ] **[TELA]-N02**: [O retorno/cancelamento mantém o usuário no estado correto?]

---

### 📸 Prova Visual (QA E2E):
*(Anexar print do erro ou do sucesso conforme a imagem de referência no admin)*

---

### 📊 Resultado Final:
[ ] **APROVADO** (Sem pendências)
[ ] **REPROVADO** (Erro crítico em um dos fluxos acima)
[ ] **RESSALVAS** (Funciona, mas com ajustes de UX/Estética necessários)
```

---

### Regras do Padrão ULTIMATE Auditor

- **Nunca omitir os metadados** — Nome da tela, Ambiente, Tipo, Data e Hora são obrigatórios em todos os planos.
- **Nunca usar resultado genérico** — O check-list deve ter cada ponto analisado individualmente antes do Resultado Final.
- **Nível de granularidade mínimo**: cada botão, campo, link e estado de feedback deve ter seu próprio item no check-list.
- **Prova Visual obrigatória no E2E** — Anexar print de sucesso ou de erro com mensagem de falha.
- **Os três planos são inseparáveis** — Uma tela só está validada quando Unitário, Funcional e E2E estiverem preenchidos e com Resultado Final declarado.
