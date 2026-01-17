@echo off
REM Create EK-OS VM in VirtualBox
cd /d D:\work\autobusi-punjaci\ek-os

set VBOX="C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"

echo Creating EK-OS VM in VirtualBox...

REM Remove old VM if exists
%VBOX% unregistervm "EK-OS" --delete 2>nul

REM Create VM
%VBOX% createvm --name "EK-OS" --ostype "Other_64" --register

REM Configure VM
%VBOX% modifyvm "EK-OS" --memory 256 --vram 32
%VBOX% modifyvm "EK-OS" --firmware efi
%VBOX% modifyvm "EK-OS" --usbxhci on
%VBOX% modifyvm "EK-OS" --graphicscontroller vmsvga
%VBOX% modifyvm "EK-OS" --uart1 0x3F8 4 --uartmode1 file "%cd%\vbox-serial.log"

REM Add storage
%VBOX% storagectl "EK-OS" --name "SATA" --add sata --controller IntelAhci
%VBOX% storageattach "EK-OS" --storagectl "SATA" --port 0 --device 0 --type hdd --medium "%cd%\ek-os.vdi"

echo.
echo VM "EK-OS" created!
echo.
echo Starting VM...
%VBOX% startvm "EK-OS"
