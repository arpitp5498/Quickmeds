Add-Type -AssemblyName System.Drawing

$zipPath = "C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip"
$tempDir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_janumet"
$dest = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines\janumet-50mg-500mg-tablet.png"

if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

$bmp = [System.Drawing.Bitmap]::FromFile("$tempDir\23_Janumet_50_500mg_Tablet.png")
# Let's find exact bounds for Janumet on file 23 (left item: x < 350)
$minX = 600
$maxX = 0
$minY = 600
$maxY = 0

for ($y = 200; $y -lt 400; $y++) {
    for ($x = 0; $x -lt 340; $x++) {
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
$srcX = [Math]::Max(0, $minX - $pad)
$srcY = [Math]::Max(0, $minY - $pad)
$srcW = ($maxX - $minX) + ($pad * 2)
$srcH = ($maxY - $minY) + ($pad * 2)

$cropRect = [System.Drawing.Rectangle]::new($srcX, $srcY, $srcW, $srcH)
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
Write-Host "Janumet cropped!"
