# Modelo de Dados — Gravity University (`university-gravity`)

> **Status:** Proposta para o Coordenador (Mandamento 02 — `schema.prisma` é INTOCÁVEL; só o Coordenador compõe via `compose-tenant-schema.ts`).
> **Natureza:** Serviço de plataforma (não produto). Padrão de referência: `servicos-global/servicos-plataforma/gabi/prisma/fragment.prisma`.
> **Companion:** [PRD.md](PRD.md) Seção 6.

---

## 1. Banco

- **Sem banco dedicado.** A University é **serviço de plataforma** (como a GABI) → suas tabelas **compõem no banco compartilhado por organização** (schema `tenant_<cuid>`) via `compose-tenant-schema.ts` (executado pelo Coordenador). Confirmado no padrão da GABI (`servicos-global/servicos-plataforma/gabi/prisma/fragment.prisma`).
- **Registro do aluno** (dados por organização): isolado por linha via `id_organizacao` (sufixado) + resolver.
- **Conteúdo global** (trilha/aula/quiz, autorado pela Gravity): segue o padrão `GabiKbChunk` — **sem `id_organizacao`** (ver Q-2).
- Acesso **sempre** via `withTenant`/`withOrganizacaoContext` — `PrismaClient` direto é proibido (lint tenant-safety).

### Convenção de nome (padrão serviço de plataforma — GABI)

Diferente de produto. Toda coluna leva o **sufixo completo da entidade** e o model é prefixado pelo serviço:

- Model: PascalCase `Trilha` → `@@map("trilha")`. (Coordenador decide se prefixa para evitar colisão no banco compartilhado — ex: `university_trilha`; abaixo uso a forma simples e marco a colisão como Q-4.)
- Colunas: `id_organizacao_<entidade>`, `id_usuario_<entidade>`, `data_criacao_<entidade>` etc. — como `id_organizacao_gabi_conversa`.
- Índices com `map:` curto (ex: `map: "trl_org_idx"`).

> ⚠️ As tabelas das Seções 4–6 usam a forma **simplificada** (`id_organizacao`, `nome_trilha`) para leitura. Na composição final, o Coordenador aplica o sufixo completo por entidade conforme a convenção da GABI.

---

## 2. Decisões abertas para o Coordenador

| # | Questão | Recomendação / Achado |
|---|---------|------------------------|
| Q-1 | `id_organizacao` nos models de dados por organização? | **Sim** — serviço de plataforma usa `id_organizacao` (GABI confirma). A divergência da skill `criar-produto` ("sem id_organizacao") vale para o pivô de **produto**, não para serviço de plataforma. |
| Q-2 | Conteúdo (Trilha/Módulo/Aula/Quiz) é **global** ou **por organização**? | **Global, sem `id_organizacao`** — precedente real: `GabiKbChunk` é global. Conteúdo autorado pela Gravity é igual para todos. Coordenador define o lugar físico (schema global vs. duplicação por tenant). |
| Q-3 | Conteúdo da University → KB da GABI: pipeline de ingestão. | Fase 2. Estende `compile.ts`/`ingest.ts` p/ ler do domínio University (banco), não só `.md`. Não bloqueia MVP. |
| Q-4 | Nomes de tabela colidem no banco compartilhado? (`trilha`, `modulo`, `aula` são genéricos) | Coordenador decide prefixo de serviço (ex: `university_trilha`) para garantir unicidade no schema `tenant_<cuid>`, como a GABI faz com `gabi_*`. |

---

## 3. Enums (proposta)

> REGRA 7 DDD: nome PascalCase PT-BR; valores `UPPER_SNAKE` em inglês (salvo exceção aprovada pelo dono).

```prisma
enum TipoTrilha {
  PLATFORM      // i18n: "Plataforma"
  PRODUCT       // i18n: "Produto"
}

enum TipoAula {
  VIDEO         // i18n: "Vídeo"
  DOCUMENT      // i18n: "Documento/Manual"
  TEXT          // i18n: "Texto"
}

enum TipoQuestao {
  MULTIPLE_CHOICE   // i18n: "Múltipla escolha"
  TRUE_FALSE        // i18n: "Verdadeiro/Falso"
}

enum StatusMatricula {
  IN_PROGRESS   // i18n: "Em andamento"
  COMPLETED     // i18n: "Concluída"
  EXPIRED       // i18n: "Expirada"
}
```

---

## 4. Tabelas — Conteúdo (conhecimento)

> **Global, sem `id_organizacao`** (decisão Q-2, precedente `GabiKbChunk`). As linhas `id_organizacao` e os índices `@@index([id_organizacao, ...])` mostrados abaixo **devem ser removidos** na forma final — ficaram como herança da versão "produto" e estão marcados para o Coordenador. O isolamento de conteúdo é desnecessário porque o conteúdo é o mesmo para todas as organizações.

### 4.1 `trilha` — Trilha de aprendizado

| Coluna | Tipo | Notas |
|---|---|---|
| `id_trilha` | String @id @default(cuid()) | PK |
| `nome_trilha` | String | label UI |
| `descricao_trilha` | String? | |
| `tipo_trilha` | TipoTrilha | PLATFORM \| PRODUCT |
| `produto_alvo_trilha` | String? | slug do produto que a trilha ensina (ex: "pedido"); null se PLATFORM |
| `ordem_trilha` | Int @default(0) | ordenação no catálogo |
| `nota_minima_aprovacao_trilha` | Float @default(70) | % para aprovar |
| `carga_horaria_trilha` | Int @default(0) | minutos (para o certificado) |
| `publicada_trilha` | Boolean @default(false) | só publicadas aparecem |
| `data_criacao_trilha` | DateTime @default(now()) | |
| `data_atualizacao_trilha` | DateTime @updatedAt | |

Índices: `@@index([produto_alvo_trilha])` · `@@map("trilha")`

### 4.2 `modulo` — Módulo (agrupa aulas)

| Coluna | Tipo | Notas |
|---|---|---|
| `id_modulo` | String @id @default(cuid()) | PK |
| `id_trilha` | String | FK → trilha (REGRA 4) |
| `nome_modulo` | String | |
| `descricao_modulo` | String? | |
| `ordem_modulo` | Int @default(0) | |
| `data_criacao_modulo` | DateTime @default(now()) | |
| `data_atualizacao_modulo` | DateTime @updatedAt | |

Índices: `@@index([id_trilha])` · `@@map("modulo")`

### 4.3 `aula` — Aula (unidade de conteúdo)

| Coluna | Tipo | Notas |
|---|---|---|
| `id_aula` | String @id @default(cuid()) | PK |
| `id_modulo` | String | FK → modulo |
| `titulo_aula` | String | |
| `tipo_aula` | TipoAula | VIDEO \| DOCUMENT \| TEXT |
| `conteudo_aula` | String @db.Text | URL do vídeo / caminho do PDF / corpo do texto (conforme tipo) |
| `duracao_aula` | Int @default(0) | minutos (para carga horária) |
| `ordem_aula` | Int @default(0) | |
| `data_criacao_aula` | DateTime @default(now()) | |
| `data_atualizacao_aula` | DateTime @updatedAt | |

Índices: `@@index([id_modulo])` · `@@map("aula")`

### 4.4 `avaliacao` — Avaliação (quiz da trilha)

| Coluna | Tipo | Notas |
|---|---|---|
| `id_avaliacao` | String @id @default(cuid()) | PK |
| `id_trilha` | String | FK → trilha (avaliação final da trilha) |
| `titulo_avaliacao` | String | |
| `nota_minima_avaliacao` | Float @default(70) | % para aprovar |
| `data_criacao_avaliacao` | DateTime @default(now()) | |
| `data_atualizacao_avaliacao` | DateTime @updatedAt | |

Índices: `@@index([id_trilha])` · `@@map("avaliacao")`

### 4.5 `questao` — Questão

| Coluna | Tipo | Notas |
|---|---|---|
| `id_questao` | String @id @default(cuid()) | PK |
| `id_avaliacao` | String | FK → avaliacao |
| `enunciado_questao` | String @db.Text | |
| `tipo_questao` | TipoQuestao | |
| `ordem_questao` | Int @default(0) | |
| `data_criacao_questao` | DateTime @default(now()) | |
| `data_atualizacao_questao` | DateTime @updatedAt | |

Índices: `@@index([id_avaliacao])` · `@@map("questao")`

### 4.6 `alternativa` — Alternativa de resposta

| Coluna | Tipo | Notas |
|---|---|---|
| `id_alternativa` | String @id @default(cuid()) | PK |
| `id_questao` | String | FK → questao |
| `texto_alternativa` | String | |
| `correta_alternativa` | Boolean @default(false) | REGRA 5 (boolean sem `is_`) |
| `ordem_alternativa` | Int @default(0) | |
| `data_criacao_alternativa` | DateTime @default(now()) | |

Índices: `@@index([id_questao])` · `@@map("alternativa")`

---

## 5. Tabelas — Registro do aluno (transacional, por organização, fora da KB)

### 5.1 `matricula_trilha` — Matrícula do usuário numa trilha (criada automaticamente)

| Coluna | Tipo | Notas |
|---|---|---|
| `id_matricula_trilha` | String @id @default(cuid()) | PK |
| `id_organizacao` | String | |
| `id_usuario` | String | aluno (da sessão) |
| `id_workspace` | String? | contexto opcional |
| `id_trilha` | String | FK → trilha |
| `status_matricula` | StatusMatricula @default(IN_PROGRESS) | |
| `percentual_progresso_matricula_trilha` | Float @default(0) | 0–100 (cache p/ lista) |
| `data_conclusao_matricula_trilha` | DateTime? | |
| `data_criacao_matricula_trilha` | DateTime @default(now()) | criada ao clicar "Iniciar jornada" |
| `data_atualizacao_matricula_trilha` | DateTime @updatedAt | |

Índices: `@@unique([id_organizacao, id_usuario, id_trilha])`, `@@index([id_organizacao])`, `@@index([id_organizacao, id_usuario])`, `@@index([id_organizacao, id_trilha])` · `@@map("matricula_trilha")`

### 5.2 `progresso_aula` — Conclusão de cada aula pelo usuário

| Coluna | Tipo | Notas |
|---|---|---|
| `id_progresso_aula` | String @id @default(cuid()) | PK |
| `id_organizacao` | String | |
| `id_usuario` | String | |
| `id_aula` | String | FK → aula |
| `id_trilha` | String | denormalizado p/ cálculo de % |
| `concluida_progresso_aula` | Boolean @default(false) | REGRA 5 |
| `data_conclusao_progresso_aula` | DateTime? | |
| `data_criacao_progresso_aula` | DateTime @default(now()) | |
| `data_atualizacao_progresso_aula` | DateTime @updatedAt | |

Índices: `@@unique([id_organizacao, id_usuario, id_aula])`, `@@index([id_organizacao])`, `@@index([id_organizacao, id_usuario])`, `@@index([id_organizacao, id_usuario, id_trilha])` · `@@map("progresso_aula")`

### 5.3 `tentativa_avaliacao` — Cada tentativa de quiz (append-only)

| Coluna | Tipo | Notas |
|---|---|---|
| `id_tentativa_avaliacao` | String @id @default(cuid()) | PK |
| `id_organizacao` | String | |
| `id_usuario` | String | |
| `id_avaliacao` | String | FK → avaliacao |
| `id_trilha` | String | denormalizado |
| `nota_obtida_tentativa_avaliacao` | Float | % obtido |
| `aprovado_tentativa_avaliacao` | Boolean | REGRA 5 |
| `respostas_tentativa_avaliacao` | Json | snapshot das respostas |
| `data_criacao_tentativa_avaliacao` | DateTime @default(now()) | imutável (sem `updatedAt`) |

Índices: `@@index([id_organizacao])`, `@@index([id_organizacao, id_usuario])`, `@@index([id_organizacao, id_usuario, id_avaliacao])` · `@@map("tentativa_avaliacao")`

### 5.4 `certificado` — Certificado emitido (snapshot imutável)

| Coluna | Tipo | Notas |
|---|---|---|
| `id_certificado` | String @id @default(cuid()) | PK |
| `id_organizacao` | String | |
| `id_usuario` | String | |
| `id_trilha` | String | FK → trilha |
| `nome_usuario_certificado` | String | snapshot (congela no momento) |
| `nome_trilha_certificado` | String | snapshot |
| `nota_final_certificado` | Float | snapshot |
| `carga_horaria_certificado` | Int | snapshot (minutos/horas) |
| `codigo_validacao_certificado` | String @unique | código público de validação |
| `data_emissao_certificado` | DateTime @default(now()) | imutável (emissão automática) |

Índices: `@@unique([id_organizacao, id_usuario, id_trilha])`, `@@index([id_organizacao])`, `@@index([id_organizacao, id_usuario])`, `@@index([codigo_validacao_certificado])` · `@@map("certificado")`

---

## 6. Tabelas — Gamificação (por organização)

### 6.1 `pontuacao_usuario` — Saldo de pontos do usuário na University

| Coluna | Tipo | Notas |
|---|---|---|
| `id_pontuacao_usuario` | String @id @default(cuid()) | PK |
| `id_organizacao` | String | |
| `id_usuario` | String | |
| `total_pontos_pontuacao_usuario` | Int @default(0) | saldo acumulado |
| `data_criacao_pontuacao_usuario` | DateTime @default(now()) | |
| `data_atualizacao_pontuacao_usuario` | DateTime @updatedAt | |

Índices: `@@unique([id_organizacao, id_usuario])`, `@@index([id_organizacao])` · `@@map("pontuacao_usuario")`

> **Ranking** é calculado em runtime ordenando `pontuacao_usuario` — não é tabela (REGRA 11, campo derivado). Conquistas/badges (`conquista`, `conquista_usuario`) ficam para a Fase 1 (Should) / Fase 2; modelagem análoga.

---

## 7. Resumo

| # | Tabela (`@@map`) | Família | Escopo | MVP |
|---|---|---|---|---|
| 1 | `trilha` | Conteúdo | Global | ✅ |
| 2 | `modulo` | Conteúdo | Global | ✅ |
| 3 | `aula` | Conteúdo | Global | ✅ |
| 4 | `avaliacao` | Conteúdo | Global | ✅ |
| 5 | `questao` | Conteúdo | Global | ✅ |
| 6 | `alternativa` | Conteúdo | Global | ✅ |
| 7 | `matricula_trilha` | Registro | Por organização | ✅ |
| 8 | `progresso_aula` | Registro | Por organização | ✅ |
| 9 | `tentativa_avaliacao` | Registro | Por organização | ✅ |
| 10 | `certificado` | Registro | Por organização | ✅ |
| 11 | `pontuacao_usuario` | Gamificação | Por organização | ✅ |
| 12 | `conquista` / `conquista_usuario` | Gamificação | Global / Por organização | Fase 1 (Should) / 2 |

---

> Tudo nesta proposta é sujeito à validação do Coordenador (composição de schema, índices finais, decisões Q-1 a Q-4, prefixo de tabela). Nenhum agente de produto gera `schema.prisma`.
