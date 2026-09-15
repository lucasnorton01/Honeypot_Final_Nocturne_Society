#!/usr/bin/env python3
"""Fix the attack_simulator.py to indicate completion or acknowledgment: Replace Unicode box-drawing characters with ASCII"""

import re

with open('scripts/attack_simulator.py', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

# Replace the report header Unicode box with ASCII
old1 = """  ╔═════════════════════════════════════════════╗
  ║       HONEYPOT LAB - REPORTE DE ATAQUE       ║
  ║       {TIMESTAMP.replace('_', ' ')}             ║
  ╚══════════════════════════════════════════════╝"""

new1 = """  +------------------------------------------------+
  |       HONEYPOT LAB - REPORTE DE ATAQUE       |
  |       {TIMESTAMP.replace('_', ' ')}             |
  +------------------------------------------------+"""

content = content.replace(old1, old1)  # skip - won't match exactly

# Actually, let me just replace character by character
content = content.replace('╔', '+')
content = content.replace('═', '-')
content = content.replace('╗', '+')
content = content.replace('║', '|')
content = content.replace('╚', '+')
content = content.replace('╝', '+')

# Replace the separator lines too
content = content.replace('╔═════════════════════', '+----------------------------------------------------------------------')
content = content.replace('║', '|')
content = content.replace('╚', '+')
content = content.replace('╝', '+')

with open('scripts/attack_simulator.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed')