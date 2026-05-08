# teste-carga-pedido

Seed de pedidos sintéticos para teste de carga do produto **Pedido** na organização **CDE**.

## Como rodar

A partir desta pasta:

```bash
npm run seed:10       # 10 pedidos
npm run seed:100      # 100 pedidos (zera execução anterior)
npm run seed:500      # 500 pedidos (zera execução anterior)
npm run seed:1000     # 1000 pedidos (zera execução anterior)
npm run seed:5000     # 5000 pedidos (zera execução anterior)
npm run seed:10000    # 10000 pedidos (zera execução anterior)
npm run cleanup       # apaga todos os pedidos CARGA-*
```

**Cada execução zera os CARGA-* anteriores antes de inserir.** Não acumula.

Ou direto da raiz do monorepo (sem precisar `cd`):

```bash
npx tsx servicos-global/produto/pedido/teste-carga-pedido/seed.ts --count=10
```

## Configuração fixa (hardcoded no seed.ts/cleanup.ts)

| | Valor |
|---|---|
| `id_organizacao` | `cmoarq22a000l1358c1p2qfqt` (CDE) |
| `id_workspace` | `cmosr1zc70001v2hfp3bxax4s` (CDE EXPORTADOR) |
| Schema PG | `public` (ver nota arquitetural abaixo) |
| Banco | Pedido (Railway `roundhouse:39426/railway`) |

**Para mudar o workspace ou organização:** edite as constantes no topo de `seed.ts` e `cleanup.ts`.

### ⚠️ Nota arquitetural — schema-per-tenant é fantasma

Descoberto em 2026-05-08: apesar do design "schema-per-tenant" (`tenant_<id_organizacao>`), o Prisma 5.22 **SEMPRE qualifica queries com `"public"."pedido"`**, ignorando `SET LOCAL search_path`. Por isso **TODOS os dados reais residem em `public.*`**. Os schemas `tenant_*` são fantasmas (nunca são lidos pelo Prisma client). Isolamento por organização é garantido pelo filtro `WHERE id_organizacao = ...` em cada query.

## O que cada execução faz

1. Conecta no banco do Pedido
2. `SET search_path TO tenant_<CDE>, public`
3. `BEGIN`
4. `DELETE FROM pedido WHERE numero_pedido LIKE 'CARGA-%'` (itens vão por cascade)
5. Gera N pedidos em memória (distribuição 30/40/30 entre tiers 100%/70%/50%)
6. Cada pedido tem 1-15 itens (distribuição triangular, média ~5)
7. INSERT em batches de 50 linhas
8. `COMMIT`
9. Imprime tempo total e amostra dos 5 primeiros

**Atomicidade:** se algo falhar, `ROLLBACK` e nada entra.

## Distribuição de tiers de preenchimento

| Tier | % do lote | Pedido | Item |
|---|---|---|---|
| **100%** | 30% | TODAS as 85 colunas | TODAS as 48 colunas |
| **70%** | 40% | ~60/85 colunas (núcleo + opcionais essenciais + medianos) | ~36/48 |
| **50%** | 30% | ~30/85 colunas (núcleo + essenciais) | ~25/48 |

**Definição precisa:** veja `shared/tiers.ts` (sets `PEDIDO_NUCLEO`, `PEDIDO_OPCIONAIS_ESSENCIAIS`, etc.).

## Distribuição de outros atributos

| Atributo | Distribuição |
|---|---|
| `status_pedido` | 25% draft, 25% aberto, 20% em_andamento, 15% aprovado, 8% transferencia, 5% consolidado, 2% cancelado |
| `tipo_operacao_pedido` | 70% importação, 30% exportação |
| `qtd_itens` por pedido | 1-15 (média 5, distribuição triangular) |
| `moeda_pedido` | 60% USD, 25% EUR, 10% CNY, 5% JPY |
| `incoterm_pedido` | FOB, CIF, EXW, CPT, FCA, CIP, CFR, FCA, DDP, DAP (uniform) |
| `data_emissao_pedido` | últimos 90 dias |

**FKs externas (sempre NULL — sem snapshots):**
- `id_status_pedido`
- `id_importacao_exportador_pedido`
- `id_exportacao_importador_pedido`
- `id_fabricante_pedido`
- `contrato_cambio_id_pedido` (NULL em tier 50/70; pode estar preenchido em tier 100 sem FK válida — só string)

## Estrutura

```
teste-carga-pedido/
├── README.md              ← este arquivo
├── package.json           ← aliases npm
├── seed.ts                ← entrada principal (--count=N)
├── cleanup.ts             ← remove CARGA-*
└── shared/
    ├── pools.ts          ← pools de dados realistas (NCMs, fornecedores, etc.)
    ├── tiers.ts          ← define quais colunas cada tier preenche
    └── gerador.ts        ← gera Pedido + Itens
```

## Checklist de validação após cada seed

Após `npm run seed:N`, dar **F5/Ctrl+Shift+R** no browser e validar:

### Após `seed:10`
- [ ] Lista mostra 10 linhas
- [ ] Card "Total de Pedidos" = 10
- [ ] Tabs Rascunho/Aberto/Em Andamento/Aprovado/Transferência/Consolidado/Cancelado funcionam (filtros)
- [ ] Buscar por `CARGA-2026-0005` retorna 1 pedido
- [ ] Click em um pedido tier 100% → todos os campos preenchidos no detalhe
- [ ] Click em um pedido tier 50% → vários campos vazios no detalhe

### Após `seed:100`
- [ ] Paginação aparece (se default = 20, deve ter 5 páginas)
- [ ] Filtro por status reduz contagem corretamente
- [ ] Kanban renderiza (lazy load das colunas)
- [ ] Dashboard agrega 100 pedidos (valor total, qtd total)
- [ ] Tempo de carga da Lista < 2 segundos

### Após `seed:500`
- [ ] Paginação aparece (25 páginas se limit=20)
- [ ] Filtro por status reduz contagem corretamente
- [ ] Tempo de carga da Lista < 3 segundos

### Após `seed:1000`
- [ ] Paginação ainda funciona (50 páginas se limit=20)
- [ ] Tempo de carga da Lista < 4 segundos
- [ ] Busca textual funciona em volume alto
- [ ] Kanban: qual o comportamento com colunas grandes? (300+ cards em "Aberto", por ex)
- [ ] Dashboard agrega corretamente
- [ ] Sem 500/timeouts no console

### Após `seed:5000`
- [ ] Lista carrega < 6 segundos (limit=100)
- [ ] Filtros combinados (status + tipo_operacao) ainda rápidos
- [ ] Kanban com lazy load funciona
- [ ] Dashboard agrega ~5k pedidos sem travar
- [ ] Memória do navegador estável (DevTools → Performance)

### Após `seed:10000`
- [ ] Carga aceitável (< 10 segundos)
- [ ] Indexes do banco efetivos (verificar `EXPLAIN ANALYZE` no Postgres)
- [ ] Kanban: provavelmente requer virtualização para colunas com 2k+ cards
- [ ] Dashboard: agregações em volume real — verificar tempo de cada KPI
- [ ] Sem timeouts em nenhum endpoint
- [ ] **Inserção:** ~2-5 minutos (50k+ rows)

## Limpando

```bash
npm run cleanup
```

Remove TODOS os pedidos com prefixo `CARGA-*` (e seus itens via cascade). Os pedidos reais da CDE NÃO são afetados.

## Re-executar é seguro

Cada `seed:N` zera os pedidos `CARGA-*` antes de inserir os novos. Você pode rodar `seed:10` → `seed:100` → `seed:1000` → `seed:10` na ordem que quiser.

## Limitações conhecidas

- Sem snapshots de empresa → colunas Exportador/Importador/Fabricante na UI ficam **vazias**
- Sem `id_status_pedido` (FK para `status_pedido` table) → status custom não é vinculado
- Datas em sequência rígida baseada em `data_emissao` (não tem aleatoriedade nas datas dentro de cada pedido)
- IDs gerados são pseudo-CUID (não passam pela mesma função do Prisma `@default(cuid())`)
