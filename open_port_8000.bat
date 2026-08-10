@echo off
echo Opening port 8000 for Laravel development server...
netsh advfirewall firewall delete rule name="Laravel Dev Server 8000" >nul 2>&1
netsh advfirewall firewall add rule name="Laravel Dev Server 8000" dir=in action=allow protocol=TCP localport=8000
echo Done! Port 8000 is open for incoming connections on Wi-Fi IP: http://192.168.0.101:8000
echo Starting Laravel Server on 0.0.0.0:8000...
php artisan serve --host=0.0.0.0 --port=8000
pause
