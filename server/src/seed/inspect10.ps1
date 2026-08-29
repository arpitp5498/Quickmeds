Add-Type -AssemblyName System.Drawing
$zipPath = 'C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip'
$tempDir = 'temp_inspect_10'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

$targets = @(
    '04_Meftal_Spas_Tablet.png',
    '13_Maxtra_Oral_Drops_15ml.png',
    '23_Janumet_50_500mg_Tablet.png',
    '24_Human_Mixtard_30_70_100IU_ml_Injection.png',
    '25_Augmentin_625_Duo_Tablet.png',
    '26_Azithral_500mg_Tablet.png',
    '27_Ciplox_500mg_Tablet.png',
    '28_Taxim-O_200mg_Tablet.png',
    '32_Betadine_10%_Ointment_20g.png'
)

foreach ($t in $targets) {
    $bmp = [System.Drawing.Bitmap]::FromFile("$tempDir\$t")
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "$t - Width=$w, Height=$h"
    
    $minX = $w
    $maxX = 0
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.R -lt 245 -or $p.G -lt 245 -or $p.B -lt 245) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
            }
        }
    }
    Write-Host "  Non-bg range: x=$minX to $maxX"
    $bmp.Dispose()
}

Remove-Item -Path $tempDir -Recurse -Force
