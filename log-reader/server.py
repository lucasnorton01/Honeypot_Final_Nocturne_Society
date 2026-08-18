#!/usr/bin/env python3
"""Servidor HTTP minimal que lee cowrie.json y lo devuelve como JSON"""

import json
import os
from datetime import datetime
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

COWRIE_LOG = os.environ.get("COWRIE_LOG", "/cowrie/var/log/cowrie/cowrie.json")
MAX_EVENTS = 10000


def load_events(since=None):
    try:
        with open(COWRIE_LOG) as f:
            lines = f.readlines()
    except FileNotFoundError:
        return None

    events = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if since and ev.get("timestamp"):
            try:
                ts = datetime.fromisoformat(ev["timestamp"].replace("Z", "+00:00"))
                if ts < since:
                    continue
            except ValueError:
                pass
        events.append(ev)
    return events


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path == "/events":
            try:
                n = int(params.get("n", ["50"])[0])
            except ValueError:
                n = 50
            n = max(1, min(n, MAX_EVENTS))

            since = self._parse_since(params)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            events = load_events(since)
            if events is None:
                self.wfile.write(json.dumps({"error": "Log file not found"}).encode())
                return

            self.wfile.write(json.dumps(events[-n:], indent=2).encode())

        elif parsed.path == "/report":
            since = self._parse_since(params)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            events = load_events(since)
            if events is None:
                self.wfile.write(json.dumps({"error": "Log file not found"}).encode())
                return

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

    def _parse_since(self, params):
        raw = params.get("since", [None])[0]
        if not raw:
            return None
        try:
            return datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except ValueError:
            return None

    def log_message(self, format, *args):
        pass  # Silence server logs


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 9000))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"[*] Log-reader on :{port}")
    print(f"[*] Endpoints:  /events?n=50   /report   (opcional: &since=YYYY-MM-DDTHH:MM:SSZ)")
    server.serve_forever()
