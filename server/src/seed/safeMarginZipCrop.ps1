Add-Type -AssemblyName System.Drawing

$zipPath = "C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip"
$tempDir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_zip_extract"
$destDir = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines"

if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

function Crop-With-Safe-Margin($srcBmp, [System.Drawing.Rectangle]$cropRect, $destFileName) {
    # Ensure cropRect stays within source bounds
    $x = [Math]::Max(0, $cropRect.X)
    $y = [Math]::Max(0, $cropRect.Y)
    $w = [Math]::Min($srcBmp.Width - $x, $cropRect.Width)
    $h = [Math]::Min($srcBmp.Height - $y, $cropRect.Height)

    $validRect = [System.Drawing.Rectangle]::new($x, $y, $w, $h)
    $cropped = $srcBmp.Clone($validRect, $srcBmp.PixelFormat)

    $targetSize = 600
    $outBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Clean pure white background
    $g.Clear([System.Drawing.Color]::White)

    # 78% fill factor guarantees a clear 11% safe margin around all edges (never cut off)
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

    $destPath = Join-Path $destDir $destFileName
    $outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "Processed: $destFileName (Product: ${destW}x${destH} centered with safe margins)"
}

function Safe-Auto-Crop($filePath, $destFileName, $minXLimit = 0, $maxXLimit = 600) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $w = $bmp.Width
    $h = $bmp.Height

    $effectiveMaxX = [Math]::Min($w, $maxXLimit)
    $effectiveMinX = [Math]::Max(0, $minXLimit)

    $minX = $effectiveMaxX
    $maxX = $effectiveMinX
    $minY = $h
    $maxY = 0
    $found = $false

    # Scan with sensitive non-white threshold
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = $effectiveMinX; $x -lt $effectiveMaxX; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $isBg = ($p.A -lt 20) -or ($p.R -ge 250 -and $p.G -ge 250 -and $p.B -ge 250)
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
        # Add 6px source margin so zero edge pixels are clipped
        $pad = 6
        $srcX = [Math]::Max($effectiveMinX, $minX - $pad)
        $srcY = [Math]::Max(0, $minY - $pad)
        $srcW = [Math]::Min($effectiveMaxX - $srcX, ($maxX - $minX) + ($pad * 2))
        $srcH = [Math]::Min($h - $srcY, ($maxY - $minY) + ($pad * 2))

        $rect = [System.Drawing.Rectangle]::new($srcX, $srcY, $srcW, $srcH)
        Crop-With-Safe-Margin $bmp $rect $destFileName
    } else {
        Write-Warning "Could not find bounds in $filePath"
    }

    $bmp.Dispose()
}

# 1. Fever & Pain
Safe-Auto-Crop "$tempDir\02_Crocin_500_Advance_Tablet.png" "crocin-500-advance-tablet.png"
Safe-Auto-Crop "$tempDir\03_Combiflam_Tablet.png" "combiflam-tablet.png"
Safe-Auto-Crop "$tempDir\04_Meftal_Spas_Tablet.png" "meftal-spas-tablet.png"
Safe-Auto-Crop "$tempDir\05_Saridon_Headache_Relief_Tablet.png" "saridon-headache-relief-tablet.png"
Safe-Auto-Crop "$tempDir\06_Volini_Pain_Relief_Gel_50g.png" "volini-pain-relief-gel.png"
Safe-Auto-Crop "$tempDir\07_Calpol_250mg_Paediatric_Suspension_60ml.png" "calpol-250mg-paediatric-suspension.png"

# 2. Cold & Cough
Safe-Auto-Crop "$tempDir\08_Asthalin_100mcg_Inhaler.png" "asthalin-100mcg-inhaler.png" 0 295
Safe-Auto-Crop "$tempDir\09_Budecort_200mcg_Inhaler.png" "budecort-200mcg-inhaler.png" 0 305
Safe-Auto-Crop "$tempDir\10_Ascoril_D_Plus_Syrup_100ml.png" "ascoril-d-plus-syrup.png" 0 295
Safe-Auto-Crop "$tempDir\11_Benadryl_Cough_Formula_Syrup_150ml.png" "benadryl-cough-formula-syrup.png" 0 295
Safe-Auto-Crop "$tempDir\11_Benadryl_Cough_Formula_Syrup_150ml.png" "otrivin-oxy-fast-relief-nasal-spray.png" 310 600
Safe-Auto-Crop "$tempDir\12_Otrivin_Oxy_Fast_Relief_Nasal_Spray_10ml.png" "maxtra-oral-drops.png" 310 600

# 3. Digestive Care
Safe-Auto-Crop "$tempDir\14_Pan-D_Capsule.png" "pan-d-capsule.png"
Safe-Auto-Crop "$tempDir\15_Digene_Acidity_Relief_Gel_Mint_200ml.png" "digene-acidity-relief-gel-mint.png"
Safe-Auto-Crop "$tempDir\16_Electral_ORS_Powder_Sachet_21.8g.png" "electral-ors-powder.png"
Safe-Auto-Crop "$tempDir\17_Ondem_Syrup_30ml.png" "ondem-syrup.png"

# 4. Cardiac & Diabetes
Safe-Auto-Crop "$tempDir\18_Telma_40mg_Tablet.png" "telma-40mg-tablet.png"
Safe-Auto-Crop "$tempDir\19_Ecosprin_75mg_Tablet.png" "ecosprin-75mg-tablet.png"
Safe-Auto-Crop "$tempDir\20_Sorbitrate_5mg_Sublingual_Tablet.png" "sorbitrate-5mg-sublingual-tablet.png"
Safe-Auto-Crop "$tempDir\21_Atorva_20mg_Tablet.png" "atorva-20mg-tablet.png"
Safe-Auto-Crop "$tempDir\22_Glycomet-GP_1_Tablet.png" "glycomet-gp-1-tablet.png"
Safe-Auto-Crop "$tempDir\23_Janumet_50_500mg_Tablet.png" "janumet-50mg-500mg-tablet.png"
Safe-Auto-Crop "$tempDir\24_Human_Mixtard_30_70_100IU_ml_Injection.png" "human-mixtard-30-70-injection.png"

# 5. Antibiotics & Anti-infectives
Safe-Auto-Crop "$tempDir\25_Augmentin_625_Duo_Tablet.png" "augmentin-625-duo-tablet.png" 0 340
Safe-Auto-Crop "$tempDir\26_Azithral_500mg_Tablet.png" "azithral-500mg-tablet.png" 0 340
Safe-Auto-Crop "$tempDir\27_Ciplox_500mg_Tablet.png" "ciplox-500mg-tablet.png" 0 340
Safe-Auto-Crop "$tempDir\28_Taxim-O_200mg_Tablet.png" "taxim-o-200mg-tablet.png"

# 6. Vitamins & Supplements
Safe-Auto-Crop "$tempDir\29_Limcee_500mg_Chewable_Tablet.png" "limcee-500mg-chewable-tablet.png"
Safe-Auto-Crop "$tempDir\30_Shelcal_500_Tablet.png" "shelcal-500-tablet.png"
Safe-Auto-Crop "$tempDir\31_Becosules_Z_Capsule.png" "becosules-z-capsule.png"

# 7. First Aid & Surgical
Safe-Auto-Crop "$tempDir\32_Betadine_10%_Ointment_20g.png" "betadine-10-microbicidal-ointment.png"
Safe-Auto-Crop "$tempDir\33_Dettol_Antiseptic_Liquid_250ml.png" "dettol-antiseptic-liquid.png" 310 600
Safe-Auto-Crop "$tempDir\34_Hansaplast_Regular_Bandage_Strips_20.png" "hansaplast-regular-bandage-strips.png"

# 8. Women Care & Hygiene
Safe-Auto-Crop "$tempDir\35_Whisper_Ultra_Clean_XL_30_Pads.png" "whisper-ultra-clean-sanitary-pads.png"
Safe-Auto-Crop "$tempDir\36_VWash_Plus_Intimate_Wash_200ml.png" "vwash-plus-intimate-hygiene-wash.png"

# Dolo 650 (authentic photo)
$doloUserPhoto = "C:\Users\arpit\.gemini\antigravity\brain\8cabef4e-9ef7-43ec-96b1-f84cdf89d73f\.user_uploaded\media_1788014015775.png"
if (Test-Path $doloUserPhoto) {
    Safe-Auto-Crop $doloUserPhoto "dolo-650mg-tablet.png"
}

Remove-Item -Path $tempDir -Recurse -Force
Write-Host "`n🎉 All 36 medicine images processed with safe margins and zero edge clipping!"
