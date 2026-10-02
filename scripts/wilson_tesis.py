"""Intervalos de confianza del 95 % de Wilson para las proporciones de la tesis.

Uso:
    python wilson.py              -> recalcula todas las proporciones de la tesis
    python wilson.py 35 39        -> una proporción concreta (k éxitos de n)

Fórmula (z = 1,96):
    centro = (p + z²/2n) / (1 + z²/n)
    semiancho = z * sqrt(p(1-p)/n + z²/4n²) / (1 + z²/n)
Se puede copiar al repo como scripts/wilson_tesis.py (ver PENDIENTES_v18.md, R-2).
"""
import sys
from math import sqrt

TESIS = [
    ("P2 lote 25/09 (eventos estructurados)", 65, 65),
    ("P3 lote 25/09 (extracción manual)", 1, 5),
    ("P4 lote 25/09", 0, 5),
    ("P3 28/09 (event_id)", 6, 10),
    ("P4 28/09 (cierre real 08:30)", 9, 10),
    ("P3 30/09 (event_id) - VEREDICTO", 6, 41),
    ("P3 30/09 (ioc_sessions, exploratoria)", 39, 41),
    ("P4 30/09 - VEREDICTO", 35, 41),
    ("Tabla II-1 (antecedente 10/09)", 9, 9),
    # escenarios de cierre de ventana (PENDIENTES M-1)
    ("P4 28/09 con cierre a 6 h (06:57 UTC)", 5, 9),
    ("P4 30/09 con fin previsto (07:53:57 UTC)", 35, 39),
]


def wilson(k, n, z=1.96):
    p = k / n
    den = 1 + z * z / n
    centro = (p + z * z / (2 * n)) / den
    semi = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return 100 * p, 100 * max(0.0, centro - semi), 100 * min(1.0, centro + semi)


def fmt(x):
    return f"{x:.1f}".replace(".", ",")


if __name__ == "__main__":
    if len(sys.argv) == 3:
        filas = [("proporción", int(sys.argv[1]), int(sys.argv[2]))]
    else:
        filas = TESIS
    for nombre, k, n in filas:
        p, lo, hi = wilson(k, n)
        print(f"{nombre:45s} {k}/{n} = {fmt(p)} %  IC 95 % [{fmt(lo)} %; {fmt(hi)} %]")
