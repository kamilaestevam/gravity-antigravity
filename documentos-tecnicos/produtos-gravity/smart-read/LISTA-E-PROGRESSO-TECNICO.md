# Lista e progresso do wizard — Smart Read

> **Telas:** `ListaLeituraSmartRead`, wizard `ModalNovaLeituraSmartRead`  
> **BFF:** `servicos-global/produto/smart-read/server/` (porta **8033**)

---

## 1. Lista real (sem mock no client)

A lista **não** usa mais `dados-mock-lista-smart-read.ts` nem `VITE_SMART_READ_MOCK_DADOS`. Toda linha vem do BFF:

| Camada | Arquivo |
|--------|---------|
| Hook | `client/src/shared/use-transacoes-leitura-smart-read.ts` |
| HTTP | `client/src/shared/api.ts` → `listarTransacoes`, `obterMetricaLeitura` |
| Montagem | `server/src/lib/montar-lista-transacoes-leitura-smart-read.ts` |

### Fontes da lista (merge)

1. **Primária:** legado dati `GET /import-control-center/external-readings/list` (via `cliente-legado-smart-read.ts`).
2. **Complemento:** Postgres `progresso_leitura_smart_read` — leituras com progresso salvo (passo ≥ 2) quando o legado falha ou ainda não indexou.

Se o legado retorna erro **e** não há progresso do usuário → lista vazia (`200`, `transacoes: []`). Não há fallback mock.

---

## 2. Contrato BFF — rotas de leitura

Headers obrigatórios (proxy Configurador / shell): `x-id-organizacao`, `x-id-usuario`; opcional `x-id-workspace`.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/v1/smart-read/leituras` | Lista paginada (`pagina`, `limite`, `termo_busca`) |
| `GET` | `/api/v1/smart-read/leituras/metricas/readings` | Contagem para card «Leituras realizadas» |
| `POST` | `/api/v1/smart-read/leituras` | Cria leitura no legado + upload (`multipart` campo `arquivo`) → `202` |
| `GET` | `/api/v1/smart-read/leituras/:id_leitura` | Status/resultado normalizado (polling) |
| `GET` | `/api/v1/smart-read/leituras/:id_leitura/progresso` | Progresso do wizard (`404` se ausente) |
| `PATCH` | `/api/v1/smart-read/leituras/:id_leitura/progresso` | Salva passo 2–4 + sessão |
| `DELETE` | `/api/v1/smart-read/leituras/:id_leitura` | `501` — legado sem exclusão |

**Schemas Zod (bilateral — REGRA 07/09):**

- Server: `server/src/schemas/leitura-smart-read.ts`, `server/src/schemas/progresso-leitura-smart-read.ts`
- Client: `client/src/shared/schemas.ts`

### `TransacaoLeitura` (linha da lista)

```typescript
{
  id_leitura: string
  nome_leitura: string | null   // SSOT: sessao.nome do progresso quando via Postgres
  status_leitura: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  total_arquivos: number
  media_acertos: number | null
  data_envio: string | null
  origem_leitura: 'API' | 'INTERFACE'
  nome_arquivo: string | null
  mensagem_erro: string | null
}
```

### `EstadoProgressoLeitura` (PATCH/GET progresso)

```typescript
{
  passo: 2 | 3 | 4
  nome: string                    // nome editado no wizard (AAA, BBB, …)
  leitura: Leitura                // deve incluir nome_leitura = nome ao salvar
}
```

---

## 3. Nome da leitura (SSOT)

| Campo | Origem |
|-------|--------|
| `nome` (sessão) | Input do usuário no wizard — **prioridade na lista e ao retomar** |
| `leitura.nome_leitura` | Legado dati (`name`) ou espelho gravado no PATCH |
| Lista via progresso | `montar-lista` usa `sessao.nome \|\| sessao.leitura.nome_leitura` |
| Retomar wizard | `salvo.nome` antes de `leitura.nome_leitura` |

O legado costuma devolver nomes genéricos (`Leitura 01`). O nome escolhido no wizard **não** propaga ao legado — persiste só no Gravity.

### Edição do nome no wizard (UX)

| Regra | Implementação |
|-------|----------------|
| Padrão Gravity | `EdicaoTextoPopoverGlobal` (`@nucleo/tabela-virtual-global`) — **não** usar `window.prompt` |
| Componente | `client/src/components/nova-leitura-smart-read/edicao-nome-leitura-nova-leitura-smart-read.tsx` |
| Sidebar | `painel-lateral-arquivos-nova-leitura-smart-read.tsx` |
| Disponibilidade | Editável em **qualquer passo** (1–4) |
| Persistência | Passo ≥ 2 com análise concluída → `PATCH` imediato via `onConfirmarNome` no modal |

**Removido (legado dati):** rótulos «Starter» e contador «Documentos X/100» no topo da sidebar — planos comerciais não existem mais no Gravity.

---

## 4. Quando o progresso grava

| Evento | Persiste? |
|--------|-----------|
| Upload (passo 1) | Não |
| Análise concluída (passo 2) | Sim — `PATCH` automático |
| Continuar / Voltar passo | Sim |
| Renomear (qualquer passo) | Sim no estado local; `PATCH` imediato se passo ≥ 2 e análise concluída |
| Fechar modal | Sim + **recarrega lista** (`onFechar` → `onRecarregar`) |

**Primário:** `PATCH` → tabela `progresso_leitura_smart_read` (Railway, `SMART_READ_DATABASE_URL`).  
**Fallback:** `localStorage` chave `smart-read:leitura:{id}` se API indisponível.

Arquivos: `client/src/shared/persistencia-leitura-smart-read.ts`, `server/src/routes/progresso-leitura-smart-read.ts`.

---

## 5. Link «Nome da leitura» → retomar wizard (TASK-000308)

Coluna `nome_leitura` em `colunas-lista-leitura-smart-read.tsx` abre `ModalNovaLeituraSmartRead` com `idLeituraExistente`. O modal hidrata passo + nome via `GET /progresso` (ou legado + progresso).

---

## 6. Ambiente local

| Variável (`.env.local` raiz) | Uso |
|------------------------------|-----|
| `SMART_READ_DATABASE_URL` | Postgres progresso |
| `SMART_READ_LEGADO_URL` | API dati QA |
| `SMART_READ_LEGADO_CHAVE_GRAVITY` | Auth legado |
| `SMART_READ_ID_COMPANY_LEGADO_PADRAO` | Company id padrão |

Teste: `http://localhost:8000/smart-read/lista` (Configurador) + sidecar `8033`.

**Não usar:** `VITE_SMART_READ_MOCK_DADOS`, `SMART_READ_MOCK_LEGADO=1` (exceto dev sem legado).

---

## 7. Limitações conhecidas

- Legado `GET /list` em QA pode retornar `500` — lista depende do complemento Postgres.
- `DELETE` leitura não implementado no legado.
- `data_envio` na lista via progresso usa `data_criacao` do registro (não `data_atualizacao`).

---

## 8. Testes

| Arquivo | Cobertura |
|---------|-----------|
| `testes/testes-unitarios/smart-read/progresso-leitura-smart-read.test.ts` | Schema sessão progresso |
| `testes/testes-unitarios/smart-read/fixtures/leituras-fixture-insights-smart-read.ts` | Fixture Insights (não runtime) |

Pacote `/testes-criar` completo (FUN PATCH→GET nome, E2E link→retomar) — pendente no fechamento TASK-000308.

---

## 9. Layout da lista (paridade Pedido — TASK-000311 / PR #394)

A área da tabela **preenche o viewport** abaixo dos cards e abas de segmento (padrão `.lp-page` do Pedido, não altura fixa em px).

| Camada | Arquivo / classe |
|--------|------------------|
| Painel keep-alive | `SmartReadVisualizacaoTabs.css` → `.smart-read-view-panel--ativo` + filho `.sr-pagina--lista` com `flex: 1` |
| Página lista | `ListaLeituraSmartRead.tsx` → `.sr-pagina--lista` |
| Wrapper tabela | `.sr-tabela-wrapper` (`flex: 1; min-height: 0`) |
| GTV | `.gtv-container` + `.gtv-tabela-scroll` (`flex: 1 1 0`) |

**Referência visual:** mesma altura total que Pedido (`/pedido/pedidos/lista`) — tabela + toolbar + rodapé dentro do bloco, scroll interno nas linhas.

---

## 10. Contagem e paginação (rodapé GTV)

Componente: `TabelaVirtualGlobal` em `tabela-transacoes-leitura-smart-read.tsx`.

| Prop | Valor |
|------|-------|
| `labelPai` | `['leitura', 'leituras']` |
| `labelFilho` | `['arquivo', 'arquivos']` |
| `totalFilhos` | Soma de `total_arquivos` das leituras visíveis (página ou filtradas) |
| `totalItens` | Total do BFF (`paginacao.total`) ou contagem pós-filtro client-side |
| `itensPorPagina` | `50` |
| `paginaAtual` / `onMudarPagina` | Server-side via `useTransacoesLeituraSmartRead` |

Rodapé exibido mesmo com uma página quando `labelPai` + `totalFilhos` estão definidos (ex.: `6 leituras · 6 arquivos · página 1 de 1`). Controles `« ‹ 1 2 3 › »` aparecem quando `totalPaginas > 1`.

---

## 11. Painéis da lista + colunas/filtros/export (PR #394)

### Painéis salvos (Postgres)

Mesmo padrão de [PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md): uma linha por aba em `lista_painel_usuario_global`, `config_json` v1 com colunas, filtros, ordenação, busca e `cards_topo`.

| Método | Rota |
|--------|------|
| `GET` | `/api/v1/smart-read/lista/paineis` — bootstrap «Principal» se vazio |
| `POST` | `/api/v1/smart-read/lista/paineis` |
| `PUT` | `/api/v1/smart-read/lista/paineis/:id` |
| `PUT` | `/api/v1/smart-read/lista/paineis/reordenar` |
| `DELETE` | `/api/v1/smart-read/lista/paineis/:id` |

| Camada | Arquivo |
|--------|---------|
| Rotas | `server/src/routes/lista-paineis-smart-read.ts` |
| Hook | `client/src/shared/use-lista-painel-smart-read.ts` |
| Persistência debounce | `shared/persistenciaListaPainel.ts` (`podePersistirPainelLista`) |
| Config Zod | `shared/listaPainelConfigSchema.ts` |

> **UI da faixa de abas roxas (Painéis):** hook e API prontos; wiring visual da barra (`*ListaPainelBar` + `*ListaFaixaNavegacao`) segue paridade Pedido/BID — ver TASK-000311 pendente de fechamento visual se ainda não estiver na branch de produção.

### Colunas, filtros e exportação

| Recurso | Arquivo principal |
|---------|-------------------|
| Catálogo de colunas (documento extraído) | `shared/catalogo-colunas-documento-smart-read.ts` |
| Colunas GTV | `shared/colunas-lista-leitura-smart-read.tsx` |
| Filtros por coluna | `shared/filtrar-transacoes-lista-smart-read.ts` + `FiltroPopoverColuna` |
| Exportação | `shared/acoes-exportacao-lista-smart-read.tsx` |
| Preferências → painel | `onSalvarPreferencias` → `useListaPainelSmartRead.persistirPainelAtual` |

### Testes adicionais (PR #394)

| Arquivo | Cobertura |
|---------|-----------|
| `testes/testes-unitarios/smart-read/extrair-valores-colunas-documento.test.ts` | Extração de valores para colunas dinâmicas |
| `testes/testes-unitarios/smart-read/agregar-caminhos-campos-dados.test.ts` | Agregação de caminhos no BFF |
