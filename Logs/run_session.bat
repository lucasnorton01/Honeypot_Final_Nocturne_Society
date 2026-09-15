@echo off
SET TELNET_HOST=127.0.0.1
SET TELNET_PORT=2323
SET FAILED_ATTEMPTS=%1
SET SUCCESS_ATTEMPT=%2
python3 -u scripts\attack_simulator.py > %3.log 2>&1