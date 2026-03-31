---
description: Fluxo completo de criação e validação de novas telas (Gravity UX 10), incluindo equipe e etapas.
---

# 🎨 Workflow: Criação e Validação de Novas Telas (UX 10)

Esta diretriz (Skill) define o processo ponta a ponta para a criação de interfaces na Plataforma Gravity. Nenhuma nova tela entra em produção sem passar pelo funil de excelência e pelos crivos rigorosos do nosso design system global.

A expectativa para qualquer nova interface é que ela entregue uma experiência visual **Premium (UX 10)**, utilizando glassmorphism, tipografias ajustadas e micro-interações que passem uma percepção imediata de alto valor ao usuário.

## 👥 A Equipe de Elite (Papéis na Criação)

Cada nova funcionalidade visual exige a colaboração sistêmica dos seguintes papéis operacionais:
1. **Product Manager (PM):** Define a visão de negócio, as necessidades do cliente (Tenant/Company) e o escopo esperado para a jornada do usuário.
2. **UX/UI Lead:** Evocador do Padrão "UX 10". Responsável pela arquitetura da informação, fidelidade visual, especificação de micro-interações (glow, sombras translúcidas, glass) e coerência com a harmonia da plataforma Gravity.
3. **Engenheiro Frontend / Arquiteto UI:** Transforma os construtos do UX em código eficiente e escalável, utilizando o design system base (`@nucleo` e `@gravity/shell`).
4. **Tech Lead:** Valida as integrações rest, as nuances do GraphQL/Prisma, estados atípicos (carregando, erro limite de API), e a eficiência da árvore de renderização.

## ⚙️ As 5 Etapas de Criação e Validação

### Fase 1: Entendimento e Plantas-Baixas (UX Research & Discovery)
- Validamos o insumo do PM com os casos de uso.
- **Pergunta Chave:** Qual o problema central? Quais os módulos envolvidos (HUB, Store, Configurador)?
- **Prototipação:** Rabiscos mentais ou wireframes focados na hierarquia: Qual será a Hero Section? Como lidar com Listas vs Grids? Quais são as métricas principais a destacar no topo?

### Fase 2: Aplicação do Design System (Standard High-Fidelity)
Neste momento a engenharia une-se à concepção visual:
- O background nunca deve utilizar brancos duros em temas escuros (`var(--color-surface)` indiscriminado). Deve-se aplicar variações sutis e backgrounds radiantes invisíveis (`radial-gradient`), como o ambient-glow.
- **Glassmorphism & Micro-interações:** Qualquer badge, Card de Produto ou botão primário deve oferecer resposta profunda de física (levitação com `translateY`, troca de bordas opacas para bordas luminosas `rgba`).
- **Tipografia Escalonada:** Títulos ganham gradientes prateados sutis (`background-clip: text`) para transmitir requinte. Números de dashboards devem ser imponentes.

### Fase 3: Estruturação Modular (O Código Frontend)
- A adesão aos layouts bases do design system é mandatória. **O uso da `PaginaGlobal` e do `CabecalhoGlobal` é obrigatório** caso a interface represente uma tela ou área logada dentro do Configurador.
- **Menu e Header System:** Barra superior (UsuarioGlobal, Notificações, Buscar) e Menus laterais (MenuLateralGlobal) devem vir empacotados pelo Shell/WorkspaceLayout; eles não podem ser reconstruídos por tela.
- Nada de invólucros aleatórios para listagens: utilize fatias padronizadas como a `TabelaGlobal`, `CardBasicoGlobal` ou Componentes de Grade com hover premium já consolidados (`.hs-product-grid`).

### Fase 4: Implementação, Tratamentos & Fallbacks
- A tela é escrita no código.
- **Empty States (Estados Vazios):** Uma tela sem dados jamais deve ser frustrante. O Empty State UX 10 é envolvente (ex: background semi-transparente curvo com outline desvanecido, ícones gigantes opacos `0.2` e chamadas instigantes).
- **Loading States:** Abandone saltos bruscos ou páginas brancas de loading. Substitua pela indicação visual em `.hs-spin` ou Skeleton preload.
- Tratamento de erro elegante obrigatoriamente ligado ao `ToastContainer` do Shell Global.

### Fase 5: Validação Final e QA (Quality Assurance)
Antes de realizar o push para Master, aplique o seguinte checklist de 4 vias:

- [ ] **1. Verificação de Consistência e Layout:** As margens laterais e top paddings estão respeitando 100% as definições das outras páginas (Padrão de layout/paginação)? A página respira?
- [ ] **2. Teste de Tooltips (Dicas de UX):** A interface implementa as caixas do `TooltipGlobal` que exibem detalhes explicativos caso o usuário ative a ajuda na engrenagem? 
- [ ] **3. Hardcodes Zerados:** Removeu todas as cores de hexadecimais puros que não são padrão? Garantiu uso dos tokens CSS como `var(--ws-accent)`, `var(--color-text-muted)`?
- [ ] **4. Comportamento Real-Time:** Os fluxos assíncronos não quebram o visual dinamicamente? Animações fluem em suaves `<300ms` cúbicos (`cubic-bezier`)?

---

> **Diretiva Imutável do Agente:** Esta formatação de processo (SKILL) deve ser acionada sempre que uma nova tela for demandada do zero (ex: *"Crie o dashboard da funcionalidade X" ou "Adeque a tela de relatórios"*). Use as guidelines listadas aqui para arquitetar as soluções sem desvios do refinamento UX 10.
