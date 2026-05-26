# Plano em tela — Porteiro Signup / Login

> **ID:** `TST-EMT-LOGIN-000001`  
> **Plano mestre:** [`../../testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.md`](../../testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.md)

Validação visual manual (skill `testes/teste-em-tela`) — complementa E2E antes de release em produção.

---

## Ambiente

| Item | Valor |
|------|--------|
| URL local | `http://localhost:8000` |
| URL staging | `https://usegravity.com.br` |
| Viewport | 1440×900 (padrão Gravity) |

---

## Roteiro e screenshots

| # | Passo | Screenshot | Critério OK |
|---|-------|------------|-------------|
| EMT-001 | Signup e-mail novo + OTP | `01-signup-otp-trial.png` | URL `/trial`, modal "Bem-vindo" / nome empresa |
| EMT-002 | Login cliente existente | `02-hub-cliente-existente.png` | URL `/hub`, topbar HUB visível, **não** tela azul vazia |
| EMT-003 | Regressão bug prod | `03-NAO-hub-vazio.png` | **Falha** se só fundo `#0f172a` sem UI |
| EMT-004 | Onboarding passo CNPJ | `04-onboarding-cnpj.png` | Campo CNPJ + botão continuar |
| EMT-005 | Pós `POST /organizacoes` | `05-hub-pos-org.png` | Hub com card workspace ou estado vazio legítimo |

---

## Execução assistida

```bash
npx tsx testes/testes-em-tela/login/run-porteiro-signup.ts
```

Salvar PNGs em: `testes/testes-em-tela/login/2026-05-26-porteiro-signup/`

Registrar resultado em `RESULTADO.txt` (PASS/FAIL por passo).

---

## Aprovação

- [ ] Dono validou screenshots staging
- [ ] QA em tela — sem regressão hub vazio
- [ ] Anexar ao PR / release notes
