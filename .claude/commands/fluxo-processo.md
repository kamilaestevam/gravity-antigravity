# /fluxo-processo — Atalho de referência do fluxo

> **Atalho de consulta.** Exibe somente o fluxo. Não executa nenhuma ação.

---

## REGRA ZERO — BLOQUEIO ABSOLUTO

Se a mensagem contém **`/fluxo-processo`**, o agente **NÃO PODE**:

❌ Ler arquivos  
❌ Grep / busca no codebase  
❌ Escrever ou editar código  
❌ Disparar subagentes ou ferramentas  
❌ Responder qualquer outro pedido do dono na mesma mensagem  
❌ Adicionar explicações, títulos, markdown ou qualquer texto extra  

✅ **Só** pode responder com o texto exato abaixo — **uma linha, nada mais**:

```
TST-LOC/CR/DOC/PR/DPY/TST PRO/ ENC
```
