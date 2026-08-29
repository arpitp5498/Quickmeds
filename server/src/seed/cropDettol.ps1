Add-Type -AssemblyName System.Drawing
$zipPath = 'C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip'
$tempDir = 'temp_zip_extract'
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

$bmp = [System.Drawing.Bitmap]::FromFile("$tempDir\33_Dettol_Antiseptic_Liquid_250ml.png")
$w = $bmp.Width
$h = $bmp.Height

$colCounts = New-Object int[] $w
$rowCounts = New-Object int[] $h

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 300; $x -lt $w; $x++) {
        $p = $bmp.GetPixel($x, $y)
        $isBg = ($p.A -lt 30) -or ($p.R -ge 245 -and $p.G -ge 245 -and $p.B -ge 245)
        if (-not $isBg) {
            $colCounts[$x]++
            $rowCounts[$y]++
        }
    }
}

$minX = 300
while ($minX -lt $w -and $colCounts[$minX] -lt 10) { $minX++ }
$maxX = $w - 1
while ($maxX -ge 300 -and $colCounts[$maxX] -lt 10) { $maxX-- }
$minY = 0
while ($minY -lt $h -and $rowCounts[$minY] -lt 10) { $minY++ }
$maxY = $h - 1
while ($maxY -ge 0 -and $rowCounts[$maxY] -lt 10) { $maxY-- }

$cropW = ($maxX - $minX) + 1
$cropH = ($maxY - $minY) + 1
$cropRect = [System.Drawing.Rectangle]::new($minX, $minY, $cropW, $cropH)
$cropped = $bmp.Clone($cropRect, $bmp.PixelFormat)
$bmp.Dispose()

$targetSize = 600
$outBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($outBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.Clear([System.Drawing.Color]::White)

$maxDim = $targetSize * 0.84
$scale = [Math]::Min($maxDim / $cropped.Width, $maxDim / $cropped.Height)
$destW = [int]($cropped.Width * $scale)
$destH = [int]($cropped.Height * $scale)
$destX = [int](($targetSize - $destW) / 2)
$destY = [int](($targetSize - $destH) / 2)
$destRect = [System.Drawing.Rectangle]::new($destX, $destY, $destW, $destH)
$g.DrawImage($cropped, $destRect, 0, 0, $cropped.Width, $cropped.Height, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$cropped.Dispose()

$outBmp.Save('client\public\medicines\dettol-antiseptic-liquid.png', [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Remove-Item -Path $tempDir -Recurse -Force
Write-Host 'Dettol cleanly cropped!'
