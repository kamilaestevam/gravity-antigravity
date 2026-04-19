"""
FASE 3 FRONTEND — Produto Pedido
Renomeia campos antigos nos arquivos TypeScript do cliente do produto Pedido.
"""

import re
import os

BASE = 'C:/Users/danie/gravity-antigravity/produto/pedido/client/src'
modified_files = []


def apply_renames(filepath, renames):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'NOT FOUND: {filepath}')
        return
    original = content
    for old, new in renames:
        content = re.sub(r'\b' + re.escape(old) + r'\b', new, content)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        modified_files.append(filepath)
        print(f'MODIFIED: {os.path.relpath(filepath, BASE)}')
    else:
        print(f'  (unchanged) {os.path.relpath(filepath, BASE)}')


def apply_to_dir(dirpath, renames, extensions=('.ts', '.tsx')):
    for root, dirs, files in os.walk(dirpath):
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.prisma']]
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                apply_renames(os.path.join(root, file), renames)


# ─── RENAMES ──────────────────────────────────────────────────────────────────
# Ordenados do maior para o menor para evitar substituições parciais aninhadas

PEDIDO_CLIENT_RENAMES = [
    # PedidoItem — campos de quantidade
    ('quantidade_transferida_item_pedido',   'quantidade_transferida_pedido'),
    ('quantidade_cancelada_item_pedido',     'quantidade_cancelada_pedido'),
    ('quantidade_inicial_item_pedido',       'quantidade_inicial_pedido'),
    ('saldo_item_pedido',                    'quantidade_atual_pedido'),

    # PedidoItem — campos físicos
    ('peso_liquido_unitario_item',           'peso_liquido_unitario'),
    ('peso_bruto_unitario_item',             'peso_bruto_unitario'),
    ('cubagem_unitaria_item',                'cubagem_unitaria'),

    # PedidoItem — campos de valor
    ('valor_total_itens',                    'valor_total_item'),
    ('valor_unitario_item',                  'valor_por_unidade_item'),

    # Pedido — campos de cabeçalho
    ('quantidade_total_inicial_pedido',      'quantidade_total_pedido'),
    ('condicao_pagamento_pedido',            'condicao_pagamento'),
    ('taxa_cambio_estimada_pedido',          'taxa_cambio_estimada'),

    # Pedido — datas unificadas
    ('pedido_criado_em',                     'created_at'),
    ('pedido_atualizado_em',                 'updated_at'),
    ('item_criado_em',                       'created_at'),
    ('item_atualizado_em',                   'updated_at'),

    # Processo
    ('numero_processo',                      'id_processo'),

    # ProcessoContainer
    ('numero_container',                     'container_numero'),
    ('numero_lacre',                         'container_lacre'),
    ('tipo_container',                       'container_tipo'),
]

print('\n=== FASE 3 FRONTEND — PEDIDO CLIENT ===')
apply_to_dir(BASE, PEDIDO_CLIENT_RENAMES)

print(f'\n=== TOTAL MODIFICADO: {len(modified_files)} arquivos ===')
for f in modified_files:
    print(f'  {os.path.relpath(f, BASE)}')
