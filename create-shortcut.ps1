# Creates a desktop shortcut for the Inventory Management System launcher

$batPath = "$PSScriptRoot\start-app.bat"
$shortcutPath = "$env:USERPROFILE\Desktop\Inventory Management System.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $batPath
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Start Inventory Management System (Backend + Frontend)"
# Use a built-in Windows icon (calculator/settings look)
$Shortcut.IconLocation = "%SystemRoot%\System32\imageres.dll,109"
$Shortcut.Save()

Write-Host ""
Write-Host "  Shortcut created on your Desktop!" -ForegroundColor Green
Write-Host "  Double-click 'Inventory Management System' to launch." -ForegroundColor Cyan
Write-Host ""
