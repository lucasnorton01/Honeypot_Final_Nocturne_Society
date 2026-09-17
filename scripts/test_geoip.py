#!/usr/bin/env python3
"""Test GeoIP Lookup — same as n8n httpRequest node."""
import sys
sys.stdout.reconfigure(encoding="utf-8")
import urllib.request
import json

src_ip = "8.8.8.8"
url = f"http://ip-api.com/json/{src_ip}?fields=country"

print(f"URL: {url}")
print(f"Method: GET")
print()

try:
    with urllib.request.urlopen(url, timeout=5) as response:
        status = response.status
        data = response.read().decode("utf-8")
        print(f"Status: {status}")
        print(f"Response: {data}")
        parsed = json.loads(data)
        country = parsed.get("country", "N/A")
        print(f"Country: {country}")
except Exception as e:
    print(f"Error: {e}")
