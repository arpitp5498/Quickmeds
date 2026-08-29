Add-Type -AssemblyName System.Drawing

$src = "C:\Users\arpit\.gemini\antigravity\brain\8cabef4e-9ef7-43ec-96b1-f84cdf89d73f\.user_uploaded\media_1788022664409.png"
$dest = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines\azithral-500mg-tablet.png"

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$w = $bmp.Width
$h = $bmp.Height

$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
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

$pad = 6
$srcX = [Math]::Max(0, $minX - $pad)
$srcY = [Math]::Max(0, $minY - $pad)
$srcW = [Math]::Min($w - $srcX, ($maxX - $minX) + ($pad * 2))
$srcH = [Math]::Min($h - $srcY, ($maxY - $minY) + ($pad * 2))

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

$maxDim = $targetSize * 0.80
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
Write-Host "Azithral photo successfully processed and saved to $dest (${destW}x${destH} centered on 600x600)"
