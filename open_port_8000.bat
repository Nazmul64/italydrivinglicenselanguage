@echo off
echo Opening port 8000 for Laravel development server...
netsh advfirewall firewall delete rule name="Laravel Dev Server 8000" >nul 2>&1
netsh advfirewall firewall add rule name="Laravel Dev Server 8000" dir=in action=allow protocol=TCP localport=8000
echo Done! Port 8000 is now open for incoming connections.
echo Phone (on same WiFi) can now reach: http://192.168.42.29:8000
pause
