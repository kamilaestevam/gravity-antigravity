# PRD — NF Importacao (Emissao de NF-e de Entrada para Importacao) v2.0

> **Versao:** 2.0
> **Data:** 30/03/2026
> **Status:** Fase 2 — Especificacao (CP1 aprovado)
> **Product Owner:** Daniel Mendes
> **Elaborado por:** Dream Team de Produtos (8 agentes)
> **Revisao:** Reescrito apos Discovery com dados reais de mercado, 10 concorrentes analisados, e decisoes do dono

---

## 1. Sumario Executivo

**NF Importacao** e o produto do Gravity para **emissao de NF-e de Entrada** de importacao diretamente na SEFAZ, a partir de dados da DUIMP, com motor de rateio de despesas operacionais e exportacao multi-formato para qualquer ERP.

**Problema validado:** Toda DUIMP gera a necessidade de uma NF-e de Entrada. O processo atual e:
- **Lento:** 2-8 horas por NF manualmente (ComexBlog, Maino — 🟠)
- **Fragil:** ~15-30% de erro no rateio manual (hipotese 🔴, validada qualitativamente pelo dono)
- **Fragmentado:** cada importador usa ERP diferente (SAP, TOTVS, Excel, manual)
- **Sem padrao:** 100+ tipos de despesas operacionais, cada empresa nomeia de forma diferente
- **Sem solucao completa:** nenhum dos 10 concorrentes analisados oferece rateio com 9 metodos + layout customizavel + DUIMP native acessivel

**Solucao:** Motor de emissao de NF-e de importacao que:
1. **Puxa dados da DUIMP** via Portal Unico (certificado/token) ou Smart Read de PDF
2. **Rateia despesas operacionais** com 9 metodos combinaveis por despesa, preview em tempo real
3. **Emite NF-e na SEFAZ** com transmissao direta (certificado digital ja existente no Gravity)
4. **Exporta para qualquer ERP** via layout customizavel (TXT, XML, JSON, Excel, PDF)
5. **Lembra preferencias** — templates de despesas, favoritos fiscais, layouts de saida por empresa

**Metrica de sucesso:** Emissao de NF-e em menos de 10 minutos (vs 2-8 horas) com zero erro de rateio.

**Modelo de pricing:** Dual — assinatura mensal + pay-per-use (estilo Maino Flex).

---

## 2. Contexto e Motivacao

### Por que agora

- **DUIMP obrigatoria:** Migracao em fases desde out/2024. Ate dez/2026, 100% das operacoes via DUIMP. DI descontinuada. Janela de 12-18 meses para capturar mercado em transicao. (Gov.br/Siscomex — 🟢)
- **DUIMP nao tem XML:** Diferente da DI antiga, DUIMP nao gera extrato XML. Sistemas que dependem de XML (ComexNFe, legados) ficam obsoletos. (Portal Unico — 🟢)
- **Na DUIMP, impostos vem individualizados:** II, IPI, PIS, COFINS ja vem por item. O rateio que falta e de despesas operacionais — e ninguem resolve bem. (Maino Central de Ajuda — 🟢)
- **Dor validada em campo:** Dono do produto confirma: rateio de despesas operacionais e a maior dor, cada empresa quer de um jeito
- **Gap competitivo confirmado:** 10 concorrentes analisados, nenhum oferece rateio 9 metodos + layout customizavel

### Dados de mercado (com fontes)

| Metrica | Valor | Fonte | Qualidade |
|---------|-------|-------|-----------|
| Empresas importadoras ativas Brasil (2025) | 60.115 | MDIC/SECEX | 🟢 |
| Crescimento anual importadoras | +7,6% (4.238 novas) | MDIC/SECEX 2025 | 🟢 |
| DIs registradas (2023) | 2.567.205 | Receita Federal — Balanco Aduaneiro 2023 | 🟢 |
| Importacoes Brasil (2025) | USD 280,4 bilhoes | CNN Brasil / MDIC | 🟢 |
| Despachantes aduaneiros registrados | ~11.000 | Receita Federal — Cadastro Aduaneiro | 🟡 |
| Maino: NF-e emitidas em 2024 | 130.801 | Maino site oficial | 🟢 |
| Gett: preco NF-e importacao | a partir de R$ 199/mes | Senior Store | 🟢 |
| Narwal: preco gestao COMEX | R$ 5.000/mes | Senior Store | 🟢 |
| Tempo manual NF de entrada | 2-8 horas | ComexBlog, Maino blog | 🟠 |
| Reducao com automacao | >95% | Gett marketing | 🟡 |
| SAP GTS Brasil | Modo de manutencao | SAP Community | 🟢 |
| Mercado software COMEX Brasil | R$ 200-300M/ano (est.) | Calculo bottom-up | 🔴 |
| SAM NF Entrada | ~35.000-45.000 empresas | Calculo: 60k - empresas com ERP COMEX | 🔴 |

### Cronograma DUIMP (janela de oportunidade)

| Fase | Periodo | Escopo | Status |
|------|---------|--------|--------|
| Fase 1 | Out-Dez/2024 | Modal maritimo sem anuencia | Concluido |
| Fase 2 | Jan-Mar/2025 | Modal aereo + anuentes | Concluido |
| Fase 3 | Jul-Dez/2025 | Modal terrestre + Zona Franca | Concluido |
| Final | Dez/2026 | Deposito especial (ultimo prazo) | Em andamento |

**Impacto:** Toda empresa importadora PRECISA adaptar seus processos ate dez/2026. Momento ideal para oferecer ferramenta nova.

### O que existe hoje (10 concorrentes analisados)

| Concorrente | NF DUIMP | Rateio avancado | Layout custom | API | Preco |
|------------|----------|-----------------|--------------|-----|-------|
| **Maino** | SIM | Basico (peso/valor) | NAO | NAO | Flex + assinatura |
| **Narwal** | SIM | Basico + IA auditoria | NAO | NAO | R$ 5k/mes |
| **Conexos** | SIM | Basico | NAO | NAO | Enterprise |
| **ONESOURCE** | SIM | Customizavel | NAO | SAP cert. | Enterprise++ |
| **TOTVS** | Parcial | Proporcional valor | NAO | Nativo | R$ 500-5k/user |
| **ComexNFe** | NAO (XML DI) | Auto DI | NAO | NAO | Acessivel |
| **SAP GTS** | Manutencao | Via ABAP | NAO | IDOC | US$ 50k+ |
| **iData** | SIM | Nao confirmado | NAO | NAO | N/D |
| **Logcomex** | NAO (analytics) | NAO | NAO | SIM | N/D |
| **Siscomex** | NAO (governo) | NAO | NAO | SIM (fonte) | Gratis |

**Gap confirmado — NINGUEM oferece:**
1. Rateio com 9 metodos combinaveis por despesa
2. Layout de exportacao customizavel pelo usuario
3. TXT posicao fixa para ERPs legados (em SaaS)
4. Template de despesas por empresa
5. Favoritos fiscais (CFOP + CSTs por NCM)
6. Smart Read de recibos de despesas para entrada de dados

### Oportunidade

Posicionamento: **Ferramenta SaaS moderna, DUIMP-native, que faz o melhor rateio de despesas operacionais e a melhor exportacao multi-formato do mercado, com emissao direta na SEFAZ.**

NAO competir como: ERP completo (TOTVS, Maino), suite COMEX (Narwal, Conexos), analytics (Logcomex).

---

## 3. Publico-Alvo

> **Nota:** Personas abaixo sao hipoteticas (🔴), construidas a partir das dores relatadas pelo dono do produto e contexto de mercado. Validacao com usuarios reais esta pendente (acao pos-CP1).

### Persona 1: Carla — Analista Fiscal de Importacao

- 32 anos, contadora, importadora mid-market (30-50 NFs/mes)
- **JTBD Funcional:** "Quando recebo uma DUIMP desembaracada, quero emitir a NF-e de Entrada com despesas rateadas corretamente, no formato que o SAP aceita, em menos de 10 minutos"
- **JTBD Emocional:** "Quero parar de ter medo de errar o rateio e causar divergencia fiscal"
- **Dores hipoteticas (🔴 — a validar):**
  - Monta NF em planilha Excel com formulas frageis
  - Rateio de despesas operacionais (capatazia, frete interno) leva 2-3 horas por NF
  - Precisa converter para formato de importacao do SAP (.txt posicao fixa)
  - Erro de rateio gera NF complementar e retrabalho

### Persona 2: Roberto — Despachante Aduaneiro

- 45 anos, despachante ha 20 anos, 5 clientes importadores
- **JTBD Funcional:** "Quero configurar o perfil de cada cliente (despesas padrao, rateio preferido, formato de saida) e a cada DUIMP emitir a NF em 5 minutos"
- **JTBD Emocional:** "Quero demonstrar agilidade e precisao para nao perder clientes"
- **Dores hipoteticas (🔴 — a validar):**
  - Cada cliente quer despesas diferentes incluidas
  - Cada cliente tem ERP diferente (SAP, TOTVS, Excel, manual)
  - Recebe dezenas de recibos em PDF — digita tudo na mao

### Persona 3: Marcos — Controller Financeiro

- 40 anos, MBA Financas, trading company com 500+ processos/mes
- **JTBD Funcional:** "Quero garantia de que o custo de importacao esta correto e auditavel"
- **Dores hipoteticas (🔴 — a validar):**
  - Sem auditoria de como rateio foi feito
  - Analistas usam metodos inconsistentes entre si
  - Sem visao consolidada de NFs pendentes

### Persona 4: Juliana — Analista Junior (pequena empresa)

- 26 anos, 5-10 processos/mes, faz tudo sozinha
- **JTBD Funcional:** "Quero um sistema que me guie na emissao da NF, porque nao sou especialista fiscal"
- **Dores hipoteticas (🔴 — a validar):**
  - Nao sabe qual CFOP usar
  - Nao sabe quais despesas incluir
  - Usa modelo pay-per-use porque volume e baixo

---

## 4. Regras de Negocio

### Regulatorio/Fiscal (validadas pelo SME)

| RN | Regra | Base Legal | Excecoes |
|----|-------|-----------|----------|
| RN-001 | NF-e de Entrada de importacao deve ser emitida na SEFAZ via webservice | Ajuste SINIEF 07/2005, Manual NF-e v4.0 | Contingencia: SCAN/SVC |
| RN-002 | Dados da DUIMP sao a fonte primaria — impostos vem individualizados por item | Portal Unico / Decreto 6.759/2009 (Regulamento Aduaneiro) | DI legada tinha valores agrupados por adicao — NAO suportamos DI |
| RN-003 | CFOP de importacao (3.XXX) deve ser preenchido por item | Convenio s/n ICMS 1970, Ajuste SINIEF 07/2001 | Multiplos CFOPs por NF permitidos |
| RN-004 | CST de ICMS deve refletir tributacao efetiva | RICMS de cada UF | Beneficios fiscais (TTD, FUNDAP) alteram CST |
| RN-005 | CST de IPI: seletividade (00-05, 49-51, 99) | RIPI, TIPI vigente | Ex-tarifario zera IPI |
| RN-006 | CST de PIS/COFINS importacao: tabela especifica (50-56, 60-66, 70-75) | IN RFB 1.911/2019, Lei 10.865/2004 | Aliquotas diferenciadas por NCM (listas positiva/negativa) |
| RN-007 | ICMS importacao: calculo por dentro. Formula: BC = (CIF + II + IPI + PIS + COFINS + despesas) / (1 - aliquota) | RICMS, Convenio ICMS 38/2013 | DIFAL, ST, TTD, FUNDAP, Zona Franca |
| RN-008 | AFRMM: 25% longo curso, 10% cabotagem, 40% fluvial/lacustre | Lei 10.893/2004 | Isencoes por tipo de mercadoria |
| RN-009 | Taxa Siscomex: valor parametrizavel (nao hardcodar). Atualmente R$ 185,00 + R$ 29,50/adicao | Lei 9.716/1998 (valores atualizados periodicamente) | Valor muda por portaria — sistema deve tratar como config |
| RN-010 | Direito antidumping pode incidir sobre NCMs especificos | Resolucoes CAMEX/GECEX | Lista muda periodicamente — tratar como despesa adicional |
| RN-011 | Taxa de cambio: PTAX do dia anterior ao registro da DUIMP (padrao). Configuravel por empresa | IN RFB 680/2006, Regulamento Aduaneiro | Empresa pode usar taxa do fechamento de cambio |
| RN-012 | Certificado digital (e-CNPJ A1) necessario para emissao na SEFAZ | IN RFB 1.077/2010 | Gravity ja possui infra de certificado digital |

### Operacional

| RN | Regra |
|----|-------|
| RN-020 | NF pertence a exatamente uma empresa (company_id) dentro de um tenant |
| RN-021 | Status transita apenas via `nfImportacaoStatusEngine` — nunca update direto |
| RN-022 | Toda transicao de status gera `NfImportacaoHistorico` (append-only, imutavel) |
| RN-023 | IDs seguem formato corporativo: `nfim_id_XXXXXXX/YY` |
| RN-024 | Despesas sao do catalogo da empresa OU ad-hoc por NF. Catalogo e LIVRE (nao ha lista fixa) |
| RN-025 | Cada despesa tem metodo de rateio independente — 20 despesas podem ter 20 metodos |
| RN-026 | Soma dos rateios por despesa = valor total da despesa (tolerancia ±0.01, centavo restante) |
| RN-027 | Template de despesas auto-popula ao criar NF (se empresa tem template padrao) |
| RN-028 | NF emitida (SEFAZ autorizada) e READ-ONLY — pode cancelar ou emitir NF complementar |
| RN-029 | Casas decimais configuraveis por empresa (padrao: 2 valores, 4 quantidades) |
| RN-030 | CFOP + CSTs salvos como favorito por NCM + UF + empresa — aplicados automaticamente |
| RN-031 | Taxa de cambio registrada na NF para rastreabilidade de conversao |
| RN-032 | SEFAZ: emissao via webservice padrao NF-e v4.0, com contingencia SVAN/SVRS |
| RN-033 | Escopo geografico: Brasil inteiro (SEFAZ nacional, aliquota ICMS varia por UF) |

### Metodos de Rateio (despesas operacionais)

| Metodo | Descricao | Formula |
|--------|-----------|---------|
| `PESO_LIQUIDO` | Proporcional ao peso liquido | `despesa * (peso_item / peso_total)` |
| `PESO_BRUTO` | Proporcional ao peso bruto | `despesa * (peso_bruto_item / peso_bruto_total)` |
| `VALOR_CIF` | Proporcional ao valor aduaneiro (CIF) | `despesa * (cif_item / cif_total)` |
| `VALOR_FOB` | Proporcional ao valor FOB | `despesa * (fob_item / fob_total)` |
| `QUANTIDADE` | Proporcional a quantidade estatistica | `despesa * (qtd_item / qtd_total)` |
| `VALOR_II` | Proporcional ao II por item | `despesa * (ii_item / ii_total)` |
| `IGUALITARIO` | Dividido igualmente | `despesa / numero_itens` |
| `MANUAL` | Usuario define por item | Soma deve fechar com total |
| `CUSTOMIZADO` | Formula ponderada (ex: 60% peso + 40% valor) | Parser seguro, NUNCA eval() |

---

## 5. Requisitos Funcionais

### MVP (Fase 1)

#### Entrada de Dados (DUIMP only)

| ID | Requisito | Prioridade | Complexidade |
|----|-----------|-----------|-------------|
| RF-001 | Importar dados da DUIMP via Portal Unico (certificado digital ou token) | Must-have | GG |
| RF-002 | Importar dados da DUIMP via upload de PDF + Smart Read (OCR+IA) | Must-have | G |
| RF-003 | Vincular NF a Processo existente no Gravity (auto-preenche dados da DUIMP) | Must-have | M |
| RF-004 | Digitar dados manualmente (formulario completo) | Must-have | M |
| RF-005 | Importar dados via ERP (Conector ERP / API Cockpit) | Must-have | M |

#### Gestao de Despesas Operacionais

| ID | Requisito | Prioridade | Complexidade |
|----|-----------|-----------|-------------|
| RF-010 | Catalogo de despesas por empresa (nome LIVRE, metodo padrao, conta contabil) | Must-have | M |
| RF-011 | Template de despesas fixas por empresa (auto-popula a cada NF) | Must-have | M |
| RF-012 | Adicionar despesas ad-hoc por NF (alem do template) | Must-have | P |
| RF-013 | Smart Read de recibos/demonstrativos — upload PDF → IA extrai tipo + valor | Must-have | G |
| RF-014 | Importar despesas de planilha (Excel/CSV) | Should-have | M |
| RF-015 | Vincular documento comprobatorio a cada despesa | Should-have | P |

#### Motor de Rateio

| ID | Requisito | Prioridade | Complexidade |
|----|-----------|-----------|-------------|
| RF-020 | Rateio por peso liquido | Must-have | M |
| RF-021 | Rateio por peso bruto | Must-have | P |
| RF-022 | Rateio por valor CIF | Must-have | M |
| RF-023 | Rateio por valor FOB | Must-have | P |
| RF-024 | Rateio por quantidade estatistica | Must-have | P |
| RF-025 | Rateio proporcional ao II | Should-have | M |
| RF-026 | Rateio igualitario | Must-have | P |
| RF-027 | Rateio manual (usuario define por item) | Must-have | M |
| RF-028 | Rateio customizado (formula configuravel) | Should-have | G |
| RF-029 | Preview de rateio em tempo real | Must-have | M |
| RF-030 | Metodo de rateio independente por despesa | Must-have | M |
| RF-031 | Validacao: soma rateios = total despesa (centavo restante) | Must-have | M |

#### Composicao Fiscal

| ID | Requisito | Prioridade | Complexidade |
|----|-----------|-----------|-------------|
| RF-040 | CFOP por item (com sugestao baseada em favorito salvo) | Must-have | M |
| RF-041 | CST de ICMS, IPI, PIS, COFINS por item | Must-have | M |
| RF-042 | Favorito fiscal: salvar CFOP + CSTs por NCM + UF + empresa | Must-have | P |
| RF-043 | Aplicar favorito automaticamente quando NCM ja tem preset | Must-have | M |
| RF-044 | Calculo de ICMS por dentro (formula: BC / (1 - aliquota)) | Must-have | G |
| RF-045 | Taxa de cambio registrada na NF (PTAX ou configuravel) | Must-have | P |
| RF-046 | Beneficios fiscais como override (TTD, FUNDAP, ZFM, ex-tarifario) | Should-have | G |

#### Emissao na SEFAZ

| ID | Requisito | Prioridade | Complexidade |
|----|-----------|-----------|-------------|
| RF-050 | Transmitir NF-e para SEFAZ via webservice v4.0 | Must-have | GG |
| RF-051 | Gerar XML assinado com certificado digital (A1) | Must-have | G |
| RF-052 | Receber protocolo de autorizacao e armazenar | Must-have | M |
| RF-053 | Gerar DANFE (PDF da NF autorizada) | Must-have | G |
| RF-054 | Contingencia SVAN/SVRS quando SEFAZ UF indisponivel | Must-have | G |
| RF-055 | Cancelamento de NF-e (prazo de 24h, webservice) | Must-have | M |
| RF-056 | Carta de Correcao Eletronica (CC-e) | Should-have | M |

#### Exportacao / Saida (para ERP do cliente)

| ID | Requisito | Prioridade | Complexidade |
|----|-----------|-----------|-------------|
| RF-060 | Exportar dados da NF em Excel (.xlsx) | Must-have | M |
| RF-061 | Exportar dados da NF em TXT (layout configuravel — SAP, TOTVS) | Must-have | G |
| RF-062 | Exportar dados da NF em JSON (API) | Must-have | P |
| RF-063 | Exportar dados da NF em CSV | Must-have | P |
| RF-064 | Construtor de layout de saida (usuario monta template de colunas, formato, posicao) | Must-have | GG |
| RF-065 | Salvar layout como favorito por empresa | Must-have | P |
| RF-066 | Pre-sets: SAP IDOC, TOTVS Protheus, TOTVS Datasul, Excel generico | Must-have | G |

#### Gestao e Listagem

| ID | Requisito | Prioridade | Complexidade |
|----|-----------|-----------|-------------|
| RF-070 | Lista de NFs com filtros (status, empresa, periodo, DUIMP) | Must-have | M |
| RF-071 | Detalhe da NF com abas (Itens, Despesas, Rateio, Fiscal, DANFE, Historico) | Must-have | M |
| RF-072 | Duplicar NF existente como base | Should-have | P |
| RF-073 | Historico completo (timeline append-only) | Must-have | M |
| RF-074 | API Cockpit — sistema externo cria e consulta NFs via API | Must-have | M |

### Fase 2

| ID | Requisito | Depende de |
|----|-----------|-----------|
| RF-080 | Dashboard: NFs pendentes, valores, DUIMPs sem NF | RF-070 |
| RF-081 | NF complementar (ajuste pos-desembaraco) | RF-050 |
| RF-082 | Consolidacao multi-DUIMP → 1 NF | RF-001 |
| RF-083 | Regras de rateio por grupo de NCM | RF-030 |
| RF-084 | Integracao bidirecional Portal Unico (sync automatico) | RF-001 |
| RF-085 | Inutilizacao de numeracao | RF-050 |

### Fase 3

| ID | Requisito |
|----|-----------|
| RF-090 | Composicao assistida por IA (Gabi) |
| RF-091 | Validacao fiscal inteligente (IA sugere CFOP/CST por historico) |
| RF-092 | Push automatico para ERP (SAP BAPI, TOTVS Webservice) |
| RF-093 | Predicao de despesas por historico (ML) |
| RF-094 | Workflow de aprovacao interna |

---

## 6. Requisitos Nao-Funcionais

| ID | Requisito | Criterio | Prioridade |
|----|-----------|---------|-----------|
| RNF-001 | Performance | Lista de NFs < 200ms (1000 registros) | Must-have |
| RNF-002 | Performance | Rateio 100 itens × 20 despesas < 500ms | Must-have |
| RNF-003 | Performance | Preview de rateio < 300ms | Must-have |
| RNF-004 | Performance | Emissao SEFAZ < 10s (incluindo assinatura + transmissao) | Must-have |
| RNF-005 | Performance | Geracao de DANFE < 3s | Must-have |
| RNF-006 | Escalabilidade | 50.000 NFs/tenant sem degradacao | Must-have |
| RNF-007 | Disponibilidade | 99,9% uptime | Must-have |
| RNF-008 | Seguranca | Tenant isolation zero-trust | Must-have |
| RNF-009 | Seguranca | Anti-enumeracao: 404 cross-tenant | Must-have |
| RNF-010 | Seguranca | Certificado digital armazenado com AES-256-GCM | Must-have |
| RNF-011 | Auditoria | Historico append-only com timestamp e user_id | Must-have |
| RNF-012 | Acessibilidade | WCAG 2.1 AA | Must-have |
| RNF-013 | Responsividade | Desktop (1280+), Tablet (768-1279) | Must-have |
| RNF-014 | Precisao | Rateio N casas decimais configuraveis, ROUND_HALF_UP | Must-have |
| RNF-015 | Compliance | XML NF-e v4.0 assinado, schema XSD validado | Must-have |

---

## 7. Fluxos de Usuario

### Fluxo Principal — Emissao de NF-e de Entrada

```
1. Usuario acessa Lista de NFs Importacao
2. Clica em "+ Nova NF"
3. Step 0 — "De onde vem a DUIMP?"
   a) Portal Unico → autentica → seleciona DUIMP → puxa dados → Step 1
   b) Upload PDF → Smart Read (OCR+IA) → preview amarelo → confirma → Step 1
   c) Processo Gravity → seleciona Processo → auto-preenche → Step 1
   d) ERP/API → dados ja vem via integracao → Step 1
   e) Manual → formulario em branco → Step 1
4. Step 1: Dados da DUIMP (revisao)
   - Itens com NCM, descricao, quantidade, peso, valores
   - Impostos ja individualizados (vem da DUIMP)
   - Taxa de cambio (PTAX ou configuravel)
5. Step 2: Despesas operacionais
   - Template auto-popula despesas fixas (se configurado)
   - Smart Read de recibos → IA extrai tipo + valor
   - Adicionar despesas ad-hoc
   - Para cada despesa: valor total + metodo de rateio
6. Step 3: Rateio (preview em tempo real)
   - Tabela matricial: Item × Despesa × Valor Rateado
   - Trocar metodo de rateio por despesa (dropdown)
   - Validacao: soma = total (centavo restante automatico)
   - Override manual se necessario
7. Step 4: Fiscal
   - CFOP por item (favorito auto-aplicado se existir)
   - CSTs (favorito auto-aplicado)
   - ICMS calculado por dentro automaticamente
   - Totalizacao da NF
8. Step 5: Revisao + Emissao
   - Preview completo da NF (todos os valores)
   - Botao "Emitir na SEFAZ"
   - Assina XML com certificado digital
   - Transmite para SEFAZ
   - Recebe protocolo de autorizacao
   - Gera DANFE (PDF)
   - Opcionalmente: exporta para ERP (formato configurado)
9. NF emitida — historico registrado, status "autorizada"
```

### Fluxo — Smart Read de Despesas

```
1. Step 2, usuario clica "Importar via Smart Read"
2. Upload de recibos/demonstrativos (PDF ou imagem)
3. OCR+IA extrai: tipo de despesa, valor, CNPJ prestador, data
4. IA tenta mapear para catalogo da empresa (ex: "THC" → "Capatazia")
5. Preview amarelo para confirmacao
6. Usuario confirma/corrige → despesas adicionadas
```

### Fluxo — Configuracao de Template de Despesas

```
1. Configuracoes > Templates de Despesas
2. Cria template (ex: "Padrao Santos", "Padrao Aeroporto")
3. Adiciona despesas do catalogo + metodo de rateio padrao
4. Marca como template padrao da empresa (opcional)
5. Nas proximas NFs, template auto-popula — usuario so ajusta valores
```

### Fluxo — Construtor de Layout de Saida

```
1. Configuracoes > Layouts de Exportacao
2. Cria layout (ex: "SAP Santos", "TOTVS Matriz")
3. Define: formato (TXT/CSV/XML/JSON/Excel), campos, ordem, formatacao
4. Para TXT posicao fixa: posicao_inicio + tamanho por campo
5. Preview com dados de exemplo
6. Salva como favorito da empresa
```

---

## 8. Wireframes e Telas

### Mapa de Telas — MVP

| # | Tela | Rota | Descricao |
|---|------|------|-----------|
| T-00 | Origem da DUIMP | `/nf-importacao/nova` | Step 0: 5 cards (Portal Unico, PDF, Processo, ERP, Manual) |
| T-01 | Lista de NFs | `/nf-importacao` | Grid com filtros, status SEFAZ |
| T-02 | Dados da DUIMP | `/nf-importacao/nova/duimp` | Step 1: itens, valores, cambio |
| T-03 | Despesas | `/nf-importacao/nova/despesas` | Step 2: template + Smart Read + manual |
| T-04 | Rateio | `/nf-importacao/nova/rateio` | Step 3: tabela matricial com preview |
| T-05 | Fiscal | `/nf-importacao/nova/fiscal` | Step 4: CFOP, CSTs, ICMS, totais |
| T-06 | Revisao + Emissao | `/nf-importacao/nova/emissao` | Step 5: preview + emitir SEFAZ |
| T-07 | Detalhe da NF | `/nf-importacao/:id` | Abas: Itens, Despesas, Rateio, Fiscal, DANFE, Historico |
| T-08 | DANFE | `/nf-importacao/:id/danfe` | PDF da NF autorizada |
| T-09 | Catalogo Despesas | `/nf-importacao/config/despesas` | CRUD despesas da empresa |
| T-10 | Templates Despesas | `/nf-importacao/config/templates` | Templates fixos |
| T-11 | Layouts Exportacao | `/nf-importacao/config/layouts` | Construtor de layout |
| T-12 | Favoritos Fiscais | `/nf-importacao/config/favoritos` | Presets CFOP + CSTs |
| T-13 | Credenciais | `/nf-importacao/config/credenciais` | Certificado digital + Portal Unico |

### Grid T-01 — Status inclui SEFAZ

| Status | Badge | Significado |
|--------|-------|-------------|
| `rascunho` | Cinza | Dados importados, sem despesas |
| `em_composicao` | Azul | Despesas/rateio em andamento |
| `pronta` | Amarelo | Rateio + fiscal completos, pronta para emitir |
| `autorizada` | Verde | SEFAZ autorizou — NF valida |
| `rejeitada` | Vermelho | SEFAZ rejeitou — corrigir e reenviar |
| `cancelada` | Cinza escuro | NF cancelada na SEFAZ |
| `denegada` | Vermelho escuro | SEFAZ denegou (irregularidade fiscal) |

---

## 9. Integracoes

| Integracao | Tipo | Descricao |
|-----------|------|-----------|
| **SEFAZ** | Webservice bidirecional | Emissao, cancelamento, CC-e, contingencia |
| **Portal Unico Siscomex** | API (certificado/token) | Puxa dados da DUIMP |
| **Processo Gravity** | Vinculo interno | DUIMP do Processo → auto-preenche |
| **Smart Read** | OCR+IA existente | PDF DUIMP + recibos de despesas |
| **API Cockpit** | Tokens `gv_live_sk_` | ERP cria NFs via API |
| **Conector ERP** | OData/REST existente | Importa dados do ERP |
| **Certificado digital** | Infra existente | AES-256-GCM, mesmo padrao LPCO |
| **Historico** | Servico tenant | Audit trail |
| **Notificacoes** | Servico tenant | NF pendente, SEFAZ rejeitou |
| **Email** | Servico tenant | Envio de DANFE |
| **Dashboard** | Servico tenant | Widgets KPI |

---

## 10. Modelo de Pricing

| Tier | Perfil | Modelo | Preco sugerido | Referencia |
|------|--------|--------|---------------|------------|
| **Flex** | PMEs, <10 NFs/mes | Pay-per-use (creditos) | R$ 15-30/NF emitida | Maino Flex |
| **Pro** | Mid-market, 10-100 NFs/mes | Assinatura mensal | R$ 499-999/mes | Gett R$ 199, gap ate Narwal R$ 5k |
| **Enterprise** | Trading, >100 NFs/mes | Assinatura + API | R$ 2.000-4.000/mes | Abaixo Narwal (R$ 5k) |

**Decisao do dono:** Ambos os modelos (assinatura + pay-per-use) no lancamento.

---

## 11. Metricas de Sucesso

| KPI | Meta | Como Medir |
|-----|------|-----------|
| Tempo medio de emissao | < 10 min (vs 2-8h manual) | Timestamp criacao → SEFAZ autorizada |
| Taxa de rejeicao SEFAZ | < 5% | NFs rejeitadas / total emitidas |
| Taxa de erro de rateio | 0% | NFs complementares / total |
| Adocao de templates | > 70% dos tenants com template | Count |
| NFs via Smart Read | > 30% | Count por canal |
| NPS | > 40 | Pesquisa trimestral |
| Churn mensal | < 3% | Padrao SaaS B2B |

---

## 12. Cronograma

| Fase | Escopo | Estimativa | Dependencia |
|------|--------|-----------|-------------|
| MVP | RF-001 a RF-074 — DUIMP + despesas + rateio + fiscal + SEFAZ + exportacao + layout | 14-16 semanas | Certificado digital (ja existe), lib NF-e |
| Fase 2 | RF-080 a RF-085 — dashboard + NF complementar + consolidacao + sync Portal Unico | 4-6 semanas | MVP validado |
| Fase 3 | RF-090 a RF-094 — IA (Gabi) + push ERP + predicao + workflow | 4-6 semanas | Fase 2 |

---

## 13. Riscos e Mitigacoes

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|----------|
| Complexidade SEFAZ (rejeicoes, contingencia, schemas) | Media | Alto | Usar lib NF-e madura (nfe-io, sefaz-node, ou similar). Contingencia SVAN/SVRS |
| Variedade de layouts ERP | Alta | Alto | Construtor generico + pre-sets SAP/TOTVS |
| ICMS por dentro com beneficios fiscais | Media | Alto | Favoritos fiscais — usuario decide e salva. SME valida regras |
| Reforma tributaria (IBS/CBS substituindo ICMS/PIS/COFINS) | Media | Alto | Arquitetura fiscal modular, aliquotas nao hardcoded |
| Smart Read baixa precisao em recibos | Media | Medio | Preview obrigatorio, feedback loop |
| Concorrente adiciona rateio avancado | Media | Alto | Lancar rapido, construir base |

---

## 14. Decisoes Tomadas

| Decisao | Alternativa Descartada | Motivo |
|---------|----------------------|--------|
| Emitir NF-e na SEFAZ (nao so draft) | Gerar apenas draft/arquivo | Dono decidiu: emissao real e o valor. Maino faz isso — precisamos igualar |
| DUIMP only (sem DI) | Suportar DI + DUIMP | DI descontinuada ate dez/2026. Foco no futuro, nao no legado |
| Pricing dual (assinatura + pay-per-use) | Apenas assinatura | Maino Flex prova que pay-per-use captura PMEs. Dono quer ambos |
| Catalogo de despesas LIVRE | Lista fixa | Cada empresa nomeia diferente — 100+ nomes |
| Rateio independente por despesa | Metodo unico por NF | Confirmado pelo dono: despesas diferentes, rateios diferentes |
| Construtor de layout generico | Apenas pre-sets | Cada ERP tem layout proprio |
| Brasil inteiro (SEFAZ nacional) | Apenas Sul/Sudeste MVP | SEFAZ e protocolo nacional. Diferenca e aliquota ICMS — resolvida por favoritos |
| Smart Read para recibos | Apenas digitacao | Despachantes recebem dezenas de PDFs — Smart Read reduz 80% |
| Taxa de cambio como campo | Sem rastreabilidade | Essencial para auditoria de conversao BRL/USD |
