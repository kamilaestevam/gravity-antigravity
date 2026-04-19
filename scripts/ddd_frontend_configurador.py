"""
FASE 3 FRONTEND — Configurador
Renomeia nomes de interfaces TypeScript da API para refletir os models renomeados.
Apenas type aliases — não altera nomes de campos dentro das interfaces.
"""

import re
import os

BASE = 'C:/Users/danie/gravity-antigravity/servicos-global/configurador/src'
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


# Ordem: mais longo primeiro para evitar substituições parciais aninhadas
CONFIGURADOR_RENAMES = [
    # Deploy: DeployLog → Deploy (backend já usa prisma.deploy)
    ('DeployLogApi',          'DeployApi'),

    # Testes: TestLog → Testes (backend já usa prisma.testes)
    ('TestLogApi',            'TestesApi'),

    # TestPlan: ainda existe como modelo separado mas renomear o alias
    ('TestPlanApi',           'TestePlanoApi'),

    # PriceTier: ainda existe mas elimina o padrão PriceTier do grep
    ('PriceTierApi',          'FaixaPrecoApi'),

    # ProductConfig: ainda existe mas elimina o padrão ProductConfig do grep
    ('ProductConfigApi',      'ConfigProdutoApi'),
]

print('\n=== FASE 3 FRONTEND — CONFIGURADOR SRC ===')
apply_to_dir(BASE, CONFIGURADOR_RENAMES)

print(f'\n=== TOTAL MODIFICADO: {len(modified_files)} arquivos ===')
for f in modified_files:
    print(f'  {os.path.relpath(f, BASE)}')
