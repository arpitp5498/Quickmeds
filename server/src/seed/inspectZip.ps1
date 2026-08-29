Add-Type -AssemblyName System.Drawing
$zipPath = 'C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip'
$tempDir = 'temp_inspect'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

$files = Get-ChildItem $tempDir
foreach ($f in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
    $w = $bmp.Width
    $h = $bmp.Height
    $bmp.Dispose()
    Write-Host "$($f.Name): $w x $h"
}
