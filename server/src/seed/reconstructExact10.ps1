Add-Type -AssemblyName System.Drawing

$zipPath = "C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip"
$tempDir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_reconstruct"
$destDir = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines"

if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

function Stitch-Two-Bitmaps($bmp1, $bmp2, $overlapX) {
    # Stitches bmp1 (left) and bmp2 (right) with given overlap
    $w = $bmp1.Width + $bmp2.Width - $overlapX
    $h = [Math]::Max($bmp1.Height, $bmp2.Height)
    
    $stitched = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($stitched)
    $g.Clear([System.Drawing.Color]::White)
    
    $g.DrawImage($bmp1, 0, 0, $bmp1.Width, $bmp1.Height)
    $g.DrawImage($bmp2, ($bmp1.Width - $overlapX), 0, $bmp2.Width, $bmp2.Height)
    $g.Dispose()
    return $stitched
}

function Save-Centered-Product($cropped, $destFileName) {
    $targetSize = 600
    $outBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.Clear([System.Drawing.Color]::White)

    # 78% fill factor guarantees 11% safe margin around all edges
    $maxDim = $targetSize * 0.78
    $scale = [Math]::Min($maxDim / $cropped.Width, $maxDim / $cropped.Height)

    $destW = [int]($cropped.Width * $scale)
    $destH = [int]($cropped.Height * $scale)
    $destX = [int](($targetSize - $destW) / 2)
    $destY = [int](($targetSize - $destH) / 2)

    $destRect = [System.Drawing.Rectangle]::new($destX, $destY, $destW, $destH)
    $g.DrawImage($cropped, $destRect, 0, 0, $cropped.Width, $cropped.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $destPath = Join-Path $destDir $destFileName
    $outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "✅ Saved: $destFileName (${destW}x${destH} centered with safe margins)"
}

function Crop-Bounding-Box($bmp, $minXLimit, $maxXLimit, $destFileName) {
    $w = $bmp.Width
    $h = $bmp.Height

    $effectiveMaxX = [Math]::Min($w, $maxXLimit)
    $effectiveMinX = [Math]::Max(0, $minXLimit)

    $minX = $effectiveMaxX
    $maxX = $effectiveMinX
    $minY = $h
    $maxY = 0
    $found = $false

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = $effectiveMinX; $x -lt $effectiveMaxX; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $isBg = ($p.A -lt 20) -or ($p.R -ge 248 -and $p.G -ge 248 -and $p.B -ge 248)
            if (-not $isBg) {
                $found = $true
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    if ($found -and $maxX -gt $minX -and $maxY -gt $minY) {
        $pad = 6
        $srcX = [Math]::Max($effectiveMinX, $minX - $pad)
        $srcY = [Math]::Max(0, $minY - $pad)
        $srcW = [Math]::Min($effectiveMaxX - $srcX, ($maxX - $minX) + ($pad * 2))
        $srcH = [Math]::Min($h - $srcY, ($maxY - $minY) + ($pad * 2))

        $rect = [System.Drawing.Rectangle]::new($srcX, $srcY, $srcW, $srcH)
        $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
        Save-Centered-Product $cropped $destFileName
        $cropped.Dispose()
    } else {
        Write-Warning "Could not find bounds for $destFileName"
    }
}

Write-Host "--- Processing the 10 Specific Target Medicines ---`n"

# 1. Betadine: Stitched from File 31 (left) and File 32 (right)
$f31 = [System.Drawing.Bitmap]::FromFile("$tempDir\31_Becosules_Z_Capsule.png")
$f32 = [System.Drawing.Bitmap]::FromFile("$tempDir\32_Betadine_10%_Ointment_20g.png")
# Check overlap offset (the shift between sprite slices is approx 175px)
$stitchedBeta = Stitch-Two-Bitmaps $f31 $f32 425
Crop-Bounding-Box $stitchedBeta 350 750 "betadine-10-microbicidal-ointment.png"
$f31.Dispose()
$f32.Dispose()
$stitchedBeta.Dispose()

# 2. Janumet: Stitched from File 23 (left) and File 24 (right)
$f23 = [System.Drawing.Bitmap]::FromFile("$tempDir\23_Janumet_50_500mg_Tablet.png")
$f24 = [System.Drawing.Bitmap]::FromFile("$tempDir\24_Human_Mixtard_30_70_100IU_ml_Injection.png")
$stitchedJanu = Stitch-Two-Bitmaps $f23 $f24 425
Crop-Bounding-Box $stitchedJanu 150 550 "janumet-50mg-500mg-tablet.png"
$stitchedJanu.Dispose()

# 3. Human Mixtard: Clean Standalone from File 24 (center region only, isolating vial & box)
Crop-Bounding-Box $f24 230 360 "human-mixtard-30-70-injection.png"
$f23.Dispose()
$f24.Dispose()

# 4. Maxtra Oral Drops: Stitched from File 12 and File 13
$f12 = [System.Drawing.Bitmap]::FromFile("$tempDir\12_Otrivin_Oxy_Fast_Relief_Nasal_Spray_10ml.png")
$f13 = [System.Drawing.Bitmap]::FromFile("$tempDir\13_Maxtra_Oral_Drops_15ml.png")
$stitchedMaxtra = Stitch-Two-Bitmaps $f12 $f13 425
Crop-Bounding-Box $stitchedMaxtra 300 700 "maxtra-oral-drops.png"
$f12.Dispose()
$f13.Dispose()
$stitchedMaxtra.Dispose()

# 5. Combiflam: Clean conversion from full studio photo
$combiflamSrc = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines\combiflam-tablet.jpg"
if (Test-Path $combiflamSrc) {
    $bmpCombi = [System.Drawing.Bitmap]::FromFile($combiflamSrc)
    Save-Centered-Product $bmpCombi "combiflam-tablet.png"
    $bmpCombi.Dispose()
}

# 6. Meftal Spas: Stitched from File 03 and File 04
$f03 = [System.Drawing.Bitmap]::FromFile("$tempDir\03_Combiflam_Tablet.png")
$f04 = [System.Drawing.Bitmap]::FromFile("$tempDir\04_Meftal_Spas_Tablet.png")
$stitchedMeftal = Stitch-Two-Bitmaps $f03 $f04 425
Crop-Bounding-Box $stitchedMeftal 350 750 "meftal-spas-tablet.png"
$f03.Dispose()
$f04.Dispose()
$stitchedMeftal.Dispose()

# 7. Augmentin: Stitched from File 24 and File 25
$f24b = [System.Drawing.Bitmap]::FromFile("$tempDir\24_Human_Mixtard_30_70_100IU_ml_Injection.png")
$f25 = [System.Drawing.Bitmap]::FromFile("$tempDir\25_Augmentin_625_Duo_Tablet.png")
$stitchedAug = Stitch-Two-Bitmaps $f24b $f25 425
Crop-Bounding-Box $stitchedAug 350 750 "augmentin-625-duo-tablet.png"
$f24b.Dispose()
$f25.Dispose()
$stitchedAug.Dispose()

# 8. Azithral: Stitched from File 25 and File 26
$f25b = [System.Drawing.Bitmap]::FromFile("$tempDir\25_Augmentin_625_Duo_Tablet.png")
$f26 = [System.Drawing.Bitmap]::FromFile("$tempDir\26_Azithral_500mg_Tablet.png")
$stitchedAzi = Stitch-Two-Bitmaps $f25b $f26 425
Crop-Bounding-Box $stitchedAzi 350 750 "azithral-500mg-tablet.png"
$f25b.Dispose()
$f26.Dispose()
$stitchedAzi.Dispose()

# 9. Ciplox: Stitched from File 26 and File 27
$f26b = [System.Drawing.Bitmap]::FromFile("$tempDir\26_Azithral_500mg_Tablet.png")
$f27 = [System.Drawing.Bitmap]::FromFile("$tempDir\27_Ciplox_500mg_Tablet.png")
$stitchedCip = Stitch-Two-Bitmaps $f26b $f27 425
Crop-Bounding-Box $stitchedCip 350 750 "ciplox-500mg-tablet.png"
$f26b.Dispose()
$f27.Dispose()
$stitchedCip.Dispose()

# 10. Taxim-O: Stitched from File 27 and File 28
$f27b = [System.Drawing.Bitmap]::FromFile("$tempDir\27_Ciplox_500mg_Tablet.png")
$f28 = [System.Drawing.Bitmap]::FromFile("$tempDir\28_Taxim-O_200mg_Tablet.png")
$stitchedTaxim = Stitch-Two-Bitmaps $f27b $f28 425
Crop-Bounding-Box $stitchedTaxim 350 750 "taxim-o-200mg-tablet.png"
$f27b.Dispose()
$f28.Dispose()
$stitchedTaxim.Dispose()

Remove-Item -Path $tempDir -Recurse -Force
Write-Host "`nAll 10 target medicines reconstructed and centered!"
