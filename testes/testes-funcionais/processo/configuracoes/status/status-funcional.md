# 📋 Log de Execução: QA Auditor (Funcional - ULTIMATE)
**Documento Auditado:** `testes-funcionais/processo/configuracoes/status/status-funcional.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** Processo / Configurações / Status do Processo
- **Ambiente:** [x] Teste  | [ ] Produção
- **Local do Teste:** Componente & Integração (React DOM via jsdom)
- **Tipo de Teste:** [ ] Unitário | [x] Funcional | [ ] E2E
- **Data do Teste:** 31/05/2026
- **Hora do Teste:** 12:55

---

### ✅ Check-list de Análise (Experiência do Usuário & Interação)

#### 1. Renderização Inicial
- [x] **STATUS-F01**: Página renderiza com título "Status do Processo"
- [x] **STATUS-F02**: 5 status mockados aparecem na lista (Rascunho, Aberto, Em Embarque, Em Desembaraço, Concluído)
- [x] **STATUS-F03**: Cada status tem nome em input editável
- [x] **STATUS-F04**: Cada status mostra pill com contagem de regras correta
- [x] **STATUS-F05**: Botão "+ Novo Status" presente e visível
- [x] **STATUS-F06**: Subtítulo descritivo presente

#### 2. Interação com Rule Editor — Expandir/Recolher
- [x] **STATUS-F07**: Click no pencil expande o rule editor
- [x] **STATUS-F08**: Editor recolhido por padrão (não visível até clicar pencil)
- [x] **STATUS-F09**: Editor exibe regras existentes do status
- [x] **STATUS-F10**: Editor exibe toggle "E (todas)" / "OU (qualquer uma)"

#### 3. Painel GABI — Estado VÁLIDO
- [x] **STATUS-F11**: Rascunho expandido → GABI exibe "REGRAS VÁLIDAS"
- [x] **STATUS-F12**: data-state="ok" no painel GABI
- [x] **STATUS-F13**: Mensagem orientativa "Clique em Salvar para aplicar"
- [x] **STATUS-F14**: Cor verde no painel (background + border + texto)

#### 4. Painel GABI — Erro de Tipo × Condição
- [x] **STATUS-F15**: Trocar `vazio` → `maior_que` em campo texto: GABI vira VERMELHO
- [x] **STATUS-F16**: data-state="erro" no painel GABI
- [x] **STATUS-F17**: Mensagem inclui "não funciona em campo de texto"
- [x] **STATUS-F18**: `contem` em campo texto → válido (texto aceita)

#### 5. Painel GABI — Valor Ausente
- [x] **STATUS-F19**: `igual` sem valor → GABI VERMELHO com "valor de comparação"
- [x] **STATUS-F20**: Preencher valor → GABI volta a VERDE
- [x] **STATUS-F21**: Input de valor só aparece para condições que precisam

#### 6. Painel GABI — Conflito Lógico no AND
- [x] **STATUS-F22**: Adicionar regra com mesmo campo + condição oposta → GABI VERMELHO conflito
- [x] **STATUS-F23**: Mensagem inclui `"vazio" E "preenchido"`
- [x] **STATUS-F24**: Trocar para modo OR → GABI volta a VERDE

#### 7. Barra Sticky de Salvar (Dirty State)
- [x] **STATUS-F25**: Estado limpo → barra "Alterações não salvas" oculta
- [x] **STATUS-F26**: Editar nome → barra aparece
- [x] **STATUS-F27**: Botão "Salvar" presente quando dirty
- [x] **STATUS-F28**: Botão "Restaurar padrão" presente quando dirty

#### 8. Adicionar/Remover Regras
- [x] **STATUS-F29**: Botão "+ Adicionar regra" cria nova regra com defaults
- [x] **STATUS-F30**: Botão X individual remove regra
- [x] **STATUS-F31**: Trocar `origem` ressetia `campo` para o primeiro do catálogo

#### 9. Acessibilidade DOM
- [x] **STATUS-F32**: data-testid="status-pagina" no root
- [x] **STATUS-F33**: data-testid="status-row-${id}" em cada linha
- [x] **STATUS-F34**: data-testid="gabi-painel" com data-state correto

#### 10. Isolamento de Testes
- [x] **STATUS-F35**: `afterEach(cleanup)` previne vazamento de estado
- [x] **STATUS-F36**: Cada teste renderiza componente fresh
- [x] **STATUS-F37**: Mocks de estado não persistem entre testes

---

### 📊 Resultado Final:
[x] **APROVADO** | [ ] **REPROVADO** | [ ] **RESSALVAS**

**Cobertura:** 10 testes funcionais cobrindo 37 itens da checklist via Testing Library + jsdom.
**Execução:** `npx vitest run testes/testes-funcionais/processo` — passa em ~500ms.
