Add-Type -AssemblyName System.Drawing

$dir = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines"
$files = Get-ChildItem -Path $dir -Filter "*.png"

Write-Host "Found $($files.Count) PNG medicine images to crop and enhance..."

foreach ($file in $files) {
    try {
        $sourcePath = $file.FullName
        $bmp = [System.Drawing.Bitmap]::FromFile($sourcePath)
        
        $width = $bmp.Width
        $height = $bmp.Height

        $minX = $width
        $minY = $height
        $maxX = 0
        $maxY = 0

        $hasContent = $false

        for ($y = 0; $y -lt $height; $y++) {
            for ($x = 0; $x -lt $width; $x++) {
                $pixel = $bmp.GetPixel($x, $y)
                
                # Check if pixel is NOT transparent and NOT pure/near white
                $isBg = ($pixel.A -lt 30) -or ($pixel.R -ge 248 -and $pixel.G -ge 248 -and $pixel.B -ge 248)
                
                if (-not $isBg) {
                    $hasContent = $true
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }

        if ($hasContent -and ($maxX -gt $minX) -and ($maxY -gt $minY)) {
            $cropWidth = ($maxX - $minX) + 1
            $cropHeight = ($maxY - $minY) + 1

            # Add a small 2% padding around content if within bounds
            $padX = [int]($cropWidth * 0.02)
            $padY = [int]($cropHeight * 0.02)

            $srcX = [Math]::Max(0, $minX - $padX)
            $srcY = [Math]::Max(0, $minY - $padY)
            $srcW = [Math]::Min($width - $srcX, $cropWidth + ($padX * 2))
            $srcH = [Math]::Min($height - $srcY, $cropHeight + ($padY * 2))

            $cropRect = [System.Drawing.Rectangle]::new($srcX, $srcY, $srcW, $srcH)
            $croppedBmp = $bmp.Clone($cropRect, $bmp.PixelFormat)
            $bmp.Dispose()

            # Create target 600x600 high-res canvas
            $targetSize = 600
            $targetBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            $g = [System.Drawing.Graphics]::FromImage($targetBmp)

            # High quality rendering settings
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            # Fill with pure clean white studio background
            $g.Clear([System.Drawing.Color]::White)

            # Calculate scaling to fill 88% of target canvas
            $maxContentSize = $targetSize * 0.88
            $scale = [Math]::Min($maxContentSize / $srcW, $maxContentSize / $srcH)

            $destW = [int]($srcW * $scale)
            $destH = [int]($srcH * $scale)
            $destX = [int](($targetSize - $destW) / 2)
            $destY = [int](($targetSize - $destH) / 2)

            $destRect = [System.Drawing.Rectangle]::new($destX, $destY, $destW, $destH)
            $g.DrawImage($croppedBmp, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)

            $g.Dispose()
            $croppedBmp.Dispose()

            # Save enhanced image to temporary file then overwrite
            $tempPath = "$sourcePath.tmp.png"
            $targetBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $targetBmp.Dispose()

            Move-Item -Path $tempPath -Destination $sourcePath -Force
            Write-Host "Enhanced: $($file.Name) (Cropped $srcW x $srcH -> Scaled to $destW x $destH centered)"
        } else {
            $bmp.Dispose()
            Write-Host "Skipped (already full or empty): $($file.Name)"
        }
    } catch {
        Write-Warning "Error processing $($file.Name): $_"
    }
}

Write-Host "Finished enhancing all medicine images!"
