# Smart Read — Análise de Riscos (aba Conferência)

> **Status:** V1 em produção (determinístico) · V2/V3 em desenho (LLM + fundamentação normativa)  
> **Código V1:** `client/src/shared/analisar-riscos-aduaneiros-leitura-smart-read.ts`  
> **UI:** `client/src/components/nova-leitura-smart-read/conferencia-riscos-aduaneiros-nova-leitura-smart-read.tsx`  
> **Testes:** `testes/testes-unitarios/produto-gravity/smart-read/analisar-riscos-aduaneiros-leitura.test.ts`

---

## 1. Objetivo da aba

A aba **Análise de Riscos** (3ª aba do passo Conferência) aponta **riscos aduaneiros e documentais** sobre os documentos da leitura, com cards padronizados:

| Campo | Uso |
|-------|-----|
| `severidade` | `critico` · `atencao` · `informativo` |
| `categoria` | `ncm` · `cnpj` · `incoterm` · `documental` · `cruzado` · *(futuro: `normativo`)* |
| `titulo` | Resumo curto do achado |
| `motivo` | Por que é risco |
| `analise` | Contexto operacional / próximo passo |
| `evidencias[]` | Documento, campo e valor que sustentam o achado |

**Disclaimer obrigatório na UI (V2+):** análise é **apoio à conferência**, não parecer jurídico nem despacho aduaneiro.

---

## 2. Escopo completo — análise de INVOICE (V1 + V2 + V3)

> **SSOT do que o motor de teste deve cobrir.** Nada desta seção pode ser removido sem decisão explícita do dono.  
> **Produção hoje:** apenas itens marcados com `[V1]`. Demais = piloto `[V2]` LLM, `[V3]` Cadastros/RAG, `[PDF]` exige blob na sessão, `[CRUZ]` exige outro documento na leitura, `[QA]` Consultor Inteligente sob demanda.

### Entrada do motor

| Fonte | Disponibilidade |
|-------|-----------------|
| `resultado_extracao[].dados` (JSON) | Sempre após análise completa |
| Edições da conferência | `dados` pós-edição do usuário |
| PDF do arquivo | Upload na sessão (não ao retomar sem blob) `[PDF]` |
| Outros docs da leitura (PL, BL, AWB…) | `[CRUZ]` |
| Tabela NCM / Portal Único | `[V3]` via Cadastros S2S |
| Chunks normativos COMEX | `[V3]` via RAG Gabi |

---

### A) Regras fixas — determinístico `[V1]`

| # | Verificação | Severidade se falhar | Campos / regra |
|---|-------------|----------------------|----------------|
| A1 | Incoterm presente | Crítico | `document.incoterm`, `incoterm` |
| A2 | CNPJ / Tax ID presente | Crítico | `importer.cnpj`, `importer.taxId`, `exporter.taxId`, `exporter.cnpj` |
| A3 | CNPJ brasileiro — dígitos verificadores | Atenção | algoritmo `validarCnpjBrasil` |
| A4 | NCM/HS em ao menos um item | Crítico | `items[].ncm`, `items[].hsCode`, busca recursiva em `dados` |
| A5 | NCM com exatamente 8 dígitos numéricos | Atenção | normalização `replace(/\D/g, '')` |
| A6 | Incoterm igual em todos os docs da leitura | Atenção | `[CRUZ]` Invoice vs PL vs outros |
| A7 | Conjunto de NCM Invoice = conjunto PL | Crítico | `[CRUZ]` |

---

### B) Completude — campos críticos além das regras fixas `[V2]`

| # | Bloco | O que verificar | Caminhos típicos no JSON |
|---|-------|-----------------|--------------------------|
| B1 | Cabeçalho | Número, data, tipo do documento | `document.documentNumber`, `document.documentDate`, `document.documentType` |
| B2 | Cabeçalho | Local do Incoterm | `document.incotermLocation` |
| B3 | Cabeçalho | País de origem, aquisição, proveniência | `document.originCountry`, `document.countryOfAcquisition`, `document.countryOfProvenance` |
| B4 | Cabeçalho | Data de embarque (se aplicável) | `document.shippedOnBoardDate` |
| B5 | Exportador | Nome, endereço completo, país, cidade | `exporter.name`, `exporter.address`, `exporter.country`, `exporter.city`, `exporter.state`, `exporter.zipCode` |
| B6 | Exportador | Tax ID (quando exigível) | `exporter.taxId` |
| B7 | Importador | Nome, endereço, país, estado, cidade, CEP | `importer.name`, `importer.address`, `importer.country`, `importer.state`, `importer.city`, `importer.zipCode` |
| B8 | Importador | CNPJ / Tax ID | `importer.taxId`, `importer.cnpj` |
| B9 | Itens (cada linha) | NCM, HS, país de origem, fabricante | `items[].ncm`, `items[].hsCode`, `items[].originCountry`, `items[].manufacturer` |
| B10 | Itens | Part number, PO, descrição EN e PT | `items[].partNumber`, `items[].poNumber`, `items[].descriptions.english`, `items[].descriptions.portuguese` |
| B11 | Itens | Quantidade, moeda, preço unitário, total linha | `items[].itemQuantity`, `items[].itemCurrency`, `items[].itemUnitPriceWithCurrency`, `items[].itemTotalPriceWithCurrency` |
| B12 | Itens | Pesos líquido/bruto por item | `items[].weights.net`, `items[].weights.gross`, `items[].weights.unit` |
| B13 | Embarque | Modal, transportador, portos/aeroportos | `shipment.modal`, `shipment.carrier`, `shipment.ports.*`, `shipment.airports.*` |
| B14 | Embarque | Frete, seguro | `shipment.costs.freight`, `shipment.costs.insurance` |
| B15 | Embarque | Containers (se marítimo) | `containerNumbers` |
| B16 | Resumo volumes | Peso bruto/líquido/tara, cubagem, volumes | `packageSummary.totalGrossWeight`, `totalNetWeight`, `totalTareWeight`, `totalCubicMeasurement`, `totalPackages` |
| B17 | Totais | Valor total documento, descontos, outras despesas | `values.totalDocumentValue`, `values.discountsOrAdditions`, `values.otherCharges` |
| B18 | Moeda | Tipo e taxa de câmbio (se informada) | `currency.type`, `currency.exchangeRate` |
| B19 | Pagamento | Método e condição | `payment.method`, `payment.terms` |
| B20 | Bancário | Dados bancários (quando pagamento exige) | `bankingDetails.*` |
| B21 | Assinatura | Documento assinado | `isSigned` |
| B22 | Observações | Texto livre relevante | `observations`, `additionalFields.*` |

---

### C) Coerência interna (matemática e lógica no documento) `[V2]`

| # | Verificação | Regra |
|---|-------------|-------|
| C1 | Total da linha | `itemQuantity × itemUnitPrice ≈ itemTotalPrice` (tolerância arredondamento) |
| C2 | Soma das linhas | Σ `itemTotalPrice` ≈ `values.totalDocumentValue` |
| C3 | Moeda única | Mesma moeda em cabeçalho, itens e totais |
| C4 | Pesos | Σ peso líquido itens ≈ `packageSummary.totalNetWeight`; bruto idem |
| C5 | Volumes | `totalPackages` coerente com itens/volumes declarados |
| C6 | Incoterm × local | Incoterm compatível com `incotermLocation` citado (ex.: EXW + HK) |
| C7 | Países no cabeçalho | `originCountry` vs `countryOfAcquisition` vs `countryOfProvenance` — sem contradição óbvia |
| C8 | CNPJ × localização | CNPJ BR presente → `importer.country` Brazil e estado/cidade coerentes |
| C9 | Data | `documentDate` não futura; embarque após emissão (se ambas preenchidas) |

---

### D) Coerência comercial (partes e operação) `[V2]`

| # | Verificação | Exemplo de achado |
|---|-------------|-------------------|
| D1 | Exportador vs importador | Exportador HK/CN vs importador Manaus/BR — operação típica importação |
| D2 | Endereço incompleto | Cidade/CEP/estado faltando em parte obrigatória |
| D3 | Exportador sem identificação fiscal | `exporter.taxId` vazio em operação que exige rastreabilidade |
| D4 | Importador industrial ZFM | Importador em Manaus/AM — sinalizar contexto Suframa `[V3]` |
| D5 | Frete «AS PER AWB/HBL» | Indica dependência de conhecimento de transporte `[CRUZ]` |

---

### E) Semântica do item (significado da mercadoria) `[V2]` + `[V3]`

| # | Verificação | Exemplo |
|---|-------------|---------|
| E1 | Descrição sem NCM | «PORTEIRO IPR1010MI…» sem código → alerta classificação pendente |
| E2 | Descrição EN vs PT | EN preenchida, PT vazia com importador BR |
| E3 | Descrição vs NCM oficial | `[V3]` texto do item vs `descricao_ncm` Siscomex |
| E4 | Capítulo NCM sugerido | `[V3]` quando descrição indica família de produto mas NCM ausente/errado |
| E5 | Part number órfão | Part number sem descrição ou sem NCM |

---

### F) Risco documental (termos que exigem outros documentos) `[V2]` + `[CRUZ]`

| # | Verificação | Exemplo |
|---|-------------|---------|
| F1 | Pagamento atrelado a BL/AWB | «T/T 90 days from BL/AWB» sem BL nem AWB na leitura |
| F2 | Incoterm exige frete/seguro explícito | CIF/CFR sem valor de frete/seguro na invoice |
| F3 | Referência cruzada a PO/contrato | `poNumber` sem contexto em outros docs |
| F4 | Número invoice = número PL/BL | `[CRUZ]` divergência de referência entre documentos |
| F5 | Assinatura | `isSigned` false em doc que exige assinatura para despacho |

---

### G) Qualidade da extração (JSON vs realidade) `[PDF]` + `[V2]`

| # | Verificação |
|---|-------------|
| G1 | Valor no JSON ≠ texto visível no PDF (campo a campo crítico) |
| G2 | Campo visível no PDF ausente no JSON |
| G3 | Tipo de documento lido ≠ título no PDF |
| G4 | Quantidade de itens no PDF ≠ `items_quantity` / linhas no JSON |
| G5 | Moeda/símbolo no PDF ≠ `currency.type` |

---

### H) Código aduaneiro e normas `[V3]`

| # | Verificação | Fonte |
|---|-------------|-------|
| H1 | NCM existe na tabela Siscomex | Cadastros `buscar_ncm` |
| H2 | NCM ativo no Portal Único | Cadastros `validar_ncm` |
| H3 | Descrição oficial NCM vs item | Cadastros + LLM |
| H4 | Alíquotas II / IPI / PIS / COFINS do NCM | Cadastros `ii_ncm`, `ipi_ncm`, `pis_ncm`, `cofins_ncm` |
| H5 | Incoterm — responsabilidade frete/seguro e impacto no VA | RAG `financeiro-comex` / `simula-custo` |
| H6 | Importador Manaus/AM — Suframa/ZFM | RAG + `importer.city`, `importer.state` |
| H7 | Origem / preferência tarifária | RAG + países do cabeçalho e itens |
| H8 | Checklist campos para DI/DUIMP | RAG `nf-importacao` |
| H9 | Citação obrigatória em card normativo | `citacoes_normativas[]` — sem fonte, card descartado |

**Fora do escopo V3 inicial:** antidumping, LPCO por NCM, parecer vinculante, corpus DOU integral.

---

### I) Cruzamento entre documentos da leitura `[V1]` + `[CRUZ]`

| # | Verificação |
|---|-------------|
| I1 | Incoterm Invoice = Incoterm PL / BL / AWB |
| I2 | NCMs Invoice = NCMs PL |
| I3 | Pesos/volumes Invoice ≈ PL |
| I4 | Exportador/importador consistentes entre docs |
| I5 | Referências (invoice number, PO) alinhadas |
| I6 | Valores totais comerciais sem divergência grave |

---

### J) Sob demanda — Consultor Inteligente `[QA]`

Perguntas que usam o **mesmo JSON + tools + RAG**, em modo chat:

- «O que falta para o despacho?»
- «Há inconsistência entre as partes (exportador/importador)?»
- «Resumo dos riscos desta invoice»
- «Relatório comparativo dos documentos»
- «Campos em conflito entre documentos»
- «Valores totais de cada documento»
- «Comparar datas entre documentos»

---

### K) Exemplo aplicado — `INVOICE77.pdf` (teste completo)

**Dados salientes:** EXW + HK · importador Intelbras Manaus/AM · CNPJ `82.901.000/0015-22` · item «PORTEIRO IPR1010MI» · qty 10000 × 0,16 = 1600 USD · **NCM vazio** · pagamento «T/T 90 days from BL/AWB» · PL na mesma leitura.

| # | Sev. | Achado esperado | Camada |
|---|------|-----------------|--------|
| K1 | Crítico | NCM não identificado nos itens | A4 |
| K2 | Atenção | NCM com formato suspeito (se lido parcial, ex. «7606») | A5 |
| K3 | Atenção | Descrição EN sem NCM — classificação pendente | E1 |
| K4 | Atenção | Descrição PT vazia (importador BR) | E2 |
| K5 | Atenção | Pagamento «90 days from BL/AWB» sem BL/AWB na leitura | F1 |
| K6 | Atenção | EXW Hong Kong — frete/seguro por conta do importador | H5 |
| K7 | Informativo | Importador Manaus/AM — verificar Suframa | H6 |
| K8 | Informativo | Exportador sem Tax ID | B6, D3 |
| K9 | Informativo | Origem China vs proveniência Hong Kong | C7, H7 |
| K10 | Informativo | País/fabricante/origem do item vazios | B9 |
| K11 | — | C1/C2: 10000×0,16=1600 ✓ (sem card) | C1 |
| K12 | — | Incoterm EXW presente ✓ | A1 |
| K13 | — | CNPJ válido ✓ | A2, A3 |

**Produção hoje (só V1):** K1, K2 (se NCM parcial), mais I1/I2 se PL presente.

---

### L) Merge e responsabilidades por camada

```text
[V1] TypeScript puro     → A1–A7, parte de I*
[V2] LLM + JSON (+ PDF)  → B*, C*, D*, E1–E2, F*, G*
[V3] Tools + RAG         → E3–E4, H*, enriquece D4, F2, H5–H8
[QA] Chat                → J*
```

**Nunca delegar à LLM:** A3 (CNPJ), A5 (regex NCM), A7 (set equality NCM), C1–C2 (math exata preferir código).

---

## 3. Estado atual — V1 determinístico (resumo)

Implementado em `analisar-riscos-aduaneiros-leitura-smart-read.ts` — corresponde à seção **2.A** e **2.I** (parcial). Ver tabela **2.K** para gap vs teste completo.

---

## 4. Roadmap técnico (implementação)

```text
Camada A [V1] — Determinístico (hoje)
Camada B [V2] — LLM sobre documento (piloto)
Camada C [V3] — Cadastros NCM + RAG normativo
```

As três camadas **mesclam** num único `ResumoRiscosAduaneirosLeitura`.

### Contrato piloto V2/V3

- **Rota:** `POST /api/v1/smart-read/leituras/analise-riscos-llm` (BFF Smart Read)
- **Modelo:** Gemini `gemini-2.5-flash`
- **Saída:** Zod espelhando `RiscoAduaneiroLeitura[]` + `citacoes_normativas?` (V3)
- **Merge:** `[...v1, ...v2v3]` com deduplicação por título + evidência

---

## 5. Fundamentação normativa — pipeline `[V3]`

> **Princípio:** a LLM **sintetiza e explica**; a **fonte da verdade normativa** vem de **tools + RAG**, nunca só do peso do modelo.

### 5.1 Fontes de verdade no Gravity (já existentes)

| Fonte | Onde | Uso na Análise de Riscos |
|-------|------|--------------------------|
| **Tabela NCM** (Siscomex) | Cadastros `ncm_sync` · `GET /api/v1/cadastros/ncm/*` | Código existe? Descrição oficial? Alíquotas II/IPI/PIS/COFINS |
| **Validação NCM Portal** | Cadastros `validarNcm` | NCM ativo/inativo no Portal Único |
| **Incoterm, País, Moeda** | Cadastros (master data) | Leitura ao vivo — ver [cadastros-snapshot-policy](../../../skills/governanca/lei/cadastros-snapshot-policy/SKILL.md) |
| **Base COMEX Gravity** | Gabi `knowledge/` + RAG pgvector | RN de negócio, fluxos DI/DUIMP, landed cost, regras de VA |
| **Segmentos RAG** | `gabi/server/knowledge/segments/*.txt` | `nf-importacao`, `financeiro-comex`, `simula-custo`, etc. |

Smart Read **não duplica** a tabela NCM nem a KB inteira — **consome** Cadastros (REST S2S) e, na V3, **chunks RAG** via serviço Gabi ou pipeline enxuto próprio no BFF.

### 5.2 Pipeline recomendado (retrieve → tools → generate)

```text
1. Extrair entidades da leitura (NCMs, Incoterm, países, CNPJ, descrições, valores)
2. Para cada NCM → tool buscar_ncm(codigo) + validar_ncm_portal(codigo)
3. Montar queries RAG a partir das entidades:
     "NCM 84713012 classificação requisitos importação"
     "Incoterm EXW responsabilidades frete seguro importador Brasil"
     "importador Manaus AM Suframa documentação"
4. Recuperar top-K chunks (embedding + pgvector, padrão Gabi ingest)
5. Prompt estruturado: JSON extraído + resultados tools + chunks com [fonte, seção]
6. LLM devolve riscos APENAS se citar evidência recuperada ou dado do tool
7. Pós-validação: descartar risco sem `citacao_normativa` ou `evidencias` válidas
```

### 5.3 Exemplos de análise normativa ativa

| Cenário | Tool / RAG | Risco possível |
|---------|------------|----------------|
| NCM lido vs descrição do item | `buscar_ncm` + similaridade descrição | «NCM pode não corresponder à mercadoria descrita» |
| NCM inexistente / inativo | `validar_ncm_portal` | Crítico — código não vigente no Siscomex |
| Importador Manaus (AM) | RAG Suframa/ZFM + dados invoice | Informativo — verificar benefício / documentação adicional |
| Incoterm FOB/CIF/EXW | RAG + master Incoterm | Atenção — responsabilidade frete/seguro vs valor aduaneiro |
| País origem ≠ exportador | JSON + RAG origem preferencial | Atenção — consistência para preferência tarifária |
| Alíquota II alta no NCM | `buscar_ncm` (ii_ncm) | Informativo — impacto fiscal estimado (sem calcular imposto) |
| Campos para DI/DUIMP | RAG checklist documental | Completude normativa (não só comercial) |

### 5.4 Campo novo no contrato (V3)

Estender `RiscoAduaneiroLeitura` com citação rastreável:

```typescript
type CitacaoNormativaRisco = {
  tipo: 'ncm_oficial' | 'kb_gravity' | 'instrucao_normativa' | 'portal_unico'
  referencia: string   // ex.: "NCM 8471.30.12", "RN-003 Financeiro-COMEX", "IN RFB nº ..."
  trecho?: string      // excerpt curto do chunk ou descrição NCM
}

// Em RiscoAduaneiroLeitura:
citacoes_normativas?: CitacaoNormativaRisco[]
```

Regra: card com `categoria: 'normativo'` **exige** ao menos uma `citacao_normativa` — senão não entra na lista (anti-alucinação).

### 5.5 O que ainda não está no monorepo (escalar ao Coordenador)

| Necessidade | Situação |
|-------------|----------|
| Antidumping / medidas compensatórias por NCM | Não modelado em Cadastros hoje |
| Tratamentos administrativos LPCO por NCM | Fora do escopo Smart Read V3 inicial |
| Corpus legal completo (DOU, INs atualizadas diariamente) | Usar RAG curado (Gabi KB) + links externos; ingestão DOU é projeto separado |
| Parecer vinculante | **Fora de escopo** — produto é alerta, não despachante |

---

## 6. Integração com Consultor Inteligente (aba 2)

| Aba | Papel |
|-----|-------|
| **Análise de Riscos** | Proativa — roda ao abrir a aba / ao concluir análise; lista fixa de achados |
| **Consultor Inteligente** | Reativa — usuário pergunta; mesma base (JSON + tools + RAG) em modo chat |

Compartilhar: prompt system, tools Cadastros, retrieval RAG, schema Zod de resposta. Evitar dois prompts divergentes.

---

## 7. Segurança e governança

- Rotas LLM: JWT Clerk + `id_organizacao`; nunca enviar PDF para modelo sem passar pelo BFF
- `x-chave-interna-servico` em chamadas Smart Read → Cadastros / Gabi
- Log de auditoria: `id_leitura`, chunks usados, modelo, timestamp (observabilidade mínima)
- Validar resposta LLM com Zod — **proibido** `z.any()` no contrato de riscos (Mandamento 09)
- Isolamento: análise só dos arquivos da leitura da organização corrente

---

## 8. Ordem de implementação sugerida

| Fase | Entrega | Dependência |
|------|---------|-------------|
| **V2a** | Endpoint LLM só JSON (invoice) + merge V1 | `GEMINI_API_KEY` no BFF Smart Read |
| **V2b** | PDF opcional na mesma rota | Blob na sessão wizard |
| **V3a** | Tool `buscar_ncm` + `validar_ncm` antes do prompt | Cadastros S2S |
| **V3b** | RAG segmentos COMEX (top-K chunks por NCM/Incoterm) | Gabi ingest ou cópia enxuta |
| **V3c** | `citacoes_normativas` na UI + categoria `normativo` | Design card evidência |

---

## 9. Referências cruzadas

| Documento | Relação |
|-----------|---------|
| [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) | Origem do `resultado_extracao` (DATI → BFF → snapshot) |
| [cadastros-snapshot-policy](../../../skills/governanca/lei/cadastros-snapshot-policy/SKILL.md) | NCM/Incoterm = leitura ao vivo na análise |
| Gabi `server/knowledge/ingest.ts` | Pipeline RAG de referência |
| `servicos-global/cadastros/server/src/routes/ncm.ts` | API NCM + validação Portal Único |
