---
name: antigravity-auto-scaling
description: "Use esta skill para configurar auto-scaling e controle de custos no Railway. Define regras de scaling, limites de orçamento, alertas de custo e scale-to-zero. Consultada pelo DevOps/SRE e Estrutura de Sistemas ao configurar infraestrutura."
---

# Gravity — Auto-Scaling & Cost Control

## Regra Fundamental

A plataforma escala automaticamente em picos, mas com orçamento controlado. Nunca escalar sem limite. Nunca gastar mais do que o aprovado.

---

## Railway — Configuração de Scaling

### Por serviço

| Serviço | Min instâncias | Max instâncias | CPU trigger | RAM trigger |
|:---|:---|:---|:---|:---|
| configurador | 1 | 3 | 70% | 80% |
| organização-services | 1 | 5 | 70% | 80% |
| simula-custo | 1 | 3 | 70% | 80% |
| bid-frete | 1 | 3 | 70% | 80% |
| marketplace | 0 (scale-to-zero) | 2 | 60% | 70% |

### Scale-to-zero

Serviços que podem ir a zero instâncias quando sem tráfego:

- **marketplace** — site estático, cold start aceitável
- **Nenhum** serviço com banco ativo pode ir a zero (risco de connection drop)

---

## Limites de Orçamento

| Ambiente | Budget mensal | Alerta em |
|:---|:---|:---|
| Staging | $50 | 80% ($40) |
| Production | $200 | 70% ($140) e 90% ($180) |
| Total | $250 | 80% ($200) |

### Alertas de custo

```
70% do budget → Alerta informativo (email)
80% do budget → Alerta de atenção (email + Slack)
90% do budget → Alerta crítico (email + Slack + notificação ao Daniel)
95% do budget → Scaling automático BLOQUEADO (só vertical, não horizontal)
```

---

## Estratégia de Scaling

### Horizontal (mais instâncias)

Quando usar:
- CPU sustentada > 70% por 5 min
- Request queue crescendo
- Latência p95 > 200ms

Como funciona:
- Railway adiciona réplica do serviço
- Load balancer distribui requests
- Sessões são stateless (JWT) — sem afinidade de sessão

### Vertical (mais recursos por instância)

Quando usar:
- Memória > 80% consistentemente
- Queries pesadas que precisam de mais RAM
- Antes de horizontal (geralmente mais eficiente)

| Serviço | RAM padrão | RAM máxima | vCPU padrão | vCPU máxima |
|:---|:---|:---|:---|:---|
| configurador | 512MB | 1GB | 0.5 | 1 |
| organização-services | 512MB | 2GB | 0.5 | 2 |
| produtos | 512MB | 1GB | 0.5 | 1 |
| marketplace | 256MB | 512MB | 0.25 | 0.5 |

---

## Monitoramento de Custos

Dashboard mensal com:

1. **Custo por serviço** — qual serviço está gastando mais
2. **Custo por recurso** — compute vs banco vs network
3. **Trend** — comparação com mês anterior
4. **Projeção** — estamos no caminho de estourar o budget?

---

## Otimização de Custos

| Ação | Economia estimada |
|:---|:---|
| Scale-to-zero marketplace | ~20% compute |
| Connection pooling (PgBouncer) | ~15% DB connections |
| Cache de dados frequentes (Redis) | ~10% compute |
| Queries otimizadas (select specific) | ~10% DB |
| Compressão de response (gzip) | ~5% network |

---

## Checklist — Configurar Scaling

- [ ] Min/max instâncias definidos por serviço?
- [ ] CPU/RAM triggers configurados?
- [ ] Budget mensal definido com alertas?
- [ ] Scale-to-zero apenas para serviços sem banco?
- [ ] Monitoramento de custos ativo?
- [ ] Projeção de custo revisada mensalmente?
