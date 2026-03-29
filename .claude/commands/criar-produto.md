Você vai criar um **novo produto** no Gravity.

Antes de qualquer ação:
1. Leia `skills/infra-estrutura/criar-produto/SKILL.md` completamente
2. Leia `skills/governanca/agent-policy/SKILL.md`
3. Leia `skills/governanca/code-standards/SKILL.md`
4. Leia `skills/arquitetura/schema-composition/SKILL.md`
5. Leia `skills/infra-estrutura/service-registry/SKILL.md`
6. Leia `skills/arquitetura/tenant-isolation/SKILL.md`

Siga a arquitetura canônica:
- Estrutura dual: `/client` (Vite React SPA) + `/server` (Express Node.js)
- 11 middlewares na ordem obrigatória
- `PRODUCT_CONFIG` em `src/shared/config.ts`
- `fragment.prisma` para schema composition
- Health check obrigatório
- `.env.example` documentando todas as variáveis

Pergunte o nome do produto e as regras de negócio antes de começar.
