. "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\generate_primitives.ps1"

$canvas = Init-Canvas 1920 1080
$bmp = $canvas.bmp
$g = $canvas.g

Draw-Header $g "03 / GEOSPATIAL FIDELITY" "SUB-10M SATELLITE ENGINE & DUAL-LAYER TRACING" "Aligning river vectors directly against Google Satellite Hybrid layers with zero inland drift"

# Left / Center: Desktop Mockup Frame (x: 80, y: 210, w: 1260, h: 810)
$mockX = 80
$mockY = 210
$mockW = 1260
$mockH = 810

# Bezel
$bezelPath = Create-RoundedPath $mockX $mockY $mockW $mockH 28
$bezelBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
$bezelPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 6, 182, 212), 2)
$g.FillPath($bezelBg, $bezelPath)
$g.DrawPath($bezelPen, $bezelPath)

# Top browser bar
$barH = 45
$barPath = Create-RoundedPath $mockX $mockY $mockW $barH 28
$barBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 10, 16, 29))
$g.FillPath($barBg, $barPath)

# Traffic light dots
$dotRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
$dotYel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
$dotGrn = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
$g.FillEllipse($dotRed, ($mockX + 25), ($mockY + 16), 12, 12)
$g.FillEllipse($dotYel, ($mockX + 48), ($mockY + 16), 12, 12)
$g.FillEllipse($dotGrn, ($mockX + 71), ($mockY + 16), 12, 12)

# URL bar inside mockup
$urlPath = Create-RoundedPath ($mockX + 110) ($mockY + 10) 650 26 13
$urlBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 20, 30, 50))
$g.FillPath($urlBg, $urlPath)
$fontUrl = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Regular)
$brushMuted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("🔒 https://mohammadgolamrabbii.github.io/Bangladesh-Rivers-Geo-Vault/", $fontUrl, $brushMuted, ($mockX + 130), ($mockY + 15))

# Screen Content (Draw balu_trace.png or satellite_map.png)
$screenX = $mockX + 10
$screenY = $mockY + $barH
$screenW = $mockW - 20
$screenH = $mockH - $barH - 10

$satPath = "$rawDir\balu_trace.png"
if (-not (Test-Path $satPath)) {
    $satPath = "$rawDir\satellite_map.png"
}

if (Test-Path $satPath) {
    $satImg = [System.Drawing.Image]::FromFile($satPath)
    $scrPath = Create-RoundedPath $screenX $screenY $screenW $screenH 18
    $g.SetClip($scrPath)
    $srcRect = New-Object System.Drawing.Rectangle 0, 0, $satImg.Width, $satImg.Height
    $destRect = New-Object System.Drawing.Rectangle $screenX, $screenY, $screenW, $screenH
    $g.DrawImage($satImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.ResetClip()
    $scrPath.Dispose()
    $satImg.Dispose()
}

# 4 Floating Callout Annotation Badges
# Pin 1: Top Left - Search HUD
$p1Path = Create-RoundedPath ($screenX + 30) ($screenY + 30) 340 50 16
$p1Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 7, 13, 24))
$p1Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 6, 182, 212), 1.5)
$g.FillPath($p1Bg, $p1Path)
$g.DrawPath($p1Pen, $p1Path)
$fontPinT = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$brushCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("01 · FLOATING SEARCH HUD", $fontPinT, $brushCyan, ($screenX + 50), ($screenY + 40))
$fontPinD = New-Object System.Drawing.Font ("Inter", [float]8, [System.Drawing.FontStyle]::Regular)
$brushWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 241, 245, 249))
$g.DrawString("Zero-latency bilingual autocomplete", $fontPinD, $brushWhite, ($screenX + 50), ($screenY + 58))

# Pin 2: Top Right - Dual Layer Switcher
$p2Path = Create-RoundedPath ($screenX + $screenW - 370) ($screenY + 30) 340 50 16
$g.FillPath($p1Bg, $p2Path)
$g.DrawPath($p1Pen, $p2Path)
$g.DrawString("02 · SATELLITE HYBRID SWITCHER", $fontPinT, $brushCyan, ($screenX + $screenW - 350), ($screenY + 40))
$g.DrawString("Dark Vector <-> Google Satellite Hybrid", $fontPinD, $brushWhite, ($screenX + $screenW - 350), ($screenY + 58))

# Pin 3: Center River Vector - Balu River Flow Trace
$p3Path = Create-RoundedPath ($screenX + 220) ($screenY + 360) 410 60 16
$p3Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220, 16, 185, 129), 1.5)
$g.FillPath($p1Bg, $p3Path)
$g.DrawPath($p3Pen, $p3Path)
$brushGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
$g.DrawString("03 · SUB-10M RIVER TRAJECTORY TRACE", $fontPinT, $brushGreen, ($screenX + 240), ($screenY + 372))
$g.DrawString("Balu River: Origin (Gazipur) -> Outfall (Shitalakshya)", $fontPinD, $brushWhite, ($screenX + 240), ($screenY + 394))

# Pin 4: Bottom Right - Leaflet Zoom Positioned for Zero Overlap
$p4Path = Create-RoundedPath ($screenX + $screenW - 390) ($screenY + $screenH - 90) 360 60 16
$p4Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220, 245, 158, 11), 1.5)
$g.FillPath($p1Bg, $p4Path)
$g.DrawPath($p4Pen, $p4Path)
$brushAmber = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
$g.DrawString("04 · REPOSITIONED ZOOM CONTROLS", $fontPinT, $brushAmber, ($screenX + $screenW - 370), ($screenY + $screenH - 78))
$g.DrawString("Leaflet zoom moved to bottom-right (zero HUD overlap)", $fontPinD, $brushWhite, ($screenX + $screenW - 370), ($screenY + $screenH - 56))


# Right Column: Technical Dossier Card
$rightX = 1380
$rightY = 210
$rightW = 460
$rightH = 810

Draw-GlassCard $g $rightX $rightY $rightW $rightH 24 160

$fontDossierT = New-Object System.Drawing.Font ("Inter", [float]14, [System.Drawing.FontStyle]::Bold)
$g.DrawString("HYDROLOGICAL SPATIAL ENGINE", $fontDossierT, $brushCyan, ($rightX + 35), ($rightY + 35))

$fontDossierS = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Technical methodology & cartographic validation", $fontDossierS, $brushMuted, ($rightX + 35), ($rightY + 65))

# 4 Technical Features
$techPoints = @(
    @{
        title = "Topological Polyline Splines";
        desc = "Each of the 1,315 rivers is represented as a high-density GeoJSON LineString verified against national hydrological flow gauges and contour elevations."
    },
    @{
        title = "Dual Origin / Outfall Vector Nodes";
        desc = "Interactive green pulse markers designate river origin springs, while red target markers indicate estuarine confluences and bay outfalls."
    },
    @{
        title = "Sub-10m Coordinate Precision";
        desc = "Eliminated inland polyline drift by cross-referencing high-resolution Google Satellite Hybrid tiles, ensuring vectors follow actual water channels."
    },
    @{
        title = "Zero-Overhead Leaflet Engine";
        desc = "Dynamic hardware-accelerated canvas renderer handling 1,300+ vector paths simultaneously at a solid 60 FPS across desktop and mobile devices."
    }
)

$fontTechT = New-Object System.Drawing.Font ("Inter", [float]11.5, [System.Drawing.FontStyle]::Bold)
$fontTechD = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)

for ($i = 0; $i -lt 4; $i++) {
    $ty = $rightY + 115 + ($i * 145)
    $tp = $techPoints[$i]
    
    # Sub-card
    Draw-GlassCard $g ($rightX + 25) $ty ($rightW - 50) 130 16 180
    
    $g.DrawString($tp.title, $fontTechT, $brushWhite, ($rightX + 45), ($ty + 18))
    $rectTPD = New-Object System.Drawing.RectangleF ($rightX + 45), ($ty + 44), ($rightW - 90), 75
    $g.DrawString($tp.desc, $fontTechD, $brushMuted, $rectTPD)
}

# Bottom stats strip inside right column
$botY = $rightY + 705
Draw-GlassCard $g ($rightX + 25) $botY ($rightW - 50) 80 16 200 ([System.Drawing.Color]::FromArgb(120, 6, 182, 212))

$fontStatBVal = New-Object System.Drawing.Font ("Inter", [float]16, [System.Drawing.FontStyle]::Bold)
$fontStatBLbl = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Bold)

$g.DrawString("60 FPS", $fontStatBVal, $brushCyan, ($rightX + 45), ($botY + 16))
$g.DrawString("CANVAS SPEED", $fontStatBLbl, $brushMuted, ($rightX + 45), ($botY + 44))

$g.DrawString("<10m", $fontStatBVal, $brushGreen, ($rightX + 185), ($botY + 16))
$g.DrawString("SATELLITE ACCURACY", $fontStatBLbl, $brushMuted, ($rightX + 185), ($botY + 44))

$g.DrawString("0ms", $fontStatBVal, $brushAmber, ($rightX + 335), ($botY + 16))
$g.DrawString("VECTOR LATENCY", $fontStatBLbl, $brushMuted, ($rightX + 335), ($botY + 44))

$outFile = "$outDir\04_gis_satellite_showcase_1920x1080.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Slide 4 generated: $outFile ($((Get-Item $outFile).Length) bytes)"
