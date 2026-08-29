Add-Type -AssemblyName System.Drawing

$src = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines\combiflam-tablet.jpg"
$dest = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines\combiflam-tablet.png"

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$targetSize = 600
$outBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($outBmp)

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g.Clear([System.Drawing.Color]::White)

$maxDim = $targetSize * 0.80
$scale = [Math]::Min($maxDim / $bmp.Width, $maxDim / $bmp.Height)
$destW = [int]($bmp.Width * $scale)
$destH = [int]($bmp.Height * $scale)
$destX = [int](($targetSize - $destW) / 2)
$destY = [int](($targetSize - $destH) / 2)

$destRect = [System.Drawing.Rectangle]::new($destX, $destY, $destW, $destH)
$g.DrawImage($bmp, $destRect, 0, 0, $bmp.Width, $bmp.Height, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$bmp.Dispose()

$outBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Write-Host "Combiflam cleanly converted from full studio photo!"
