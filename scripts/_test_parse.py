import sys, sqlite3, re
from datetime import datetime
sys.path.insert(0, 'scripts')
from generar_sqlite import parse_ts

con = sqlite3.connect('analitica/honeypot.db')
n = 0
for ts, ca in con.execute('SELECT timestamp, created_at FROM events ORDER BY id'):
    for s in (ts, ca):
        try:
            parse_ts(s)
        except Exception as ex:
            print('FALLA: %r -> %s' % (s, ex))
            n += 1
            if n > 20:
                sys.exit(0)
print('fallos:', n)