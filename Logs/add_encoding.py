#!/usr/bin/env python3
"""Add PYTHONIOENCODING support to attack_simulator.py"""

with open('scripts/attack_simulator.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add sys.stdout.reconfigure after the imports or at the top
# Let me insert it after the docstring and imports section
# Actually, let me just add PYTHONIOENCODING environment variable handling

# Insert after the first line (shebang) or add at the very beginning if no shebang
# The script starts with #!/usr/bin/env python3, so let add after that

# Better approach: just add the reconfigure call after the imports
# Find the line with "import json" or "from datetime" and add after

lines = content.split('\n')
new_lines = []
added = False
for i, line in enumerate(lines):
    new_lines.append(line)
    # After "import json" or "import os", add the reconfigure
    if not added and line.strip().startswith('import ') and not line.strip().startswith('#'):
        if 'import' in line and not added:
            new_lines.append('    sys.stdout.reconfigure(encoding="utf-8")')
            added = True
    # Or just add after the shebang line
    if not added and line.strip() == '#!/usr/bin/env python3':
        new_lines.append('import sys')
        new_lines.append('sys.stdout.reconfigure(encoding="utf-8")')
        added = True

content = '\n'.join(new_lines)

with open('scripts/attack_simulator.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added encoding reconfigure')