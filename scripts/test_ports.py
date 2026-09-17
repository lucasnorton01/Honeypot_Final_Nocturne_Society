#!/usr/bin/env python3
import socket, time
# Try SSH port
for port in [2222, 2323]:
    try:
        print(f"\n--- Probando puerto {port} ---")
        s = socket.create_connection(('127.0.0.1', port), timeout=5)
        s.settimeout(3)
        data = s.recv(4096)
        print(f'Banner ({len(data)} bytes): {data[:150]}')
        s.close()
    except Exception as e:
        print(f'Error: {e}')
