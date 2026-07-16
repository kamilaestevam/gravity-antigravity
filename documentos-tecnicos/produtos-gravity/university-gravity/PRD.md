# PRD — Gravity University v1.0

> **Versão:** 1.0
> **Data:** 27/06/2026
> **Status:** Rascunho — aguardando aprovação do dono e revisão do Coordenador (modelagem de banco)
> **Publicação produção (2026-07-15):** módulo **fora de prod** por decisão PO MASTER (Daniel) — ver [PUBLICACAO-PRODUCAO.md](./PUBLICACAO-PRODUCAO.md). Guia Gravity permanece o canal oficial de help.
> **Product Owner:** Daniel Mendes
> **Natureza:** **Serviço de plataforma** (não é produto vendável) — vive em `servicos-global/servicos-plataforma/`, junto da GABI e do API Cockpit.
> **Slug de código (canônico):** `university-gravity` (marca em UI: **Gravity University**)
> **Execução:** backend compõe no super-servidor de organização (porta `3001`, como os demais serviços de plataforma); frontend é módulo/rota no Shell (porta dev a confirmar). **Sem banco dedicado** — compõe no banco compartilhado por organização (ver MODELO-DADOS).

---

## 0. Aviso de governança

Este documento é **especificação**, não código. Antes de qualquer implementação:

1. A University é um **serviço de plataforma** (`servicos-global/servicos-plataforma/`), **não um produto** vendável. Segue o padrão da GABI/API Cockpit, **não** os 23 passos de `criar-produto` (que valem para produtos com banco e marketplace próprios).
2. O modelo de domínio (Seção 6 + MODELO-DADOS) é **conceitual**. O `schema.prisma` é **intocável** (Mandamento 02) — só o Coordenador compõe via `compose-tenant-schema.ts` a partir do `fragment.prisma`. As entidades aqui são proposta para o Coordenador.
3. A nomenclatura segue a lei DDD (`skills/governanca/lei/ddd-nomenclatura`): PT-BR sem acento no código, booleans sem `is_`, enums com nome PascalCase PT-BR e valores `UPPER_SNAKE` em inglês. Como serviço de plataforma, segue a convenção da GABI (prefixo de serviço no model + sufixo de entidade em toda coluna — ver MODELO-DADOS).
4. **Sem banco dedicado:** as tabelas compõem no banco compartilhado por organização (schema `tenant_<cuid>`), junto da GABI.
5. A integração de conteúdo com a KB da GABI **toca o `fragment.prisma` da GABI** → exige envolvimento do Coordenador (Seção 18).

---

## 1. Sumário Executivo

**Gravity University** é o hub único de aprendizado e conhecimento da plataforma Gravity. Ele transforma o conhecimento que hoje já vive consolidado na **GABI** (a camada de conhecimento da plataforma) em uma experiência estruturada de aprendizado: trilhas de onboarding por produto, documentação navegável, jornada gamificada, avaliação e certificado.

**Princípio central:** a Gravity University e a GABI são **duas interfaces da mesma base de conhecimento**. A GABI responde sob demanda ("me explica X"); a University ensina de forma estruturada ("me forme em X"). O conteúdo é **cadastrado uma única vez** e alimenta as duas — sem duplicação.

**Experiência sem atrito:** o usuário já está logado na plataforma. Ao entrar na University, ele **não faz nada** — é reconhecido pela sessão existente, vê todo o conteúdo, e jornada/andamento/certificados são gravados automaticamente. Sem login próprio, sem cadastro, sem botão "matricular".

**Problema:** hoje o conhecimento da plataforma está fragmentado — parte na GABI (RAG sobre documentação em Markdown), parte em manuais soltos, sem jornada de onboarding formal, sem trilha por produto, sem certificação e sem um lugar único onde cliente, colaborador, integrador e parceiro aprendam a usar o Gravity.

**Solução:** um serviço de plataforma com 3 áreas (**Academy / Docs / Builders**) tendo a **GABI onipresente** como fonte de conteúdo, guia de dúvida (reativa) e guia de jornada (proativa). Onboarding por produto, certificado por avaliação com nota mínima, e documentação que é a própria base de conhecimento da GABI navegável.

**Métrica de sucesso (proposta):** redução do tempo de ativação de novos usuários (time-to-first-value) e aumento da taxa de conclusão de onboarding por produto, com a GABI ficando mais inteligente a cada conteúdo publicado (mesmo input).

---

## 2. Contexto e Motivação

### Por que agora

- A **GABI já consolida o conhecimento** da plataforma via RAG (pgvector + Gemini). A infraestrutura de conhecimento já existe — falta a **face estruturada de aprendizado**.
- A plataforma já tem múltiplos produtos (Pedido, Processo, Smart Docs, LPCO, NF-Importação, Bid-Frete, etc.) e nenhum onboarding formal unificado.
- Existe um vizinho natural para a parte técnica: o **API Cockpit** (tokens, playground, webhooks, conector ERP/SAP). A área Builders **aponta** para ele, não duplica.

### Como a GABI conhece a plataforma (limite importante)

A KB da GABI é compilada **apenas de documentação em Markdown** (`.md`) — um subconjunto **voltado ao produto** de `documentos-tecnicos/` e `skills/produtos-gravity/`, segmentado por produto. Ver `servicos-global/servicos-plataforma/gabi/server/knowledge/compile.ts`.

**A GABI NÃO lê o código-fonte (`.ts`/`.tsx`)** e o `compile.ts` ainda exclui as áreas internas (governança, papéis, processos, arquitetura, segurança, testes e os próprios docs da GABI).

**Consequência para a University:** o que a University/GABI ensina é tão atual quanto a **documentação escrita**, não quanto o código rodando. Se o código muda e a doc não, a GABI ensina o desatualizado em silêncio. Por isso o conteúdo da University deve ser **fonte deliberada, curada e versionada** (ver D-004/D-005 e Seção 18). Manter a doc em dia passa a ser parte do "Definition of Done" de qualquer produto.

### O que existe hoje no Gravity (reaproveitável)

| Ativo existente | Uso na University |
|---|---|
| GABI — RAG/KB (pgvector, Gemini; fonte = docs Markdown) | Fonte de conteúdo + busca + tutor |
| GABI — chat (`Gabi.tsx`) | Guia de dúvida onipresente |
| API Cockpit | Destino da área Builders |
| Configurador (auth, produtos ativos, organizações) | Sessão existente, contexto de usuário (`/me`) |
| Shell + núcleo-global | Layout e componentes |
| Pipeline i18n | Localização das telas |

---

## 3. Conceito Central — University = face estruturada da GABI

```
                  ┌─────────────────────────────────────────┐
                  │   BASE DE CONHECIMENTO (consolidada)     │
                  │   conteúdo único (textos, manuais,       │
                  │   vídeos, trilhas, quizzes) + embeddings │
                  │   — vive consolidada na GABI             │
                  └───────────────────┬─────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                    │
   ┌────────▼─────────┐                              ┌───────────▼──────────┐
   │  GABI            │                              │  GRAVITY UNIVERSITY  │
   │  (conversacional)│                              │  (estruturado)       │
   │  "me explica X"  │                              │  "me forme em X"     │
   └──────────────────┘                              └──────────────────────┘
```

**Duas regras invioláveis do conceito:**

1. **Conteúdo (conhecimento) = fonte única na GABI.** Cadastra-se uma vez; aparece na Docs (para ler), na Academy (como material de aula) e fica disponível para a GABI responder. Editar num lugar só.
2. **Conhecimento ≠ registro do aluno.** O conteúdo é compartilhado e vai para a KB. O **registro do aluno** (progresso, nota, certificado emitido) é individual, imutável e **fora da KB** — pertence ao domínio da University. Misturar dado pessoal na KB quebraria a busca da GABI.

### A GABI é onipresente na University (3 papéis)

| Papel | O que faz |
|---|---|
| **Fonte de conhecimento** | A KB que ela usa é a mesma que abastece Docs e o material da Academy |
| **Guia de dúvida (reativa)** | Em qualquer aula/manual, o aluno pergunta e ela responde no contexto daquele conteúdo |
| **Guia de jornada (proativa)** | Acompanha o progresso ("você parou no módulo 3", "falta o quiz para liberar o certificado", "que tal a trilha de Processo agora?") |
| **Curadoria/geração (apoio)** | Ajuda a gerar resumos e rascunhos de quiz a partir do conteúdo existente |

---

## 4. Arquitetura de Informação

```
GRAVITY UNIVERSITY  (login da sessão existente · conteúdo sem segmentação por tipo de usuário)
│
│   ╔══════════════════════════════════════════════════════╗
│   ║  GABI — presente em toda tela                         ║
│   ║   • guia de dúvida (pergunto onde eu estiver)         ║
│   ║   • guia de jornada (ela me conduz)                   ║
│   ╚══════════════════════════════════════════════════════╝
│
├── 🎓 ACADEMY   trilhas + jornada + gamificação + certificado
│      ├── Trilha Plataforma (base, comum a todos)
│      └── Trilha por Produto (Pedido, Processo, Smart Docs, LPCO, ...)
│
├── 📚 DOCS      manuais + vídeos + busca (sob demanda; é a KB da GABI navegável)
│
└── 🧩 BUILDERS  integradores/devs → aponta para o API Cockpit (não duplica)
```

### Identidade e acesso (sem atrito)

- **Sessão existente:** a University usa o login que o usuário já tem no Shell (Clerk JWT + contexto `/me`). **Sem login próprio, sem cadastro.**
- **Conteúdo aberto:** todo usuário logado vê todo o conteúdo. **Sem segmentação** por tipo de usuário (D-003). A organização do conteúdo é por **tema/produto**.
- **Uma única ação:** não há botão "matricular". O **máximo** que o usuário faz é clicar **"Iniciar jornada"** na trilha — isso cria a matrícula. A partir daí, tudo é gravado automaticamente.
- **Rastreamento automático:** jornada, andamento, notas e certificados são gravados sozinhos, atrelados ao `id_usuario` + `id_organizacao` da sessão. O usuário não precisa fazer nada.
- **Ponto de acesso na UI:** a confirmar (TBD) — candidatos: Hub (lançador), ícone fixo na barra superior (perto da busca/GABI), dentro da GABI, ou menu do perfil.

---

## 5. Público-Alvo

Quatro públicos consomem o **mesmo** conteúdo (sem gating), variando apenas o que cada um costuma buscar:

| Público | O que tipicamente busca |
|---|---|
| **Cliente** (usuário de workspace) | Onboarding e manuais dos produtos que usa |
| **Colaborador interno Gravity** | Integração + visão de todos os produtos |
| **Integrador / Desenvolvedor** | Trilha técnica de integração + doc de API (Builders/Cockpit) |
| **Parceiro / Revenda** | Trilha comercial + material de implementação |

> Como não há segmentação, não existe "etiqueta de audiência" no modelo de dados. Isso simplifica a modelagem (decisão D-003).

---

## 6. Modelo de Domínio Conceitual (proposta para o Coordenador)

> Nomenclatura DDD PT-BR. Models em PascalCase + `@@map("snake_case")`. **Não é schema final** — o Coordenador valida e compõe. Como **serviço de plataforma** (não produto), compõe no banco da organização e segue a convenção da GABI: dados por organização **carregam** `id_organizacao` (sufixado); conteúdo global **não** carrega (como `GabiKbChunk`). Detalhe coluna a coluna em [MODELO-DADOS.md](MODELO-DADOS.md).

### 6.1 Conhecimento (conteúdo) — fonte única, integra com a KB da GABI

| Entidade (model) | Tabela | Papel |
|---|---|---|
| `Trilha` | `trilha` | Trilha de aprendizado (ex: "Onboarding Pedido"). Tipo plataforma ou produto |
| `Modulo` | `modulo` | Agrupa aulas dentro de uma trilha; ordem definida |
| `Aula` | `aula` | Unidade de conteúdo. Tipo: vídeo, documento/manual, texto |
| `RecursoConhecimento` | `recurso_conhecimento` | Material reutilizável (PDF/vídeo/texto) que vira chunk na KB da GABI |
| `Avaliacao` | `avaliacao` | Prova de trilha (nota mínima para aprovar) |
| `Questao` | `questao` | Pergunta de uma avaliação |
| `Alternativa` | `alternativa` | Opção de resposta de uma questão |

**Enums propostos:** `TipoTrilha { PLATFORM, PRODUCT }` · `TipoAula { VIDEO, DOCUMENT, TEXT }` · `TipoQuestao { MULTIPLE_CHOICE, TRUE_FALSE }`

### 6.2 Registro do aluno — individual, imutável, **fora da KB**

| Entidade (model) | Tabela | Papel |
|---|---|---|
| `MatriculaTrilha` | `matricula_trilha` | Vincula `id_usuario` a uma `Trilha`; criada **automaticamente** no 1º acesso; guarda status e % |
| `ProgressoAula` | `progresso_aula` | Marca conclusão de cada aula pelo usuário |
| `TentativaAvaliacao` | `tentativa_avaliacao` | Cada tentativa de prova, com nota e aprovado |
| `Certificado` | `certificado` | Emitido ao concluir trilha + aprovar; dados congelados (snapshot) |

**Enum proposto:** `StatusMatricula { IN_PROGRESS, COMPLETED, EXPIRED }`

### 6.3 Gamificação (transversal)

| Entidade (model) | Tabela | Papel |
|---|---|---|
| `PontuacaoUsuario` | `pontuacao_usuario` | Saldo e histórico de pontos do usuário na University |
| `Conquista` | `conquista` | Definição de badge (ex: "Concluiu trilha Pedido") |
| `ConquistaUsuario` | `conquista_usuario` | Badge conquistada por um usuário (data) |

> **Ranking:** calculado em runtime a partir de `PontuacaoUsuario` (campo derivado, não persistido).

---

## 7. Requisitos Funcionais

### MVP — Fase 1 (Academy de 1 produto, ponta a ponta)

| ID | Requisito | Área | Prioridade |
|----|-----------|------|-----------|
| RF-001 | Catálogo de trilhas (listar/buscar trilhas publicadas) | Academy | Must |
| RF-002 | **Iniciar jornada** — única ação explícita do usuário; cria a matrícula (sem botão "matricular") | Academy | Must |
| RF-003 | Consumir aula de vídeo (player + marcar conclusão) | Academy | Must |
| RF-004 | Consumir aula de documento/manual (visualizador PDF) | Academy | Must |
| RF-005 | Consumir aula de texto | Academy | Must |
| RF-006 | Progresso por trilha (% e retomar de onde parou) — **gravado automaticamente** | Academy | Must |
| RF-007 | Avaliação com nota mínima (quiz de múltipla escolha / V-F) | Academy | Must |
| RF-008 | Bloquear certificado até aprovação na avaliação | Academy | Must |
| RF-009 | Emitir certificado (PDF + código de validação) ao concluir | Academy | Must |
| RF-010 | GABI guia de dúvida no contexto da aula | GABI | Must |
| RF-011 | Pontos por aula/módulo concluído | Gamificação | Must |
| RF-012 | Badge por trilha concluída | Gamificação | Should |
| RF-013 | Painel "Minha jornada" (trilhas em andamento, certificados) | Academy | Must |

### Fase 2 (escala: Docs + Builders + jornada proativa)

| ID | Requisito | Área | Depende de |
|----|-----------|------|-----------|
| RF-020 | Docs — navegação da KB da GABI (browse + busca) | Docs | KB GABI |
| RF-021 | Conteúdo único: publicar um `RecursoConhecimento` → aparece em Docs **e** vira chunk na KB | Docs/GABI | Coordenador (fragment GABI) |
| RF-022 | Builders — landing que direciona ao API Cockpit por segmento | Builders | API Cockpit |
| RF-023 | GABI guia de jornada (proativa): lembretes de progresso e próxima trilha | GABI | RF-006 |
| RF-024 | Trilhas para todos os produtos (escalar o motor) | Academy | MVP validado |
| RF-025 | Validação pública de certificado (página por `codigo_validacao_certificado`) | Academy | RF-009 |
| RF-026 | Ranking e leaderboard | Gamificação | RF-011 |
| RF-027 | Relatórios de progresso (admin) — conclusão por trilha/usuário | Admin | RF-006 |

### Fase 3 (inteligência e engajamento)

| ID | Requisito |
|----|-----------|
| RF-040 | GABI gera rascunho de quiz/resumo a partir do conteúdo (curadoria assistida) |
| RF-041 | Trilha recomendada pela GABI conforme uso real do produto |
| RF-042 | Loja de prêmios (resgate de pontos) — opcional |
| RF-043 | Notificações multicanal (in-app, e-mail; futuramente outros) |
| RF-044 | Certificação formal (carga horária, expiração/renovação) |

---

## 8. Requisitos Não-Funcionais

| ID | Requisito | Critério |
|----|-----------|---------|
| RNF-001 | Performance | Catálogo e player carregam < 200ms p95 (alinhado a `sla-metas`) |
| RNF-002 | Conteúdo único | Zero duplicação entre Docs e KB da GABI (mesma fonte) |
| RNF-003 | Isolamento | Dados por organização sempre via contexto de organização; conteúdo global é compartilhado |
| RNF-004 | Segurança | 5 camadas (`seguranca-5-camadas`); sessão Clerk existente |
| RNF-005 | Imutabilidade | Certificado e tentativas de avaliação são append-only |
| RNF-006 | Acessibilidade | WCAG 2.1 AA |
| RNF-007 | i18n | pt-BR (MVP), en/es via pipeline i18n |
| RNF-008 | Observabilidade | Health check, correlation ID, Sentry |
| RNF-009 | Fidelidade do conteúdo | Conteúdo é fonte curada/versionada; a GABI não lê código, então doc desatualizada = ensino errado. Atualizar conteúdo entra no Definition of Done |

---

## 9. Fluxos de Usuário

### Fluxo principal — concluir uma trilha e tirar certificado

```
1. Usuário (já logado) abre Gravity University → Academy → Catálogo de trilhas
2. Escolhe "Onboarding Pedido" → clica "Iniciar jornada"
   → matrícula criada (única ação do usuário); progresso começa a gravar
3. Percorre módulos: assiste vídeo / lê manual / lê texto
   - A cada aula concluída: ganha pontos; progresso atualiza sozinho
   - Em qualquer ponto: pergunta à GABI (guia de dúvida) sobre o conteúdo
4. Ao fim das aulas → Avaliação final (quiz)
   - Reprovou (< nota mínima) → pode refazer (nova TentativaAvaliacao)
   - Aprovou (>= nota mínima) → libera certificado
5. Certificado emitido automaticamente (PDF + código) → aparece em "Minha jornada"
6. GABI (guia de jornada) sugere a próxima trilha
```

### Fluxo — Docs (sob demanda)

```
1. Usuário precisa de uma informação pontual
2. Abre Docs → busca/navega a KB da GABI
3. Lê o manual/vídeo OU pergunta direto à GABI (mesma fonte)
```

### Fluxo — Builders

```
1. Integrador abre Builders
2. Vê trilha técnica + é direcionado ao API Cockpit (tokens, playground, webhooks)
3. GABI dá suporte técnico no contexto
```

### Fluxo — publicação de conteúdo (admin/autor)

```
1. Autor cadastra/edita um RecursoConhecimento (vídeo/PDF/texto) UMA vez
2. Conteúdo é publicado → (a) navegável em Docs (b) ingerido como chunk na KB da GABI
3. GABI passa a responder com base nele; Academy pode referenciá-lo numa aula
```

---

## 10. Mapa de Telas — MVP

| # | Tela | Rota (proposta) | Descrição |
|---|------|------|-----------|
| T-00 | Home da University | `/university-gravity` | Entrada: destaques, "continuar de onde parou", 3 áreas |
| T-01 | Catálogo de Trilhas | `/university-gravity/academy` | Lista/busca de trilhas (plataforma + por produto) |
| T-02 | Detalhe da Trilha | `/university-gravity/academy/trilhas/:id_trilha` | Módulos, progresso, botão "Iniciar jornada" (cria a matrícula) |
| T-03 | Player de Aula | `/university-gravity/academy/aulas/:id_aula` | Vídeo/PDF/texto + GABI lateral + marcar conclusão |
| T-04 | Avaliação | `/university-gravity/academy/avaliacoes/:id_avaliacao` | Quiz com nota mínima |
| T-05 | Resultado da Avaliação | `/university-gravity/academy/avaliacoes/:id_avaliacao/resultado` | Nota, aprovado/reprovado, refazer |
| T-06 | Meu Certificado | `/university-gravity/academy/certificados/:id_certificado` | Visualizar/baixar PDF + código |
| T-07 | Minha Jornada | `/university-gravity/minha-jornada` | Trilhas em andamento, concluídas, certificados, pontos/badges |
| T-08 | Docs | `/university-gravity/docs` | (Fase 2) KB navegável + busca |
| T-09 | Builders | `/university-gravity/builders` | (Fase 2) Direcionamento ao API Cockpit |

---

## 11. Integrações com o Ecossistema Gravity

| Integração | Tipo | Alvo | Descrição |
|-----------|------|------|-----------|
| **GABI** | Fonte + tutor | `servicos-plataforma/gabi` | Conteúdo único na KB; chat de dúvida; jornada proativa; curadoria |
| API Cockpit | Direcionamento | `servicos-plataforma/api-cockpit` | Área Builders aponta para tokens/playground/webhooks |
| Configurador | Sessão + contexto | `servicos-global/configurador` | Sessão existente, produtos ativos, dados do usuário (`/me`) |
| Produtos (Pedido, Processo, ...) | Referência | `produto/*` | Trilhas por produto; (Fase 3) recomendação por uso real |
| Notificações | Alertas | organização | Lembretes de jornada (Fase 3) |
| Histórico | Auditoria | organização | Log de emissão de certificado e ações sensíveis |
| Dashboard | KPIs | organização | (Fase 2) relatórios de progresso |

---

## 12. Gamificação

| Elemento | MVP | Observação |
|---|---|---|
| **Pontos** | ✅ | Por aula/módulo concluído |
| **Badges/Conquistas** | Fase 1 (Should) | Por trilha concluída |
| **Certificado** | ✅ | Entregável principal (Seção 13) |
| **Ranking/Leaderboard** | Fase 2 | Cuidado: contextualizar por público/grupo para competição justa |
| **Loja de prêmios** | Fase 3 (opcional) | Resgate de pontos; só após validar o motor base |

**Princípio:** pontos + badges + certificado já entregam a maior parte do engajamento. Loja de prêmios é incremento posterior, não bloqueia o MVP.

---

## 13. Certificado

- **Gatilho:** concluir todas as aulas da trilha **e** ser aprovado na avaliação (nota >= `nota_minima_aprovacao_trilha`).
- **Conteúdo:** nome do aluno, nome da trilha, nota final, carga horária, data de emissão, **código de validação público**.
- **Formato:** PDF gerado a partir do registro `Certificado` (template sem extensão no nome — REGRA 12 DDD).
- **Imutabilidade:** dados congelados na emissão (snapshot). Se a trilha mudar depois, o certificado já emitido não muda.
- **Emissão automática:** assim que aprova, o certificado é gerado e guardado sozinho (sem ação do usuário).
- **Validação (Fase 2):** página pública por `codigo_validacao_certificado`.
- **Um certificado por trilha/produto** (decisão de escopo: onboarding por produto).

---

## 14. Métricas de Sucesso (propostas)

| KPI | Meta | Como medir |
|-----|------|-----------|
| Time-to-first-value de novo usuário | Reduzir vs. baseline | Tempo do 1º login → 1ª trilha concluída |
| Taxa de conclusão de onboarding por produto | > 60% dos matriculados | Matrículas concluídas / total |
| Certificados emitidos / mês | Crescimento MoM | Count `Certificado` |
| Cobertura de conteúdo na KB | 100% do conteúdo da University indexado na GABI | Chunks da University / total publicado |
| Uso da GABI dentro da University | — | Perguntas feitas no contexto de aula |

---

## 15. Cronograma e Ondas

| Fase | Escopo | Dependência |
|------|--------|-------------|
| **MVP (Fase 1)** | Academy de **1 produto** (ex: Pedido) ponta a ponta: trilha → vídeo/PDF/texto → quiz → certificado + GABI dúvida + pontos | Decisão de modelagem aprovada (Coordenador) |
| **Fase 2** | Docs (KB navegável), conteúdo único integrado à GABI, Builders, jornada proativa, validação de certificado, ranking, relatórios | MVP validado |
| **Fase 3** | Curadoria assistida por GABI, recomendação por uso, loja de prêmios, certificação formal, notificações | Fase 2 validada |

> Recomendação de produto: **validar o motor com 1 produto antes de escalar** para todos os produtos e os 4 públicos.

---

## 16. Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|----------|
| Acoplar conteúdo da University à KB da GABI mal modelado | Média | Alto | Coordenador define se University é *source* da ingestão ou publica para a KB (Seção 18) |
| Misturar registro do aluno (dado pessoal) na KB | Baixa | Alto | Separação dura: conhecimento → KB; registro → domínio University (Seção 3) |
| Escopo inflar (4 públicos + todos os produtos de uma vez) | Alta | Alto | MVP de 1 produto, 1 fluxo; escalar depois |
| Duplicação de doc técnica com API Cockpit | Média | Médio | Builders **aponta**, não duplica |
| Ranking gerar competição injusta entre públicos | Média | Médio | Contextualizar ranking por grupo |
| Certificado tratado como conteúdo mutável | Baixa | Médio | Snapshot imutável na emissão |

---

## 17. Decisões Tomadas

| # | Decisão | Data | Contexto |
|---|---------|------|----------|
| D-001 | Hub único "Gravity University" com 3 áreas (Academy/Docs/Builders) | 26/06/2026 | Onboarding, docs e portal dev têm lógicas de consumo distintas, mesma porta de entrada |
| D-002 | GABI é a fonte do conhecimento e está onipresente (fonte + dúvida + jornada) | 26/06/2026 | A GABI já consolida o conhecimento da plataforma (RAG sobre documentação Markdown — não lê código) |
| D-003 | Sem segmentação de conteúdo por tipo de usuário | 26/06/2026 | "Não importa o tipo de usuário, é um conteúdo só" (dono). Simplifica modelagem (sem etiqueta de audiência) |
| D-004 | Conteúdo único consolidado na GABI (Opção A), não dois repositórios sincronizados | 26/06/2026 | Fonte única da verdade; evita doc desatualizada entre Docs e GABI |
| D-005 | Distinção conhecimento (→ KB GABI) vs. registro do aluno (→ domínio University, fora da KB) | 26/06/2026 | Evitar poluir a busca da GABI com dado pessoal; certificado é imutável |
| D-006 | Onboarding por produto; um certificado por produto | 26/06/2026 | Escolha do dono |
| D-007 | Certificado exige avaliação com nota mínima | 26/06/2026 | Escolha do dono (credibilidade) |
| D-008 | Builders aponta para o API Cockpit, sem duplicar doc técnica | 26/06/2026 | API Cockpit já é o lar da doc de integração |
| D-009 | MVP = Academy de 1 produto ponta a ponta antes de escalar | 26/06/2026 | Validar o motor antes dos 4 públicos / todos os produtos |
| D-010 | Slug canônico = `university-gravity` em tudo (pastas, rotas, navegação, skill, testes, docs) | 26/06/2026 | Decisão do dono. Marca em inglês — exceção autorizada ao princípio PT-BR do DDD, consistente com `smart-read`, `api-cockpit`, `bid-frete`. Entidades de domínio (Trilha, Aula...) seguem DDD PT-BR normalmente |
| D-011 | University é **serviço de plataforma** (`servicos-plataforma/`), não produto vendável | 26/06/2026 | Decisão do dono. Capacidade da plataforma como a GABI/API Cockpit. Implica: sem banco dedicado, sem marketplace, sem `criar-produto`; compõe no banco da organização; convenção de nome da GABI; conteúdo global sem `id_organizacao` (como `GabiKbChunk`), registro do aluno com `id_organizacao` |
| D-012 | Experiência sem atrito: sessão existente, rastreamento automático; **única ação = "Iniciar jornada"** | 27/06/2026 | Dono: "já está logado, não precisa fazer nada — já gravamos jornada, andamento, certificados". Acabou o botão "matricular"; o máximo é clicar "Iniciar jornada" e a partir daí tudo é gravado |

---

## 18. Pendências para o Coordenador (modelagem de banco)

> Estas decisões tocam `schema.prisma` / `fragment.prisma` e **não podem** ser tomadas por agente de produto.

1. **Onde mora o conteúdo da University vs. a KB da GABI?** Hoje o `compile.ts` só ingere arquivos `.md` de um subconjunto de `documentos-tecnicos/` e `skills/produtos-gravity/` (não lê código, não lê banco). O conteúdo da University é editável por humanos e vive em banco — logo, **o pipeline de ingestão atual não o alcança**. Duas opções a decidir:
   - (A) A University é uma nova *source* da ingestão: o conteúdo (em banco) é exportado/lido e indexado na KB (estende `compile.ts`/`ingest.ts` para ler do domínio University, não só `.md`).
   - (B) O conteúdo é gravado direto no `fragment.prisma` da GABI (`GabiKbChunk`) e a University lê de lá.
   - Recomendação do PRD: alinhar com D-004/D-005 — **conteúdo no domínio University + pipeline de ingestão para a KB**, sem duplicar a fonte da verdade. Exige estender a ingestão da GABI para fontes além de Markdown.
2. **Fragment Prisma da University** — validar os models do MODELO-DADOS, índices, enums e a convenção de nomes (prefixo de serviço para evitar colisão no banco compartilhado).
3. **Composição e navegação** — montar o backend no super-servidor de organização (porta `3001`) e registrar a entrada no Shell (não em `marketplace`). Confirmar porta de dev do frontend.
4. **Relação com produtos** — `produto_alvo_trilha` referencia o catálogo do Configurador (FK lógica entre serviços via REST, não FK física cross-banco).

---

## 19. Estrutura de Código

> Slug canônico `university-gravity` (D-010). **Serviço de plataforma** — vive em `servicos-global/servicos-plataforma/<slug>/`, espelhando o padrão da GABI (`prisma/` + `server/` + `src/`). **Não** segue o layout `client/server` de produto.

### Serviço de plataforma

```
servicos-global/servicos-plataforma/university-gravity/
├── prisma/
│   └── fragment.prisma            ← models da University (ÚNICO editável)
│                                     compõe no banco da organização via
│                                     compose-tenant-schema.ts (Coordenador)
│
├── server/
│   ├── routes/                    ← /api/v1/university-gravity/...
│   ├── services/                  ← matrícula, certificado, pontuação, progresso
│   ├── middleware/                ← requireInternalKey, tenantIsolation
│   ├── lib/                       ← motores puros (cálculo de progresso, nota)
│   ├── queue/                     ← workers (ex: emissão/expiração) — se preciso
│   └── scripts/
│
└── src/                           ← frontend (módulo/rota no Shell)
    ├── Home.tsx                   ← T-00
    ├── pages/
    │   ├── CatalogoTrilhas/       ← T-01
    │   ├── DetalheTrilha/         ← T-02
    │   ├── PlayerAula/            ← T-03
    │   ├── Avaliacao/             ← T-04 / T-05
    │   ├── Certificado/           ← T-06
    │   └── MinhaJornada/          ← T-07
    ├── components/                ← componentes locais
    └── shared/
        ├── api.ts                 ← REST + Zod (Mandamentos 06/09)
        └── types.ts              ← tipos do domínio (espelham enums Prisma)
```

> O backend **não** tem `index.ts` próprio com 11 middlewares como produto: ele é montado pelo super-servidor de organização (`servicos-global/servicos-plataforma/server/`, porta 3001), que já provê os middlewares compartilhados — igual à GABI e aos demais serviços de plataforma.

### Fora do diretório do serviço (parte da entrega)

| Artefato | Caminho |
|---|---|
| Documentação (este PRD + MODELO-DADOS) | `documentos-tecnicos/produtos-gravity/university-gravity/` |
| Skill | `skills/produtos-gravity/university-gravity/SKILL.md` |
| Testes unitários | `testes/testes-unitarios/university-gravity/` |
| Testes funcionais | `testes/testes-funcionais/university-gravity/` |
| Testes cross-organização | `testes/testes-cross-organizacao/university-gravity/` |
| Testes E2E | `testes/testes-e2e/university-gravity/` |
| Registro/navegação | composição no super-servidor de organização + entrada no Shell (não `marketplace`, pois não é produto vendável) |

### Onde a University NÃO coloca código

A integração com a GABI **não** põe código em `university-gravity/`. A GABI permanece em `servicos-global/servicos-plataforma/gabi/`. A University a consome via REST/composição (padrão já usado, ex: `gabi-pedido.ts` no Pedido). A ingestão de conteúdo na KB (Fase 2) é trabalho **no diretório da GABI**, executado pelo Coordenador.

---

## 20. Próximos Passos

1. Aprovação do dono deste PRD.
2. Revisão do Coordenador (Seção 18 — modelagem e composição de schema).
3. SPECS de telas do MVP (T-00 a T-07) seguindo o padrão UX oficial.
4. Scaffold do serviço de plataforma (padrão GABI/`servicos-plataforma`) — não `criar-produto`.
5. Plano de testes (5 tipos) e QA antes do handoff.

---

> Documento gerado como especificação inicial. Sujeito a refinamento com Coordenador, Dream Team de Produtos e dono.
