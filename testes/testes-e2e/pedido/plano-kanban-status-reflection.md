# Plano E2E — Kanban reflete 1:1 a tela de configuração de Status

**Produto:** Pedido  
**Data do plano:** 2026-04-12  
**Scope:** Validar que o Kanban exibe exatamente as colunas configuradas em `/configuracoes/status`

---

## Motivação

Antes da correção (Onda 2), o Kanban usava colunas hardcoded (5 fixas, labels e cores hardcoded).  
Após a correção, as colunas vêm 100% de `GET /api/v1/pedidos/config/status`:
- Ordem → `campo ordem` do banco
- Label → `campo rotulo` do banco
- Cor → `campo cor` do banco
- Statuses customizados (ex: Aprovado, DANIEL) → aparecem como colunas

Este plano valida que o Kanban e a tela de config estão sincronizados.

---

## Pré-condições

- Frontend rodando em `localhost:5179`
- Backend rodando em `localhost:3001`
- Usuário autenticado com permissão de visualizar e configurar status
- Banco com pelo menos 5 status (incluindo os de sistema)

---

## Cenários

### E2E-K01 — Colunas do Kanban correspondem aos status configurados

**Fluxo:**
1. Acessar `/configuracoes` → seção Status
2. Registrar os rotulos e a ordem atual dos status
3. Acessar `/pedidos/kanban`
4. Verificar que as colunas do Kanban têm os mesmos rotulos, na mesma ordem

**Critério de aceite:**
- Cada status da config aparece como uma coluna no Kanban
- A ordem das colunas é idêntica à `ordem` da config
- Nenhuma coluna extra aparece que não esteja na config

**Prints planejados:**
```
01-config-status-lista.png        — Tela de config mostrando a lista de status
02-kanban-colunas.png             — Kanban com as colunas correspondentes
03-comparacao-ordem.png           — Screenshot full da tela de Kanban (validação visual)
```

---

### E2E-K02 — Coluna cancelado não aceita drop (isReadOnly)

**Fluxo:**
1. Acessar `/pedidos/kanban`
2. Verificar que a coluna Cancelado existe
3. Tentar arrastar um card para a coluna Cancelado
4. Verificar que o drop não acontece (coluna é read-only)

**Critério de aceite:**
- Coluna Cancelado existe no Kanban
- Card não pode ser solto na coluna Cancelado

**Prints planejados:**
```
01-kanban-cancelado-visivel.png   — Coluna Cancelado visível
02-tentativa-drop-cancelado.png   — Cursor sobre cancelado durante drag
```

---

### E2E-K03 — Modal de card exibe seletor de status com opções da config

**Fluxo:**
1. Acessar `/pedidos/kanban`
2. Clicar em qualquer card
3. Verificar que o select de Status no modal contém os mesmos status da config

**Critério de aceite:**
- Modal abre com aba "Pedido"
- Select de Status contém as opções da config (não hardcoded)

**Prints planejados:**
```
01-modal-aberto-aba-pedido.png    — Modal aberto com select de status
02-modal-status-opcoes.png        — Dropdown de status aberto
```

---

## Spec: `kanban-status-reflection.spec.ts`

Arquivo: `testes/testes-e2e/pedido/kanban-status-reflection.spec.ts`

---

## Aprovação

- [ ] Dono do produto aprovou este plano
- [ ] QA validou os critérios de aceite
- [ ] Data de execução agendada: ___________
