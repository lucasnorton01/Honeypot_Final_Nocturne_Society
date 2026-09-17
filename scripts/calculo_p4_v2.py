#!/usr/bin/env python3
"""P4 calculation with Wilson CI for new attack window."""
import math, sys
sys.stdout.reconfigure(encoding='utf-8')

def wilson_ci(x, n, z=1.96):
    if n == 0: return (0.0, 0.0)
    p = x / n
    d = 1 + z**2 / n
    c = (p + z**2 / (2*n)) / d
    s = z * math.sqrt((p*(1-p) + z**2/(4*n)) / n) / d
    return (max(0, c-s), min(1, c+s))

# P4 data
n = 6    # sessions with login.success in window
x = 6    # covered by reports
p4 = x / n
p4_ci = wilson_ci(x, n)

print("=" * 60)
print("  P4 RECALCULADO - VENTANA NUEVA")
print("  2026-09-16 15:30:00 a 15:55:00 UTC")
print("=" * 60)
print()
print(f"  Sesiones con login.success: {n}")
print(f"  Cubiertas por reporte auto: {x}")
print(f"  P4 = {x}/{n} = {p4:.1%}")
print(f"  IC 95% Wilson: [{p4_ci[0]:.1%}, {p4_ci[1]:.1%}]")
print()

if p4_ci[0] > 0.8:
    verdict = "SOSTENIDA"
elif p4_ci[1] >= 0.8:
    verdict = "PARCIALMENTE SOSTENIDA"
else:
    verdict = "NO SOSTENIDA"

print(f"  Veredicto: {verdict} (umbral >= 80%)")
