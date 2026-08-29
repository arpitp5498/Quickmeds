Add-Type -AssemblyName System.Drawing

$zipPath = "C:\Users\arpit\OneDrive\Desktop\QuickMeds_36_Individual_Medicine_Images.zip"
$tempRawDir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_raw_images"
$destDir = "c:\Users\arpit\OneDrive\Documents\medirush\client\public\medicines"

if (Test-Path $tempRawDir) {
    Remove-Item -Path $tempRawDir -Recurse -Force
}

Expand-Archive -Path $zipPath -DestinationPath $tempRawDir -Force

$fileMap = @{
  '02_Crocin_500_Advance_Tablet.png' = 'crocin-500-advance-tablet.png';
  '03_Combiflam_Tablet.png' = 'combiflam-tablet.png';
  '04_Meftal_Spas_Tablet.png' = 'meftal-spas-tablet.png';
  '05_Saridon_Headache_Relief_Tablet.png' = 'saridon-headache-relief-tablet.png';
  '06_Volini_Pain_Relief_Gel_50g.png' = 'volini-pain-relief-gel.png';
  '07_Calpol_250mg_Paediatric_Suspension_60ml.png' = 'calpol-250mg-paediatric-suspension.png';
  '08_Asthalin_100mcg_Inhaler.png' = 'asthalin-100mcg-inhaler.png';
  '09_Budecort_200mcg_Inhaler.png' = 'budecort-200mcg-inhaler.png';
  '10_Ascoril_D_Plus_Syrup_100ml.png' = 'ascoril-d-plus-syrup.png';
  '11_Benadryl_Cough_Formula_Syrup_150ml.png' = 'benadryl-cough-formula-syrup.png';
  '12_Otrivin_Oxy_Fast_Relief_Nasal_Spray_10ml.png' = 'otrivin-oxy-fast-relief-nasal-spray.png';
  '13_Maxtra_Oral_Drops_15ml.png' = 'maxtra-oral-drops.png';
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

$doloPath = "$destDir\dolo-650mg-tablet.png"

function Process-MedicineImage($srcPath, $destPath) {
    if (-not (Test-Path $srcPath)) {
        Write-Warning "Source not found: $srcPath"
        return
    }

    $bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
    $w = $bmp.Width
    $h = $bmp.Height

    $colCounts = New-Object int[] $w
    $rowCounts = New-Object int[] $h

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $isBg = ($p.A -lt 30) -or ($p.R -ge 245 -and $p.G -ge 245 -and $p.B -ge 245)
            if (-not $isBg) {
                $colCounts[$x]++
                $rowCounts[$y]++
            }
        }
    }

    $threshold = 12
    $minX = 0
    while ($minX -lt $w -and $colCounts[$minX] -lt $threshold) { $minX++ }

    $maxX = $w - 1
    while ($maxX -ge 0 -and $colCounts[$maxX] -lt $threshold) { $maxX-- }

    $minY = 0
    while ($minY -lt $h -and $rowCounts[$minY] -lt $threshold) { $minY++ }

    $maxY = $h - 1
    while ($maxY -ge 0 -and $rowCounts[$maxY] -lt $threshold) { $maxY-- }

    if ($minX -lt $maxX -and $minY -lt $maxY -and ($maxX - $minX) -gt 20 -and ($maxY - $minY) -gt 20) {
        $cropW = ($maxX - $minX) + 1
        $cropH = ($maxY - $minY) + 1

        $padX = [int]($cropW * 0.02)
        $padY = [int]($cropH * 0.02)

        $srcX = [Math]::Max(0, $minX - $padX)
        $srcY = [Math]::Max(0, $minY - $padY)
        $srcW = [Math]::Min($w - $srcX, $cropW + ($padX * 2))
        $srcH = [Math]::Min($h - $srcY, $cropH + ($padY * 2))

        $cropRect = [System.Drawing.Rectangle]::new($srcX, $srcY, $srcW, $srcH)
        $croppedBmp = $bmp.Clone($cropRect, $bmp.PixelFormat)
        $bmp.Dispose()

        $targetSize = 600
        $targetBmp = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($targetBmp)

        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $g.Clear([System.Drawing.Color]::White)

        $maxDim = $targetSize * 0.88
        $scale = [Math]::Min($maxDim / $srcW, $maxDim / $srcH)

        $destW = [int]($srcW * $scale)
        $destH = [int]($srcH * $scale)
        $destX = [int](($targetSize - $destW) / 2)
        $destY = [int](($targetSize - $destH) / 2)

        $destRect = [System.Drawing.Rectangle]::new($destX, $destY, $destW, $destH)
        $g.DrawImage($croppedBmp, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)

        $g.Dispose()
        $croppedBmp.Dispose()

        $tempOut = "$destPath.tmp.png"
        $targetBmp.Save($tempOut, [System.Drawing.Imaging.ImageFormat]::Png)
        $targetBmp.Dispose()

        Move-Item -Path $tempOut -Destination $destPath -Force
        Write-Host "Processed: $([System.IO.Path]::GetFileName($destPath)) (Cropped $srcW x $srcH -> Scaled $destW x $destH)"
    } else {
        $bmp.Dispose()
        Write-Host "Skipped (already full or empty): $([System.IO.Path]::GetFileName($destPath))"
    }
}

foreach ($entry in $fileMap.GetEnumerator()) {
    $src = Join-Path $tempRawDir $entry.Key
    $dest = Join-Path $destDir $entry.Value
    Process-MedicineImage $src $dest
}

if (Test-Path $tempRawDir) {
    Remove-Item -Path $tempRawDir -Recurse -Force
}

Write-Host "All medicine images successfully processed!"
