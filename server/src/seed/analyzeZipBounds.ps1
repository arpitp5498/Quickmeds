Add-Type -AssemblyName System.Drawing
$dir = "c:\Users\arpit\OneDrive\Documents\medirush\temp_inspect"
$files = Get-ChildItem $dir

foreach ($f in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
    $w = $bmp.Width
    $h = $bmp.Height

    $minX = $w; $minY = $h; $maxX = 0; $maxY = 0
    $nonBgCount = 0

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $isBg = ($p.A -lt 30) -or ($p.R -ge 245 -and $p.G -ge 245 -and $p.B -ge 245)
            if (-not $isBg) {
                $nonBgCount++
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $bmp.Dispose()
    $cropW = ($maxX - $minX) + 1
    $cropH = ($maxY - $minY) + 1
    Write-Host "$($f.Name) | NonBgPixels=$nonBgCount | Bounds=[$minX, $minY, $maxX, $maxY] | Size=${cropW}x${cropH}"
}
