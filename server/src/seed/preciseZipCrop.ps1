Add-Type -AssemblyName System.Drawing

$zipPath = "C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip"
$tempDir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_zip_extract"
$destDir = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines"

if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

function Crop-And-Center-Product($srcBmp, [System.Drawing.Rectangle]$cropRect, $destFileName) {
    $cropped = $srcBmp.Clone($cropRect, $srcBmp.PixelFormat)

    $targetSize = 600
    $outBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.Clear([System.Drawing.Color]::White)

    # Product occupies 84% of canvas (small 8% margin around)
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

    $destPath = Join-Path $destDir $destFileName
    $outBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Write-Host "Processed: $destFileName (${destW}x${destH} centered on 600x600)"
}

function Auto-Crop-Helper($filePath, $destFileName, $minXLimit = 0, $maxXLimit = 600) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $w = $bmp.Width
    $h = $bmp.Height

    $colCounts = New-Object int[] $w
    $rowCounts = New-Object int[] $h

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = $minXLimit; $x -lt [Math]::Min($w, $maxXLimit); $x++) {
            $p = $bmp.GetPixel($x, $y)
            $isBg = ($p.A -lt 30) -or ($p.R -ge 245 -and $p.G -ge 245 -and $p.B -ge 245)
            if (-not $isBg) {
                $colCounts[$x]++
                $rowCounts[$y]++
            }
        }
    }

    $minX = $minXLimit
    while ($minX -lt $maxXLimit -and $colCounts[$minX] -lt 10) { $minX++ }
    $maxX = $maxXLimit - 1
    while ($maxX -ge $minXLimit -and $colCounts[$maxX] -lt 10) { $maxX-- }
    $minY = 0
    while ($minY -lt $h -and $rowCounts[$minY] -lt 10) { $minY++ }
    $maxY = $h - 1
    while ($maxY -ge 0 -and $rowCounts[$maxY] -lt 10) { $maxY-- }

    if ($minX -lt $maxX -and $minY -lt $maxY) {
        $cropW = ($maxX - $minX) + 1
        $cropH = ($maxY - $minY) + 1
        $rect = [System.Drawing.Rectangle]::new($minX, $minY, $cropW, $cropH)
        Crop-And-Center-Product $bmp $rect $destFileName
    }
    $bmp.Dispose()
}

# 1. Fever & Pain
Auto-Crop-Helper "$tempDir\02_Crocin_500_Advance_Tablet.png" "crocin-500-advance-tablet.png"
Auto-Crop-Helper "$tempDir\03_Combiflam_Tablet.png" "combiflam-tablet.png"
Auto-Crop-Helper "$tempDir\04_Meftal_Spas_Tablet.png" "meftal-spas-tablet.png"
Auto-Crop-Helper "$tempDir\05_Saridon_Headache_Relief_Tablet.png" "saridon-headache-relief-tablet.png"
Auto-Crop-Helper "$tempDir\06_Volini_Pain_Relief_Gel_50g.png" "volini-pain-relief-gel.png"
Auto-Crop-Helper "$tempDir\07_Calpol_250mg_Paediatric_Suspension_60ml.png" "calpol-250mg-paediatric-suspension.png"

# 2. Cold & Cough
Auto-Crop-Helper "$tempDir\08_Asthalin_100mcg_Inhaler.png" "asthalin-100mcg-inhaler.png" 0 300
Auto-Crop-Helper "$tempDir\09_Budecort_200mcg_Inhaler.png" "budecort-200mcg-inhaler.png" 0 300
Auto-Crop-Helper "$tempDir\10_Ascoril_D_Plus_Syrup_100ml.png" "ascoril-d-plus-syrup.png" 0 300
Auto-Crop-Helper "$tempDir\11_Benadryl_Cough_Formula_Syrup_150ml.png" "benadryl-cough-formula-syrup.png" 0 300
Auto-Crop-Helper "$tempDir\11_Benadryl_Cough_Formula_Syrup_150ml.png" "otrivin-oxy-fast-relief-nasal-spray.png" 310 600
Auto-Crop-Helper "$tempDir\12_Otrivin_Oxy_Fast_Relief_Nasal_Spray_10ml.png" "maxtra-oral-drops.png" 310 600

# 3. Digestive Care
Auto-Crop-Helper "$tempDir\14_Pan-D_Capsule.png" "pan-d-capsule.png"
Auto-Crop-Helper "$tempDir\15_Digene_Acidity_Relief_Gel_Mint_200ml.png" "digene-acidity-relief-gel-mint.png"
Auto-Crop-Helper "$tempDir\16_Electral_ORS_Powder_Sachet_21.8g.png" "electral-ors-powder.png"
Auto-Crop-Helper "$tempDir\17_Ondem_Syrup_30ml.png" "ondem-syrup.png"

# 4. Cardiac & Diabetes
Auto-Crop-Helper "$tempDir\18_Telma_40mg_Tablet.png" "telma-40mg-tablet.png"
Auto-Crop-Helper "$tempDir\19_Ecosprin_75mg_Tablet.png" "ecosprin-75mg-tablet.png"
Auto-Crop-Helper "$tempDir\20_Sorbitrate_5mg_Sublingual_Tablet.png" "sorbitrate-5mg-sublingual-tablet.png"
Auto-Crop-Helper "$tempDir\21_Atorva_20mg_Tablet.png" "atorva-20mg-tablet.png"
Auto-Crop-Helper "$tempDir\22_Glycomet-GP_1_Tablet.png" "glycomet-gp-1-tablet.png"
Auto-Crop-Helper "$tempDir\23_Janumet_50_500mg_Tablet.png" "janumet-50mg-500mg-tablet.png"
Auto-Crop-Helper "$tempDir\24_Human_Mixtard_30_70_100IU_ml_Injection.png" "human-mixtard-30-70-injection.png"

# 5. Antibiotics & Anti-infectives
Auto-Crop-Helper "$tempDir\25_Augmentin_625_Duo_Tablet.png" "augmentin-625-duo-tablet.png" 0 340
Auto-Crop-Helper "$tempDir\26_Azithral_500mg_Tablet.png" "azithral-500mg-tablet.png" 0 340
Auto-Crop-Helper "$tempDir\27_Ciplox_500mg_Tablet.png" "ciplox-500mg-tablet.png" 0 340
Auto-Crop-Helper "$tempDir\28_Taxim-O_200mg_Tablet.png" "taxim-o-200mg-tablet.png"

# 6. Vitamins & Supplements
Auto-Crop-Helper "$tempDir\29_Limcee_500mg_Chewable_Tablet.png" "limcee-500mg-chewable-tablet.png"
Auto-Crop-Helper "$tempDir\30_Shelcal_500_Tablet.png" "shelcal-500-tablet.png"
Auto-Crop-Helper "$tempDir\31_Becosules_Z_Capsule.png" "becosules-z-capsule.png"

# 7. First Aid & Surgical
Auto-Crop-Helper "$tempDir\32_Betadine_10%_Ointment_20g.png" "betadine-10-microbicidal-ointment.png"
Auto-Crop-Helper "$tempDir\33_Dettol_Antiseptic_Liquid_250ml.png" "dettol-antiseptic-liquid.png" 300 600
Auto-Crop-Helper "$tempDir\34_Hansaplast_Regular_Bandage_Strips_20.png" "hansaplast-regular-bandage-strips.png"

# 8. Women Care & Hygiene
Auto-Crop-Helper "$tempDir\35_Whisper_Ultra_Clean_XL_30_Pads.png" "whisper-ultra-clean-sanitary-pads.png"
Auto-Crop-Helper "$tempDir\36_VWash_Plus_Intimate_Wash_200ml.png" "vwash-plus-intimate-hygiene-wash.png"

# Dolo 650 (user photo)
$doloUserPhoto = "C:\Users\arpit\.gemini\antigravity\brain\8cabef4e-9ef7-43ec-96b1-f84cdf89d73f\.user_uploaded\media_1788014015775.png"
if (Test-Path $doloUserPhoto) {
    Auto-Crop-Helper $doloUserPhoto "dolo-650mg-tablet.png"
}

Remove-Item -Path $tempDir -Recurse -Force
Write-Host "All 36 medicine images processed directly from source ZIP!"
