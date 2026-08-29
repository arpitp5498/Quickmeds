Add-Type -AssemblyName System.Drawing
$zipPath = 'C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip'
$tempDir = 'temp_stitch_test'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

$bmp5 = [System.Drawing.Bitmap]::FromFile("$tempDir\05_Saridon_Headache_Relief_Tablet.png")
$bmp6 = [System.Drawing.Bitmap]::FromFile("$tempDir\06_Volini_Pain_Relief_Gel_50g.png")

Write-Host "File 5: $($bmp5.Width)x$($bmp5.Height)"
Write-Host "File 6: $($bmp6.Width)x$($bmp6.Height)"

# Check pixels at right edge of File 5 (x: 400 to 600)
for ($x = 400; $x -lt 600; $x += 20) {
    $nonBg = 0
    for ($y = 200; $y -lt 400; $y++) {
        $p = $bmp5.GetPixel($x, $y)
        if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) { $nonBg++ }
    }
    Write-Host "File 5 col $x non-bg: $nonBg"
}

# Check pixels at left edge of File 6 (x: 0 to 250)
for ($x = 0; $x -lt 250; $x += 20) {
    $nonBg = 0
    for ($y = 200; $y -lt 400; $y++) {
        $p = $bmp6.GetPixel($x, $y)
        if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) { $nonBg++ }
    }
    Write-Host "File 6 col $x non-bg: $nonBg"
}

$bmp5.Dispose()
$bmp6.Dispose()
Remove-Item -Path $tempDir -Recurse -Force
