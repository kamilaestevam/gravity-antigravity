# Painéis da Lista — BID Frete Internacional

> **Status:** Implementado (2026-06-02) — lista cliente  
> **Contrato base:** [../pedido/PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md)  
> **id_produto_gravity:** `bid-frete-internacional`

## API

`/api/v1/bid-frete-internacional/lista/paineis`

## Migração

Na primeira carga, preferências em `localStorage` (`bid-frete-internacional:config:tabela_preferencias`) são copiadas para o painel **Principal** via PUT.

## UI

`BidFreteListaPainelBar` na visão lista de `lista-bid-frete-internacional.tsx`.
