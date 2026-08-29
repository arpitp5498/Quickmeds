Add-Type -AssemblyName System.Drawing

$zipPath = "C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip"
$tempDir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_zip_extract"
$destDir = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines"

if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

function Crop-And-Save($srcBmp, $srcRect, $destFileName) {
    $cropped = $srcBmp.Clone($srcRect, $srcBmp.PixelFormat)

    $targetSize = 600
    $outBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.Clear([System.Drawing.Color]::White)

    # Product occupies 84% of canvas (small 8% margin on each side)
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
    $tempPath = "$destPath.tmp.png"
    $outBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()

    Move-Item -Path $tempPath -Destination $destPath -Force
    Write-Host "✅ Created: $destFileName (Source crop: $($srcRect.Width)x$($srcRect.Height) -> Canvas: 600x600, Product: ${destW}x${destH})"
}

function Auto-Crop-Image($srcFilePath, $destFileName, $maxRightBound = 600) {
    $bmp = [System.Drawing.Bitmap]::FromFile($srcFilePath)
    $w = $bmp.Width
    $h = $bmp.Height

    $effectiveW = [Math]::Min($w, $maxRightBound)

    $colCounts = New-Object int[] $effectiveW
    $rowCounts = New-Object int[] $h

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $effectiveW; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $isBg = ($p.A -lt 30) -or ($p.R -ge 245 -and $p.G -ge 245 -and $p.B -ge 245)
            if (-not $isBg) {
                $colCounts[$x]++
                $rowCounts[$y]++
            }
        }
    }

    $threshold = 10
    $minX = 0
    while ($minX -lt $effectiveW -and $colCounts[$minX] -lt $threshold) { $minX++ }

    $maxX = $effectiveW - 1
    while ($maxX -ge 0 -and $colCounts[$maxX] -lt $threshold) { $maxX-- }

    $minY = 0
    while ($minY -lt $h -and $rowCounts[$minY] -lt $threshold) { $minY++ }

    $maxY = $h - 1
    while ($maxY -ge 0 -and $rowCounts[$maxY] -lt $threshold) { $maxY-- }

    if ($minX -lt $maxX -and $minY -lt $maxY) {
        $cropW = ($maxX - $minX) + 1
        $cropH = ($maxY - $minY) + 1
        $cropRect = [System.Drawing.Rectangle]::new($minX, $minY, $cropW, $cropH)
        Crop-And-Save $bmp $cropRect $destFileName
    } else {
        Write-Warning "Could not find content in $srcFilePath"
    }

    $bmp.Dispose()
}

# 1. Process standard single items from ZIP
$standardMap = @{
    '02_Crocin_500_Advance_Tablet.png' = 'crocin-500-advance-tablet.png';
    '03_Combiflam_Tablet.png' = 'combiflam-tablet.png';
    '04_Meftal_Spas_Tablet.png' = 'meftal-spas-tablet.png';
    '05_Saridon_Headache_Relief_Tablet.png' = 'saridon-headache-relief-tablet.png';
    '06_Volini_Pain_Relief_Gel_50g.png' = 'volini-pain-relief-gel.png';
    '07_Calpol_250mg_Paediatric_Suspension_60ml.png' = 'calpol-250mg-paediatric-suspension.png';
    '14_Pan-D_Capsule.png' = 'pan-d-capsule.png';
    '15_Digene_Acidity_Relief_Gel_Mint_200ml.png' = 'digene-acidity-relief-gel-mint.png';
    '16_Electral_ORS_Powder_Sachet_21.8g.png' = 'electral-ors-powder.png';
    '17_Ondem_Syrup_30ml.png' = 'ondem-syrup.png';
    '18_Telma_40mg_Tablet.png' = 'telma-40mg-tablet.png';
    '19_Ecosprin_75mg_Tablet.png' = 'ecosprin-75mg-tablet.png';
    '20_Sorbitrate_5mg_Sublingual_Tablet.png' = 'sorbitrate-5mg-sublingual-tablet.png';
    '21_Atorva_20mg_Tablet.png' = 'atorva-20mg-tablet.png';
    '22_Glycomet-GP_1_Tablet.png' = 'glycomet-gp-1-tablet.png';
    '23_Janumet_50_500mg_Tablet.png' = 'janumet-50mg-500mg-tablet.png';
    '24_Human_Mixtard_30_70_100IU_ml_Injection.png' = 'human-mixtard-30-70-injection.png';
    '25_Augmentin_625_Duo_Tablet.png' = 'augmentin-625-duo-tablet.png';
    '26_Azithral_500mg_Tablet.png' = 'azithral-500mg-tablet.png';
    '27_Ciplox_500mg_Tablet.png' = 'ciplox-500mg-tablet.png';
    '28_Taxim-O_200mg_Tablet.png' = 'taxim-o-200mg-tablet.png';
    '29_Limcee_500mg_Chewable_Tablet.png' = 'limcee-500mg-chewable-tablet.png';
    '30_Shelcal_500_Tablet.png' = 'shelcal-500-tablet.png';
    '31_Becosules_Z_Capsule.png' = 'becosules-z-capsule.png';
    '32_Betadine_10%_Ointment_20g.png' = 'betadine-10-microbicidal-ointment.png';
    '33_Dettol_Antiseptic_Liquid_250ml.png' = 'dettol-antiseptic-liquid.png';
    '34_Hansaplast_Regular_Bandage_Strips_20.png' = 'hansaplast-regular-bandage-strips.png';
    '35_Whisper_Ultra_Clean_XL_30_Pads.png' = 'whisper-ultra-clean-sanitary-pads.png';
    '36_VWash_Plus_Intimate_Wash_200ml.png' = 'vwash-plus-intimate-hygiene-wash.png';
}

foreach ($entry in $standardMap.GetEnumerator()) {
    $srcPath = Join-Path $tempDir $entry.Key
    Auto-Crop-Image $srcPath $entry.Value
}

# 2. Process Cold & Cough items (isolating left items from separator line)
Auto-Crop-Image (Join-Path $tempDir '08_Asthalin_100mcg_Inhaler.png') 'asthalin-100mcg-inhaler.png' 300
Auto-Crop-Image (Join-Path $tempDir '09_Budecort_200mcg_Inhaler.png') 'budecort-200mcg-inhaler.png' 300
Auto-Crop-Image (Join-Path $tempDir '10_Ascoril_D_Plus_Syrup_100ml.png') 'ascoril-d-plus-syrup.png' 300
Auto-Crop-Image (Join-Path $tempDir '11_Benadryl_Cough_Formula_Syrup_150ml.png') 'benadryl-cough-formula-syrup.png' 300
Auto-Crop-Image (Join-Path $tempDir '12_Otrivin_Oxy_Fast_Relief_Nasal_Spray_10ml.png') 'otrivin-oxy-fast-relief-nasal-spray.png' 300

# 3. For Maxtra Oral Drops: crop the right side of file 12
$f12 = [System.Drawing.Bitmap]::FromFile((Join-Path $tempDir '12_Otrivin_Oxy_Fast_Relief_Nasal_Spray_10ml.png'))
$maxtraRect = [System.Drawing.Rectangle]::new(310, 220, 95, 160)
Crop-And-Save $f12 $maxtraRect 'maxtra-oral-drops.png'
$f12.Dispose()

# 4. For Dolo 650: process the authentic user photo
$doloUserPhoto = "C:\Users\arpit\.gemini\antigravity\brain\8cabef4e-9ef7-43ec-96b1-f84cdf89d73f\.user_uploaded\media_1788014015775.png"
if (Test-Path $doloUserPhoto) {
    Auto-Crop-Image $doloUserPhoto 'dolo-650mg-tablet.png'
}

# Clean temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "`n🎉 All 36 medicine images cropped directly from source ZIP & user photo!"
