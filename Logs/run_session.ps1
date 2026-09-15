$env:FAILED_ATTEMPTS = ''
$env:SUCCESS_ATTEMPT = 'admin:test123'
& 'C:\Users\Lucas Norton\AppData\Local\Programs\Python\Python313\python.exe' -u 'C:\Users\Lucas Norton\Desktop\Tesis 10 septiembre\HONEYPOT_FINAL-NOCTURNE--main\HONEYPOT_FINAL-NOCTURNE--main\scripts\attack_simulator.py' > 'C:\Users\Lucas Norton\Desktop\Tesis 10 septiembre\HONEYPOT_FINAL-NOCTURNE--main\HONEYPOT_FINAL-NOCTURNE--main\sesion1.log' 2>&1
Write-Host "Session 1 complete"