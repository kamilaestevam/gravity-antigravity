---
name: antigravity-9-mandamentos
description: "9 regras absolutas e não-negociáveis do Gravity. Ler antes de qualquer tarefa. Cada Mandamento existe porque já causou bug em produção. Violação = trabalho rejeitado pelo QA, sem exceção."
---

# 9 Mandamentos do Gravity

> **OBRIGATÓRIA — Ler antes de qualquer tarefa.**
> Estas regras existem porque cada uma delas já causou perda de tempo, retrabalho ou bug em produção.
> Violação = trabalho rejeitado pelo QA, sem exceção.

---

## REGRA 01 — ISOLAMENTO TOTAL DO CLERK (Autenticação ≠ Autorização)

O Clerk serve **apenas** para autenticação (login, senha, e-mail, `clerk_user_id`) e nada mais.

❌ **EXPRESSAMENTE PROIBIDO** ler ou gravar patentes/permissões no Clerk.
Nunca use `user.publicMetadata.role` no frontend ou backend.

✅ A **fonte da verdade** para permissões é o nosso Banco de Dados (Prisma).
O Frontend deve ler a patente do usuário a partir do nosso próprio backend (ex: consumindo o JSON da rota `/api/v1/me` através de um estado global).

**Por quê:** Clerk é provedor terceirizado. Manter autorização lá cria acoplamento, dificulta auditoria, viola o Isolamento de Organizacao e impede que o banco seja a fonte única de verdade.

**Exemplo 2026-05-12 — `status_usuario` desativa usuário SEM tocar Clerk:**
- `PATCH /api/v1/usuarios/:id/status` grava `Usuario.status_usuario = INATIVO` no Prisma.
- `requireAuth.ts` bloqueia o próximo request com 401 `USUARIO_INATIVO` (lendo direto do banco).
- `invalidarCacheRequireAuth(idClerkUsuario)` força releitura — kick-out efetivo em milissegundos.
- Zero chamada a `clerkClient.users.deleteSession()` ou similar — Clerk só faz authn.
- Lição: "desativar usuário" é AUTORIZAÇÃO (banco), não AUTENTICAÇÃO (Clerk).

---

## REGRA 02 — O `schema.prisma` É INTOCÁVEL

Você está PROIBIDO de alterar, adicionar ou remover qualquer linha do arquivo `schema.prisma`.

❌ **Jamais faça:** editar `schema.prisma` diretamente para "resolver" um erro de compilação ou adequar o banco ao código.

✅ **Sempre faça:** adeque o código TypeScript (Controllers, Services, React Components) à estrutura existente no Prisma, e não o contrário.
Se a estrutura do banco precisar mudar, **pare** e abra um chamado para o Coordenador — ele é o único autorizado a alterar o schema via script controlado.

**Por quê:** o schema representa decisões de arquitetura revisadas e validadas. Alterá-lo sem controle quebra migrations, gera drift de banco e pode corromper dados em produção.

---

## REGRA 03 — ADESÃO ESTRITA AO DDD (Dicionário de Dados)

Nós abandonamos nomenclaturas legadas (`Tenant`, `Company`, `Role`).
Você DEVE usar EXATAMENTE estes nomes nas propriedades de objetos, payloads JSON e variáveis:

| Conceito legado | Nomenclatura oficial |
|-----------------|----------------------|
| Tenant          | `id_organizacao`, `nome_organizacao`, `subdominio_organizacao` |
| Company         | `id_workspace`, `nome_workspace`, `subdominio_workspace` |
| User            | `id_usuario`, `nome_usuario`, `email_usuario` |
| Role (geral)    | `tipo_usuario` |
| Role (no workspace) | `tipo_usuario_workspace` |
| Admin Gravity   | `gravity_admin` (Boolean para controle absoluto — sem prefixo `is_`, ver skill `ddd-nomenclatura` REGRA 5) |

**Por quê:** consistência terminológica entre banco, backend, frontend e documentação. Mistura de nomenclatura é a principal causa de bugs silenciosos de contrato (vide Mandamento 06 e 09).

---

## REGRA 04 — LÓGICA DE VÍNCULO (O LIMBO)

Usuários **Master** (`gravity_admin = true`) ou **Super Admins** (`tipo_usuario = 'SUPER_ADMIN'`) **não podem** ficar presos em telas de "Nenhum workspace encontrado".

O código deve garantir que o **Frontend e o Backend** reconheçam o acesso global deles, **independentemente** de estarem vinculados fisicamente na tabela `UsuarioWorkspace`.

**Por quê:** admins Gravity supervisionam todos os workspaces da organizacao — não precisam de membership formal. Tratá-los como usuários comuns os bloqueia da própria ferramenta de administração.

---

## REGRA 05 — PROIBIDO MOCKS PREGUIÇOSOS E CASTING VAZIO (`{}` ou `""`)

É estritamente proibido contornar erros de TypeScript injetando objetos vazios, strings vazias ou fazendo type assertions falsas.

❌ **No Frontend (React):**
```ts
// NUNCA inicialize estados de entidades com objetos vazios
const [usuario, setUsuario] = useState<Usuario>({} as Usuario)
```

✅ **Sempre faça:**
```ts
// Estado nulo até o dado chegar — UI trata o carregamento
const [usuario, setUsuario] = useState<Usuario | null>(null)
if (!usuario) return <Loading />
```

❌ **No Backend (Prisma):**
```ts
// NUNCA envie strings vazias para satisfazer o compilador
await prisma.usuario.create({ data: { id_workspace: '' } })
```

✅ **Sempre faça:**
```ts
// Campo opcional sem valor → null ou undefined
await prisma.usuario.create({ data: { id_workspace: null } })
```

**Por quê:** dado falso passa pelo compilador mas explode em runtime, ou pior: salva lixo no banco. Se o dado precisa vir da API ou do banco, faça o fluxo correto de busca.

---

## REGRA 06 — VALIDAÇÃO DE CONTRATO DE API OBRIGATÓRIA (ZOD)

Nunca deserialize resposta de API sem validação de schema. O `fetch().json()` retorna `any`, cegando o TypeScript.

❌ **Jamais faça:**
```ts
const data = await fetch('/api/v1/me').then(r => r.json())
const role = data?.user?.role  // any implícito — TypeScript cego
```

✅ **Sempre faça:**
```ts
const raw = await fetch('/api/v1/me').then(r => r.json())
const data = meResponseSchema.parse(raw)  // falha se o contrato quebrou
const role = data.usuario.tipo_usuario    // campo garantido pelo Zod
```

**Por quê:** sem validação na borda, qualquer mudança no backend quebra o frontend silenciosamente — sem erro, sem log, com fallback enganoso.

**Padrão de ACL nas rotas backend:** quando o schema Prisma muda mas o frontend mantém contrato legado (transição DDD em andamento), a rota implementa duas funções de tradução no topo do arquivo:

- `mapPrismaParaZod(row)` — converte campos Prisma reais (`id_pedido`, `data_exclusao_pedido`) para o formato esperado pelo frontend (`id`, `deleted_at`).
- `mapZodParaPrisma(payload)` — caminho inverso na entrada.

Implementação de referência: `servicos-global/pedido/server/src/routes/anexos-pedido.ts`. **Nunca** vaze nome Prisma novo direto na resposta sem ACL — quebra o contrato com o frontend. Quando frontend e backend já estiverem 100% DDD, ACL pode ser removida.

---

## REGRA 07 — SINCRONIA DE CONTRATOS (FRONT E BACK JUNTOS)

Nunca renomeie um campo de resposta de API sem atualizar TODOS os consumidores na mesma entrega.

✅ **Sempre faça:**
1. Antes de renomear, rode busca global:
   ```bash
   grep -r "data\.user\|data?.user" --include="*.ts" --include="*.tsx"
   ```
2. Corrija todos os arquivos `.ts` e `.tsx` que leem o campo
3. Modifique back e front no **mesmo commit**

**Por quê:** contratos de API são implícitos. Quando o backend muda e o frontend não acompanha, o bug não gera erro — gera dado errado. Dado errado em autorização é o pior tipo de bug: parece funcionar.

---

## REGRA 08 — FIM DOS FALLBACKS SILENCIOSOS EM AUTORIZAÇÃO

Dados de autorização devem falhar fazendo barulho. Se o `tipo_usuario` não for encontrado, não mascare o erro com um valor padrão.

❌ **Jamais faça:**
```ts
const tipoUsuario = (data?.user?.role ?? null) as TipoUsuario
// null → fallback 'Standard' → usuário SUPER_ADMIN aparece como Standard
// Sem erro. Sem log. Bug invisível.
```

✅ **Sempre faça:**
```ts
// Opção A — falha ruidosa (preferível em autorização)
const tipoUsuario = meResponseSchema.parse(data).usuario.tipo_usuario

// Opção B — se precisar de fallback, deixe rastro obrigatório
const tipoUsuario = data?.usuario?.tipo_usuario ?? null
if (!tipoUsuario) console.warn('[useCarregarTipoUsuario] tipo_usuario ausente na resposta de /me', data)
```

> ⚠️ **NOTA DE ARQUITETURA:** O uso de `console.warn` acima é tolerado APENAS no Frontend (React) onde o logger estruturado pode não estar disponível. No Backend, o uso de `console.*` é PROIBIDO; deve-se usar sempre o `logger` (ver [Observabilidade](../../../arquitetura/observabilidade/SKILL.md)).

**Por quê:** nível de acesso errado não quebra a tela — exibe permissão falsa. A aplicação continua rodando e ninguém percebe. Autorização deve falhar alto ou deixar rastro, nunca engolir o problema em silêncio.

---

## REGRA 09 — SCHEMAS ZOD SÃO CONTRATOS BILATERAIS

O schema Zod do frontend deve ser mantido em sincronia com o payload de resposta do backend. Nunca use `z.any()` ou `.passthrough()` para "resolver" divergências entre os dois.

❌ **Jamais faça:**
```ts
// Backend mudou o campo mas o schema Zod não foi atualizado
const meResponseSchema = z.object({
  user: z.object({ role: z.string() })  // campo renomeado no backend, Zod desatualizado
})
// Resultado: parse passa, campo retorna undefined, bug silencioso
```

✅ **Sempre faça:**
- Sempre que uma rota mudar seu payload, atualize o schema Zod correspondente **no mesmo commit**
- Antes de renomear qualquer campo de resposta, busque globalmente pelo schema que o descreve:
  ```bash
  grep -r "z\.object\|ResponseSchema" --include="*.ts" --include="*.tsx"
  ```
- O schema Zod é o contrato — se o backend mudou e o Zod não mudou, **o commit está incompleto**

**Por quê:** o Zod só protege se estiver correto. Um schema desatualizado dá falsa sensação de segurança — o parse "passa" mas retorna campos errados ou `undefined`, exatamente o mesmo bug que aconteceria sem validação nenhuma.

**Caso real (2026-05-06) — PATCH parcial sem Zod de response:**
- Bug: `PATCH /admin/organizacoes/:id` retornava `{ organizacao: {...} }` mas o frontend consumia com `?? null` sem `.parse()`.
- 5 campos cadastrais novos (`cnpj`, `estado`, `cidade`, `segmento`, `tipo`) foram adicionados ao request, mas o schema Zod da response não existia. A UI usava só `nome` e `subdominio` (ok), ignorando silenciosamente os 5 novos.
- Quando o backend mudou nome de campo, nada quebrou — frontend virou `null` em silêncio e ainda exibia "salvo com sucesso".
- Lição: SEMPRE escrever o schema Zod da RESPONSE em paralelo ao do request. Sem `.parse()` da response, mudança de contrato vira bug invisível.

---

## Checklist Antes de Cada Entrega

- [ ] Não usei `publicMetadata` do Clerk para autorização (Regra 01)
- [ ] Não toquei em `schema.prisma` (Regra 02)
- [ ] Usei nomenclatura DDD em todo código novo (Regra 03)
- [ ] Admins Gravity têm acesso global garantido (Regra 04)
- [ ] Não usei `{}`, `""` ou `as Type` para mascarar tipos (Regra 05)
- [ ] Toda resposta de `fetch` passa por `schema.parse()` (Regra 06)
- [ ] Renomei campo? Busquei e atualizei todos os consumidores (Regra 07)
- [ ] Autorização falha alto, não silencia com fallback (Regra 08)
- [ ] Schema Zod do frontend reflete o payload do backend (Regra 09)
