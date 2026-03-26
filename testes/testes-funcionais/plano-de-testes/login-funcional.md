# 📋 Log de Execução: QA Auditor (Funcional - ULTIMATE)
**Documento Auditado:** `testes-funcionais/login-functional.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** Login (Portal de Acesso)
- **Ambiente:** [ ] Teste  | [x] Produção (Staging)
- **Local do Teste:** Componente & Integração (React DOM)
- **Tipo de Teste:** [ ] Unitário | [x] Funcional | [ ] E2E 
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Analise (Experiência do Usuário & Interação)

#### 1. Navegação de Estado & Fluxo de Tela
- [ ] **L-F01**: Ao clicar em "Registre-se" no rodapé, o componente altera para modo `Sign-Up` sem recarregar a página (Navegação SPA)?
- [ ] **L-F02**: O título muda instantaneamente de "Acessar a plataforma" para "Criar sua conta"?
- [ ] **L-F03**: Ao trocar de modo, o subtítulo descritivo altera para refletir o novo objetivo?
- [ ] **L-F04**: O link de alternância no rodapé ("Registre-se" vs "Entrar") mantém os estilos e pesos de fonte corretos?
- [ ] **L-F05**: A mensagem secundária do rodapé ("Novo por aqui?" vs "Já conhece a plataforma?") alterna corretamente conforme a rota?

#### 2. Interações "Alive & Premium" (Design Ativo)
- [ ] **L-F06**: Ao passar o mouse nos botões sociais, ocorre a transformação `translateY(-1px)` com suavidade (Cubic-Bezier)?
- [ ] **L-F07**: O `Box-Shadow` dos botões sociais ganha intensidade ou muda de cor no estado de `hover`?
- [ ] **L-F08**: O Badge roxo sobre os botões sociais permanece sempre visível e legível em todas as interações?
- [ ] **L-F09**: O botão primário (Continuar) exibe a transição de cor e sombra ao ser focado ou clicado?
- [ ] **L-F10**: O divisor central apresenta o texto "OU" perfeitamente centralizado e com a tipografia Uppercase configurada?

#### 3. Conectividade & Redirecionamentos Externos
- [ ] **L-F11**: O link institucional (`localhost:8002`) abre em uma nova aba (`_blank`)?
- [ ] **L-F12**: Clicar no link de marketing não interrompe a sessão atual do Clerk (Teste de isolamento)?
- [ ] **L-F13**: Todos os links possuem o atributo `aria-label` ou texto descritivo para leitores de tela?

#### 4. Responsividade & Layout Adaptativo
- [ ] **L-F14**: Em resoluções móveis (375px), o padding lateral de `login-global-panel` impede que o card encoste nas bordas?
- [ ] **L-F15**: O cabeçalho mantém a hierarquia visual sem quebras de linha indesejadas em telas pequenas?
- [ ] **L-F16**: O rodapé permanece fixo na base do grid do painel ou segue o fluxo de scroll em telas curtas?

#### 5. Teclado & Acessibilidade Prática
- [ ] **L-F17**: É possível navegar entre os campos de e-mail e botões sociais usando apenas a tecla `Tab`?
- [ ] **L-F18**: O foco visual (outline/glow) é visível ao navegar via teclado para garantir a acessibilidade?

---

### 📊 Resultado Final:
[ ] **APROVADO** | [ ] **REPROVADO** | [ ] **RESSALVAS**
