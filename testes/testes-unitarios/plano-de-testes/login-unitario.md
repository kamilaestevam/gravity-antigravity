# 📋 Log de Execução: QA Auditor (Unitário - ULTIMATE)
**Documento Auditado:** `testes-unitarios/login-unitario.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** Login (Portal de Acesso)
- **Ambiente:** [x] Teste  | [ ] Produção
- **Local do Teste:** Logica de Código & Configuração (Vitest)
- **Tipo de Teste:** [x] Unitário | [ ] Funcional | [ ] E2E 
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Analise (Nível de Excelência Máxima)

#### 1. Design System & Tokens (Clerk Appearance)
- [ ] **L-U01**: As cores (`colorPrimary`, `colorBackground`, `colorInputBackground`, `colorInputText`, `colorText`, `colorTextSecondary`, `colorNeutral`) estão rigorosamente conforme os hexadecimais?
- [ ] **L-U02**: A tipografia (`fontFamily`) está injetada como `'Plus Jakarta Sans', sans-serif`?
- [ ] **L-U03**: O `borderRadius` do card está fixado em `8px`?
- [ ] **L-U04**: O `boxShadow` do card possui as duas camadas (depth + glow) com valores exatos de `rgba`?
- [ ] **L-U05**: O `dividerLine` possui a cor `rgba(255,255,255,0.08)` para transparência sutil?
- [ ] **L-U06**: O `dividerText` está configurado com `textTransform: 'uppercase'` e peso `600`?
- [ ] **L-U07**: O `formButtonPrimary` possui o gradiente/sombra `0 4px 14px 0 rgba(99, 102, 241, 0.39)`?
- [ ] **L-U08**: O `formFieldLabel` possui cor `#94a3b8` e margem inferior de `4px`?
- [ ] **L-U09**: O `formFieldRow` está configurado para `flexDirection: 'column'` e gap de `0.75rem`?

#### 2. Comportamento e Micro-Estilos (Transições)
- [ ] **L-U10**: O `socialButtonsBlockButton` possui border de `1.5px` e `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`?
- [ ] **L-U11**: O `socialButtonsBlockButtonBadge` possui posição `absolute`, `fontWeight: '800'`, `padding: '2px 8px'` e `top: '6px'`, `right: '8px'`?
- [ ] **L-U12**: A base do `card` possui `overflow: 'visible'` para permitir as sombras de elevação?

#### 3. Auditoria de Semântica e Acessibilidade (WCAG)
- [ ] **L-U13**: Os textos de Título (`h1` equivalente) e Subtítulo usam as classes corretas (`login-global-title`/`-subtitle`)?
- [ ] **L-U14**: O rodapé utiliza a tag semântica de parágrafo `<p>` com as classes `login-footer-main` e `-secondary`?
- [ ] **L-U15**: O link social possui o atributo `rel="noreferrer"` ao apontar para o `localhost:8002`?

#### 4. Lógica de Roteamento e Props do Clerk
- [ ] **L-U16**: A função detecta corretamente se é Sign-Up verificando `includes('/sign-up')` no path?
- [ ] **L-U17**: O componente `SignIn` possui as props fundamentais injetadas: `routing="hash"`, `afterSignInUrl="/hub"`, `signUpUrl="/sign-up"`?
- [ ] **L-U18**: O componente `SignUp` possui as props fundamentais injetadas: `routing="hash"`, `afterSignUpUrl="/trial"`, `signInUrl="/sign-in"`?
- [ ] **L-U19**: Os textos alternam via operador ternário sem falhas de renderização?

#### 5. Clean Code & Performance
- [ ] **L-U20**: Não existem `console.logs` remanescentes ou comentários de debug no arquivo?
- [ ] **L-U21**: A tipagem do `clerkAppearance` está forçada para `as any` ou possui interface de tipo robusta (Clerk.Appearance)?

---

### 📊 Resultado Final:
[ ] **APROVADO** | [ ] **REPROVADO** | [ ] **RESSALVAS**
