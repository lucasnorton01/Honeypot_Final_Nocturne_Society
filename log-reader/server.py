#!/usr/bin/env python3
"""Servidor HTTP minimal que lee cowrie.json y lo devuelve como JSON"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

COWRIE_LOG = os.environ.get("COWRIE_LOG", "/cowrie/var/log/cowrie/cowrie.json")


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path == "/events":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            try:
                n = int(params.get("n", ["50"])[0])
            except ValueError:
                n = 50

            try:
                with open(COWRIE_LOG) as f:
                    lines = f.readlines()
            except FileNotFoundError:
                self.wfile.write(json.dumps({"error": "Log file not found"}).encode())
                return

            events = []
            for line in lines[-n:]:
                line = line.strip()
                if line:
                    try:
                        events.append(json.loads(line))
                    except json.JSONDecodeError:
                        events.append({"raw": line})

            self.wfile.write(json.dumps(events, indent=2).encode())

        elif parsed.path == "/report":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            try:
                with open(COWRIE_LOG) as f:
                    lines = f.readlines()
            except FileNotFoundError:
                self.wfile.write(json.dumps({"error": "Log file not found"}).encode())
                return

            events = []
            for line in lines:
                line = line.strip()
                if line:
                    try:
                        events.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass

            total = len(events)
            logins_failed = sum(1 for e in events if e.get("eventid") == "cowrie.login.failed")
            logins_success = sum(1 for e in events if e.get("eventid") == "cowrie.login.success")
            commands = [e.get("input", "") for e in events if e.get("eventid") == "cowrie.command.input"]
            src_ips = set(e.get("src_ip", "") for e in events if e.get("src_ip"))
            sessions = set(e.get("session", "") for e in events if e.get("session"))

            report = {
                "resumen": {
                    "total_eventos": total,
                    "conexiones": sum(1 for e in events if e.get("eventid") == "cowrie.session.connect"),
                    "logins_fallidos": logins_failed,
                    "logins_exitosos": logins_success,
                    "comandos_ejecutados": len(commands),
                    "ips_unicas": list(src_ips),
                    "sesiones_unicas": len(sessions),
                },
                "comandos": commands,
                "credenciales_vistas": [
                    {"user": e.get("username", ""), "pass": e.get("password", "")}
                    for e in events
                    if "cowrie.login" in e.get("eventid", "")
                ],
                "ultimos_20_eventos": events[-20:]
            }

            self.wfile.write(json.dumps(report, indent=2).encode())

        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error":"Use /events o /report"}')

    def log_message(self, format, *args):
        pass  # Silence server logs


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 9000))
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"[*] Log-reader on :{port}")
    print(f"[*] Endpoints:  /events?n=50   /report")
    server.serve_forever()
