#!/usr/bin/env python3
import os

# Set environment variables for the attack session
os.environ['FAILED_ATTEMPTS'] = 'root:root|test:test|user:password'
os.environ['SUCCESS_ATTEMPT'] = 'admin:test123'
os.environ['TELNET_HOST'] = '127.0.0.1'
os.environ['TELNET_PORT'] = '2323'

# Now run the attack simulator
import importlib.util
spec = importlib.util.spec_from_file_location("attack_simulator", "scripts/attack_simulator.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.main()