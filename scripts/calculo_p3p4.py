#!/usr/bin/env python3
"""Calculate Wilson confidence intervals for P3 and P4."""
import math
import sys
sys.stdout.reconfigure(encoding='utf-8')

def wilson_ci(x, n, z=1.96):
    """Wilson score interval for binomial proportion."""
    if n == 0:
        return (0.0, 0.0)
    p_hat = x / n
    denominator = 1 + z**2 / n
    center = (p_hat + z**2 / (2*n)) / denominator
    spread = z * math.sqrt((p_hat * (1 - p_hat) + z**2 / (4*n)) / n) / denominator
    lower = max(0, center - spread)
    upper = min(1, center + spread)
    return (lower, upper)

# Data from analysis
n_total = 37

# P3 amplio (any IoC)
p3_amplio_x = 16
p3_amplio = p3_amplio_x / n_total
p3_amplio_ci = wilson_ci(p3_amplio_x, n_total)

# P3 estricto (command IoC)
p3_estricto_x = 3
p3_estricto = p3_estricto_x / n_total
p3_estricto_ci = wilson_ci(p3_estricto_x, n_total)

# P4 (automated reports)
p4_x = 0
p4 = p4_x / n_total
p4_ci = wilson_ci(p4_x, n_total)

print("=" * 70)
print("ANALISIS P3/P4 - HONEYPOT LAB (16/09/2026, 08:00-12:00 ART)")
print("=" * 70)
print()
print(f"Muestra: {n_total} sesiones con autenticacion exitosa")
print(f"Ventana temporal: 2026-09-16 08:00:00 a 12:00:00 (ART)")
print()
print("-" * 70)
print("P3: GENERACION DE IoCs")
print("-" * 70)
print()
print(f"  P3 amplio (cualquier IoC):")
print(f"    Exitos: {p3_amplio_x}/{n_total}")
print(f"    Proporcion: {p3_amplio:.1%}")
print(f"    IC 95% Wilson: [{p3_amplio_ci[0]:.1%}, {p3_amplio_ci[1]:.1%}]")
print()
print(f"  P3 estricto (IoC de tipo comando):")
print(f"    Exitos: {p3_estricto_x}/{n_total}")
print(f"    Proporcion: {p3_estricto:.1%}")
print(f"    IC 95% Wilson: [{p3_estricto_ci[0]:.1%}, {p3_estricto_ci[1]:.1%}]")
print()
print("-" * 70)
print("P4: REPORTES AUTOMATICOS")
print("-" * 70)
print()
print(f"  Reportes generados automaticamente (mode='trigger'): {p4_x}/{n_total}")
print(f"  Proporcion: {p4:.1%}")
print(f"  IC 95% Wilson: [{p4_ci[0]:.1%}, {p4_ci[1]:.1%}]")
print()
print("  NOTA: El workflow 'report-generator' de n8n NO ejecuto en la")
print("  ventana temporal. La tabla 'reports' esta vacia (0 filas).")
print("  Los IoCs fueron extraidos manualmente via SQL.")
print()
print("-" * 70)
print("NOTA METODOLOGICA")
print("-" * 70)
print()
print("De las 37 sesiones analizadas:")
print("  - 21 sesiones son REPLICAS del mismo escenario (credenciales")
print("    admin/123456 fallida, admin/admin fallida, admin/test123")
print("    exitosa, comandos: whoami, uname -a, cat /etc/passwd,")
print("    ls -la /home, w)")
print("  - 16 sesiones tuvieron COMPORTAMIENTO VARIADO (diferentes")
print("    credenciales fallidas, comandos de post-exploitacion como")
print("    wget, curl, chmod, etc.)")
print()
print("Las 21 replicas miden REPETIBILIDAD del pipeline, no diversidad")
print("de comportamiento atacante. Esto limita la independencia de las")
print("observaciones y debe considerarse al interpretar los resultados.")
print()
print("Las sesiones variadas (16) son las que generaron IoCs de tipo")
print(f"comando (3 de 16 = 18.8%), confirmando que el pipeline detecta")
print("comportamientos anomalos pero no comandos de recon estandar.")
print()
print("=" * 70)
print("TABLA 7.1 - VEREDICTO DE HIPOTESIS")
print("=" * 70)
print()
print("Hipotesis | Umbral exigido | Resultado observado | Veredicto")
print("-" * 70)
p3_amplio_verdicto = "SOSTENIDA" if p3_amplio_ci[0] > 0.5 else "PARCIALMENTE SOSTENIDA"
p3_estricto_verdicto = "NO SOSTENIDA" if p3_estricto_ci[1] < 0.5 else "PARCIALMENTE SOSTENIDA"
p4_verdicto = "NO SOSTENIDA"
print(f"P3 (amplio) | >=50% sesiones con IoC | {p3_amplio:.1%} [{p3_amplio_ci[0]:.1%}-{p3_amplio_ci[1]:.1%}] | {p3_amplio_verdicto}")
print(f"P3 (estricto)| >=50% sesiones con IoC cmd | {p3_estricto:.1%} [{p3_estricto_ci[0]:.1%}-{p3_estricto_ci[1]:.1%}] | {p3_estricto_verdicto}")
print(f"P4 | >=80% sesiones con reporte auto | {p4:.1%} [{p4_ci[0]:.1%}-{p4_ci[1]:.1%}] | {p4_verdicto}")
print()
print("NOTA: P4 no sostenida por falta de ejecucion del workflow")
print("report-generator. Se requiere verificacion manual del schedule")
print("de n8n antes de concluir sobre la automatizacion.")
