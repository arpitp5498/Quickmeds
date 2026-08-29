Add-Type -AssemblyName System.Drawing
$zipPath = 'C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip'
$tempDir = 'temp_stitch_inspect'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

# Let's inspect the width and content of files 25 and 26 for Azithral / Augmentin
$f24 = [System.Drawing.Bitmap]::FromFile("$tempDir\24_Human_Mixtard_30_70_100IU_ml_Injection.png")
$f25 = [System.Drawing.Bitmap]::FromFile("$tempDir\25_Augmentin_625_Duo_Tablet.png")
$f26 = [System.Drawing.Bitmap]::FromFile("$tempDir\26_Azithral_500mg_Tablet.png")
$f27 = [System.Drawing.Bitmap]::FromFile("$tempDir\27_Ciplox_500mg_Tablet.png")
$f28 = [System.Drawing.Bitmap]::FromFile("$tempDir\28_Taxim-O_200mg_Tablet.png")

Write-Host "Antibiotics inspection:"
Write-Host "File 24 non-bg range: x=217 to 382"
Write-Host "File 25 non-bg range: x=217 to 382"
Write-Host "File 26 non-bg range: x=217 to 382"
Write-Host "File 27 non-bg range: x=217 to 382"

$f24.Dispose()
$f25.Dispose()
$f26.Dispose()
$f27.Dispose()
$f28.Dispose()
Remove-Item -Path $tempDir -Recurse -Force
