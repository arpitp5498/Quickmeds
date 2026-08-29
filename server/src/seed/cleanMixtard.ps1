Add-Type -AssemblyName System.Drawing

$zipPath = "C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip"
$tempDir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_mixtard"
$dest = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines\human-mixtard-30-70-injection.png"

if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

$bmp = [System.Drawing.Bitmap]::FromFile("$tempDir\24_Human_Mixtard_30_70_100IU_ml_Injection.png")
# Mixtard vial is centered at x: 270 to 330, y: 195 to 395
# Let's find exact bounds within x: 260 to 340
$minX = 340
$maxX = 260
$minY = 600
$maxY = 0

for ($y = 190; $y -lt 400; $y++) {
    for ($x = 260; $x -lt 340; $x++) {
        $p = $bmp.GetPixel($x, $y)
        $isBg = ($p.A -lt 20) -or ($p.R -ge 248 -and $p.G -ge 248 -and $p.B -ge 248)
        if (-not $isBg) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$pad = 4
$cropW = ($maxX - $minX) + ($pad * 2)
$cropH = ($maxY - $minY) + ($pad * 2)
$cropRect = [System.Drawing.Rectangle]::new($minX - $pad, $minY - $pad, $cropW, $cropH)
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

$maxDim = $targetSize * 0.78
$scale = [Math]::Min($maxDim / $cropped.Width, $maxDim / $cropped.Height)
$destW = [int]($cropped.Width * $scale)
$destH = [int]($cropped.Height * $scale)
$destX = [int](($targetSize - $destW) / 2)
$destY = [int](($targetSize - $destH) / 2)

$destRect = [System.Drawing.Rectangle]::new($destX, $destY, $destW, $destH)
$g.DrawImage($cropped, $destRect, 0, 0, $cropped.Width, $cropped.Height, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$cropped.Dispose()

$outBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Remove-Item -Path $tempDir -Recurse -Force
Write-Host "Human Mixtard cleanly isolated as standalone vial!"
