# Documentação Técnica: Fluxo de Autenticação e Navegação (Gravity)

Esta documentação detalha como o sistema lida com a autenticação de usuários e como resolvemos o problema do "Seletor Interno" do Clerk aparecendo indevidamente.

## 1. O Problema: Seletor Interno do Clerk
Anteriormente, se um usuário já autenticado visitasse a página de login (`/login`) ou se a aplicação sofresse um "flash" de carregamento, o Clerk identificava a sessão ativa e mostrava o seu próprio seletor de organizações ("Choose Organization") dentro do card de login.

Isso causava:
- **Confusão Visual:** O seletor do Clerk não segue o design system completo da Gravity.
- **Duplicidade:** O usuário escolhia uma empresa no Clerk e depois era obrigado a escolher novamente no nosso seletor customizado.

## 2. A Solução Definitiva (Blindagem de Rotas)
Implementamos uma estratégia de "Blindagem de Rotas Públicas". Agora, as rotas de autenticação são vigiadas por um guarda que impede o acesso de quem já está logado.

### Componente `PublicRoute`
Localizado em `App.tsx`, este componente envolve as rotas de login e cadastro.
```tsx
function PublicRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) return null; // Evita mostrar a tela enquanto o Clerk carrega

  return isSignedIn 
    ? <Navigate to="/selecionar-workspace" replace /> 
    : <>{children}</>;
}
```

**Principais benefícios:**
1. **Fim do Flash:** Ao checar `isLoaded`, garantimos que o componente de login nunca seja montado antes do sistema ter certeza se o usuário está logado.
2. **Redirecionamento Instantâneo:** Usuários logados que tentarem acessar `/login` são imediatamente "empurrados" para o seletor de workspaces da Gravity.

## 3. Arquitetura do Fluxo

O fluxo de autenticação está distribuído nos seguintes arquivos:

| Arquivo | Responsabilidade |
| :--- | :--- |
| `src/App.tsx` | **Controlador de Tráfego.** Define as rotas, protege áreas privadas e blinda rotas públicas. |
| `src/pages/AuthPage.tsx` | **Layout Visual.** Define o painel esquerdo (branding) e o painel direito (login). |
| `nucleo-global/login-global` | **Motor de Auth.** Componente reutilizável que faz a chamada real ao SDK do Clerk. |
| `src/pages/SelecionarWorkspace.tsx` | **Destino Pós-Login.** Nossa tela customizada para escolha da empresa. |

## 4. Como Testar
- **Logado:** Tente digitar manualmente `http://localhost:8000/login`. Você deve ser redirecionado instantaneamente para o seletor de workspaces.
- **Deslogado:** Ao acessar a raiz `/`, você deve ver a tela de login normal da Gravity.

---
*Documentação gerada em 26/03/2026 para registrar a solução do bug de redirecionamento do Clerk.*
