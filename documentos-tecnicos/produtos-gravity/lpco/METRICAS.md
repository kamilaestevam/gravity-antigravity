# Metricas de Sucesso e Instrumentacao — LPCO

> **Elaborado por:** Data Analyst — Dream Team de Produtos
> **Data:** 30/03/2026

---

## KPIs Primarios

| KPI | Meta | Baseline | Como Medir | Alerta |
|-----|------|----------|-----------|--------|
| Tempo de preparacao por canal | Manual <15min, Pedido <5min, SmartRead <3min | 30-60min (Portal Unico) | `created_at → data_registro` agrupado por `canal_entrada` | >2x meta |
| Taxa de cancelamento por inatividade | 0% | ~15% mercado | `COUNT(status=cancelada AND evento=cancelamento_automatico) / COUNT(total)` | >0% |
| Tempo de resposta a exigencia | <48h | dias/semanas | `data_exigencia → data_resposta` | >72h |
| LPCOs gerenciados por analista/mes | +50% vs baseline | Medir no 1o mes | `COUNT(*) GROUP BY user_id, mes` | — |
| Taxa de deferimento | >85% | Desconhecida | `COUNT(deferida) / COUNT(registrada)` | <70% |
| NPS | >40 | — | Pesquisa in-app trimestral | <20 |

## KPIs Secundarios

| KPI | Meta | Como Medir |
|-----|------|-----------|
| Adocao de Smart Read | >30% dos LPCOs criados | `COUNT(canal_entrada=SMART_READ) / COUNT(total)` |
| Adocao de canal Pedido | >25% | `COUNT(canal_entrada=PEDIDO) / COUNT(total)` |
| Integracao Portal Unico ativa | >50% dos tenants | `COUNT(DISTINCT tenant com SiscomexCredencial) / COUNT(DISTINCT tenant)` |
| Tempo medio de deferimento por orgao | Benchmark interno | `data_registro → data_deferimento GROUP BY orgao_anuente` |
| Saldo LPCO Flex utilizado | >80% antes de expirar | `SUM(vinculada) / quantidade_deferida` |
| Uptime do servico | 99,9% | Health check `/health` monitorado |

---

## Instrumentacao — O Que Medir

### Eventos a Registrar (via LpcoHistorico + Analytics)

| Evento | Quando | Dados Extras |
|--------|--------|-------------|
| `lpco_criado` | Criacao do rascunho | `canal_entrada`, `pedido_origem_id`, `orgao_anuente` |
| `lpco_registrado` | Transicao para para_analise | `tempo_preparacao_ms` |
| `registrado_portal_unico` | Sucesso no Portal | `numero_portal`, `metodo_auth` |
| `falha_registro_portal` | Erro no Portal | `erro_codigo`, `erro_mensagem` |
| `exigencia_recebida` | Orgao formulou exigencia | `orgao_anuente`, `numero_exigencia` |
| `exigencia_respondida` | Usuario respondeu | `tempo_resposta_ms`, `numero_exigencia` |
| `lpco_deferida` | Orgao deferiu | `tempo_deferimento_ms`, `orgao_anuente` |
| `lpco_indeferida` | Orgao indeferiu | `orgao_anuente`, `motivo` |
| `cancelamento_automatico_90_dias` | Cron cancelou | `dias_em_exigencia` |
| `cancelamento_manual` | Usuario cancelou | `motivo` |
| `vinculo_criado` | Vinculou a Processo | `processo_id`, `quantidade`, `tipo_documento` |
| `vinculo_cancelado` | Desfez vinculo | `quantidade_devolvida` |
| `smart_read_iniciado` | Upload para OCR | `tipo_documento`, `tamanho_bytes` |
| `smart_read_concluido` | OCR terminou | `campos_extraidos`, `confianca_media` |
| `alerta_60_dias` | Alerta amarelo | `lpco_id` |
| `alerta_80_dias` | Alerta vermelho | `lpco_id` |
| `certificado_expirando` | 30 dias para vencer | `tenant_id`, `dias_restantes` |

### Metricas de Performance (APM)

| Endpoint | Meta | Instrumentacao |
|----------|------|---------------|
| `GET /api/v1/lpcos` (listagem) | <200ms p95 | Response time + count |
| `POST /api/v1/lpcos` (criacao) | <500ms p95 | Response time |
| `POST /api/v1/lpcos/smart-read` | <10s p95 | Processing time |
| `POST /api/v1/lpcos/:id/portal/registrar` | <5s p95 | External API time |
| `GET /api/v1/simulador-ta` | <1s p95 | Response time + cache hit rate |

---

## Dashboard de Compliance (Fase 2 — specs para o Designer)

### Widget 1: Status Overview
- Donut chart: LPCOs por status (rascunho, em_analise, deferida, etc.)
- Numero total em destaque

### Widget 2: Alertas Ativos
- Cards vermelhos/amarelos com contagem
- "3 LPCOs com exigencia >60 dias"
- "1 certificado vence em 15 dias"

### Widget 3: Tempo Medio de Deferimento
- Bar chart: por orgao anuente (ANVISA: 12 dias, MAPA: 8 dias, etc.)
- Linha de meta (30 dias)

### Widget 4: Canais de Entrada
- Pie chart: distribuicao por canal (Manual 30%, Pedido 25%, SmartRead 35%, etc.)

### Widget 5: Taxa de Deferimento
- Gauge: % de LPCOs deferidas vs registradas
- Verde >85%, amarelo 70-85%, vermelho <70%

### Widget 6: Saldo de LPCOs Flex
- Tabela: LPCO Flex ativas com barra de saldo (consumido vs disponivel vs vigencia)
