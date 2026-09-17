FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir paramiko

COPY attack_ssh.py .

CMD ["python", "-u", "attack_ssh.py"]
