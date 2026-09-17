#!/usr/bin/env python3
"""Run 10-15 SSH attack sessions against Cowrie honeypot using paramiko."""
import sys
sys.stdout.reconfigure(encoding="utf-8")

import paramiko
import time
import socket
from datetime import datetime, timezone

HOST = "127.0.0.1"
PORT = 2222

# Define 12 attack sessions with varied credentials and commands
SESSIONS = [
    {"user": "admin", "pass": "123456", "cmds": ["whoami", "uname -a", "id"]},
    {"user": "root", "pass": "toor", "cmds": ["id", "cat /etc/passwd", "ls /"]},
    {"user": "admin", "pass": "admin", "cmds": ["w", "uptime", "df -h"]},
    {"user": "test", "pass": "test", "cmds": ["whoami", "ls -la"]},
    {"user": "oracle", "pass": "oracle", "cmds": ["id", "uname -r"]},
    {"user": "root", "pass": "password", "cmds": ["whoami", "cat /etc/shadow"]},
    {"user": "deploy", "pass": "deploy", "cmds": ["id", "ls /home"]},
    {"user": "guest", "pass": "guest", "cmds": ["whoami", "pwd"]},
    {"user": "git", "pass": "git123", "cmds": ["id", "find / -name .git -type d"]},
    {"user": "ci", "pass": "ci", "cmds": ["whoami", "env"]},
    {"user": "devops", "pass": "devops", "cmds": ["id", "cat /proc/cpuinfo"]},
    {"user": "admin", "pass": "test123", "cmds": ["whoami", "uname -a", "cat /etc/passwd", "ls -la /home", "w", "exit"]},
]

results = []

for i, sess in enumerate(SESSIONS):
    print(f"\n--- Session {i+1}/{len(SESSIONS)}: {sess['user']}:{sess['pass']} ---")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, port=PORT, username=sess["user"], password=sess["pass"],
                       timeout=10, allow_agent=False, look_for_keys=False)
        
        # Execute commands
        for cmd in sess["cmds"]:
            stdin, stdout, stderr = client.exec_command(cmd, timeout=5)
            exit_code = stdout.channel.recv_exit_status()
            out = stdout.read().decode("utf-8", errors="replace").strip()
            print(f"  $ {cmd} -> exit={exit_code}, out={out[:80]}")
        
        client.close()
        print(f"  -> SUCCESS")
        results.append({"session": i+1, "status": "success", "user": sess["user"]})
    except paramiko.AuthenticationException:
        print(f"  -> AUTH FAILED (expected for some)")
        results.append({"session": i+1, "status": "auth_failed", "user": sess["user"]})
    except Exception as e:
        print(f"  -> ERROR: {e}")
        results.append({"session": i+1, "status": "error", "user": sess["user"], "error": str(e)})
    
    time.sleep(1)  # Pace between sessions

print(f"\n{'='*60}")
print(f"SUMMARY: {len(SESSIONS)} sessions attempted")
succeeded = sum(1 for r in results if r["status"] == "success")
failed_auth = sum(1 for r in results if r["status"] == "auth_failed")
errors = sum(1 for r in results if r["status"] == "error")
print(f"  Succeeded: {succeeded}")
print(f"  Auth failed: {failed_auth}")
print(f"  Errors: {errors}")
