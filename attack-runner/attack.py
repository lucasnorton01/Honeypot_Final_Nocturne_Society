#!/usr/bin/env python3
"""
Attack runner - executes Telnet attacks against Cowrie from inside Docker network.
Cowrie SSH is broken (no DH moduli), but Telnet works fine.
"""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import socket
import time
from datetime import datetime, timezone

# Cowrie is accessible via hostname "cowrie" inside Docker network
HOST = "cowrie"
TELNET_PORT = 2223

# Credentials from cowrie/userdb.txt
VALID_CREDS = {"admin": "test123", "guest": "guest123"}

# 12 attack sessions
SESSIONS = [
    {"user": "admin", "pass": "123456", "cmds": ["whoami", "uname -a", "id"], "desc": "admin:123456 (fail)"},
    {"user": "root", "pass": "toor", "cmds": ["id", "cat /etc/passwd", "ls /"], "desc": "root:toor (fail)"},
    {"user": "admin", "pass": "admin", "cmds": ["w", "uptime", "df -h"], "desc": "admin:admin (fail)"},
    {"user": "test", "pass": "test", "cmds": ["whoami", "ls -la"], "desc": "test:test (fail)"},
    {"user": "oracle", "pass": "oracle", "cmds": ["id", "uname -r"], "desc": "oracle:oracle (fail)"},
    {"user": "root", "pass": "password", "cmds": ["whoami", "cat /etc/shadow"], "desc": "root:password (fail)"},
    {"user": "deploy", "pass": "deploy", "cmds": ["id", "ls /home"], "desc": "deploy:deploy (fail)"},
    {"user": "guest", "pass": "guest123", "cmds": ["whoami", "pwd", "ls"], "desc": "guest:guest123 (SUCCESS)"},
    {"user": "git", "pass": "git123", "cmds": ["id", "find / -name .git -type d"], "desc": "git:git123 (fail)"},
    {"user": "ci", "pass": "ci", "cmds": ["whoami", "env"], "desc": "ci:ci (fail)"},
    {"user": "devops", "pass": "devops", "cmds": ["id", "cat /proc/cpuinfo"], "desc": "devops:devops (fail)"},
    {"user": "admin", "pass": "test123", "cmds": ["whoami", "uname -a", "cat /etc/passwd", "ls -la /home", "w", "exit"], "desc": "admin:test123 (SUCCESS)"},
]


class TelnetSession:
    """Minimal telnet client using raw sockets with IAC negotiation."""
    
    def __init__(self, host, port, timeout=10):
        self.sock = socket.create_connection((host, port), timeout=timeout)
        self.sock.settimeout(timeout)
        self.buffer = b""
    
    def _read_raw(self, timeout=5):
        end = time.time() + timeout
        data = b""
        while time.time() < end:
            try:
                chunk = self.sock.recv(4096)
                if not chunk:
                    break
                data += chunk
            except socket.timeout:
                break
        return data
    
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


def try_login(tn, user, pwd):
    """Attempt telnet login. Returns True if shell prompt detected."""
    tn.write(user.encode() + b"\r\n")
    time.sleep(0.3)
    tn.read_until(b"Password:", timeout=5)
    tn.write(pwd.encode() + b"\r\n")
    time.sleep(0.8)
    raw = tn.read_eager(0.8).decode("utf-8", errors="replace")
    time.sleep(0.8)
    raw2 = tn.read_eager(0.8).decode("utf-8", errors="replace")
    full = raw + raw2
    
    failed_hint = "Login incorrect" in full or "login:" in full
    shell_hint = ("$" in full and "@" in full) or "~$" in full or "# " in full
    success = shell_hint and not failed_hint
    return success, full


def run_session(i, sess):
    """Run one attack session via telnet."""
    print(f"\n[{i+1}/{len(SESSIONS)}] {sess['desc']}")
    
    try:
        tn = TelnetSession(HOST, TELNET_PORT, timeout=10)
        
        # Wait for login prompt
        banner = tn.read_until(b"login:", timeout=5).decode("utf-8", errors="replace")
        print(f"  Banner: {banner.strip()[:60]}...")
        
        # Try failed credentials first
        user, pwd = sess["user"], sess["pass"]
        success, raw = try_login(tn, user, pwd)
        
        if success:
            print(f"  + Login OK: {user}:{pwd}")
            
            # Execute commands
            for cmd in sess["cmds"]:
                tn.write(cmd.encode() + b"\r\n")
                time.sleep(0.8)
                output = tn.read_eager(0.8).decode("utf-8", errors="replace")
                lines = [l.strip() for l in output.split("\n") if l.strip()]
                display = lines[-3:] if lines else []
                print(f"  $ {cmd}")
                for line in display:
                    print(f"    {line}")
            
            tn.close()
            print(f"  -> SESSION OK")
            return {"session": i+1, "status": "success", "user": user}
        else:
            print(f"  - Login FAIL: {user}:{pwd}")
            tn.close()
            return {"session": i+1, "status": "auth_failed", "user": user}
    
    except Exception as e:
        print(f"  -> ERROR: {e}")
        return {"session": i+1, "status": "error", "user": sess["user"], "error": str(e)}


print(f"Attack Runner (Telnet) - {datetime.now(timezone.utc).isoformat()}")
print(f"Target: {HOST}:{TELNET_PORT}")
print(f"Sessions: {len(SESSIONS)}")
print("=" * 60)

results = []
for i, sess in enumerate(SESSIONS):
    result = run_session(i, sess)
    results.append(result)
    time.sleep(1)

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
