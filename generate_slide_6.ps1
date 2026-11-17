. "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\generate_primitives.ps1"

$canvas = Init-Canvas 1920 1080
$bmp = $canvas.bmp
$g = $canvas.g

Draw-Header $g "05 / MULTI-DEVICE ACCESSIBILITY" "MOBILE-FIRST RESPONSIVE ARCHITECTURE" "Optimized for one-handed thumb interaction and outdoor riverbank field exploration"

# Smartphone Mockup 1: Mobile Map View (x: 120, y: 220, w: 380, h: 780)
$p1X = 120
$pY = 220
$pW = 380
$pH = 780

function Draw-PhoneFrame($g, [float]$x, [float]$y, [float]$w, [float]$h, [string]$label) {
    # Phone Body (Outer Bezel)
    $phonePath = Create-RoundedPath $x $y $w $h 44
    $phoneBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $phonePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 6, 182, 212), 2.5)
    $g.FillPath($phoneBg, $phonePath)
    $g.DrawPath($phonePen, $phonePath)
    
    # Screen Area
    $scX = $x + 12
    $scY = $y + 12
    $scW = $w - 24
    $scH = $h - 24
    $scPath = Create-RoundedPath $scX $scY $scW $scH 34
    $scBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 11, 20))
    $g.FillPath($scBg, $scPath)

    # Dynamic Island / Camera Notch
    $notchPath = Create-RoundedPath ($x + ($w / 2) - 50) ($y + 20) 100 24 12
    $notchBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 2, 6, 12))
    $g.FillPath($notchBg, $notchPath)
    $notchPath.Dispose()
    $notchBg.Dispose()

    # Home indicator bar at bottom
    $homePath = Create-RoundedPath ($x + ($w / 2) - 60) ($y + $h - 25) 120 5 2.5
    $homeBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(150, 148, 163, 184))
    $g.FillPath($homeBg, $homePath)
    $homePath.Dispose()
    $homeBg.Dispose()

    # Bottom label under phone
    $fontLbl = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Bold)
    $brushCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
    $g.DrawString($label, $fontLbl, $brushCyan, ($x + 30), ($y + $h + 15))
    $fontLbl.Dispose()
    $brushCyan.Dispose()

    return @{ x=$scX; y=$scY; w=$scW; h=$scH; path=$scPath }
}

$phone1 = Draw-PhoneFrame $g $p1X $pY $pW $pH "VIEWPORT 01: MOBILE MAP & HUD"

# Fill Phone 1 with Map View
$mapPath = "$rawDir\satellite_map.png"
if (Test-Path $mapPath) {
    $mImg = [System.Drawing.Image]::FromFile($mapPath)
    $g.SetClip($phone1.path)
    # Center crop of map
    $srcR = New-Object System.Drawing.Rectangle ($mImg.Width / 4), ($mImg.Height / 4), ($mImg.Width / 2), ($mImg.Height / 2)
    $destR = New-Object System.Drawing.Rectangle $phone1.x, $phone1.y, $phone1.w, $phone1.h
    $g.DrawImage($mImg, $destR, $srcR, [System.Drawing.GraphicsUnit]::Pixel)
    $g.ResetClip()
    $mImg.Dispose()
}

# Floating search pill on Phone 1
$p1SearchPath = Create-RoundedPath ($phone1.x + 15) ($phone1.y + 55) ($phone1.w - 30) 42 21
$p1SearchBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 7, 13, 24))
$p1SearchPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 6, 182, 212), 1)
$g.FillPath($p1SearchBg, $p1SearchPath)
$g.DrawPath($p1SearchPen, $p1SearchPath)
$fontP1S = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)
$brushMuted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("🔍 Search 1,315 rivers...", $fontP1S, $brushMuted, ($phone1.x + 30), ($phone1.y + 68))

# Bottom sheet drawer on Phone 1
$bsY = $phone1.y + $phone1.h - 180
$bsPath = Create-RoundedPath ($phone1.x + 10) $bsY ($phone1.w - 20) 160 20
$bsBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235, 10, 16, 29))
$bsPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 56, 189, 248), 1)
$g.FillPath($bsBg, $bsPath)
$g.DrawPath($bsPen, $bsPath)

# Bottom sheet content
$fontBST = New-Object System.Drawing.Font ("Hind Siliguri", [float]13, [System.Drawing.FontStyle]::Bold)
$brushCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("পদ্মা নদী (Padma River)", $fontBST, $brushCyan, ($phone1.x + 25), ($bsY + 20))
$fontBSS = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Regular)
$brushWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
$g.DrawString("Length: 324 km · 57 Transboundary", $fontBSS, $brushWhite, ($phone1.x + 25), ($bsY + 48))
$g.DrawString("Origin: Himalayas -> Outfall: Bay of Bengal", $fontBSS, $brushMuted, ($phone1.x + 25), ($bsY + 68))

# Quick action button in bottom sheet
$btnPath = Create-RoundedPath ($phone1.x + 25) ($bsY + 98) ($phone1.w - 50) 36 10
$btnBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.FillPath($btnBg, $btnPath)
$brushDark = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 11, 20))
$fontBtn = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$g.DrawString("📍 Focus River Flow Trajectory", $fontBtn, $brushDark, ($phone1.x + 65), ($bsY + 108))


# Smartphone Mockup 2: Expanded Mobile Dossier (x: 550, y: 220, w: 380, h: 780)
$p2X = 550
$phone2 = Draw-PhoneFrame $g $p2X $pY $pW $pH "VIEWPORT 02: EXPANDED RIVER DOSSIER"

# Fill Phone 2 with Expanded Dossier Screen
$dossierMockPath = Create-RoundedPath ($phone2.x + 10) ($phone2.y + 55) ($phone2.w - 20) ($phone2.h - 90) 20
$dmBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 10, 16, 29))
$dmPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 6, 182, 212), 1)
$g.FillPath($dmBg, $dossierMockPath)
$g.DrawPath($dmPen, $dossierMockPath)

# Dossier title inside Phone 2
$fontD2T = New-Object System.Drawing.Font ("Hind Siliguri", [float]16, [System.Drawing.FontStyle]::Bold)
$g.DrawString("বালু নদী (Balu River)", $fontD2T, $brushCyan, ($phone2.x + 25), ($phone2.y + 75))
$fontD2S = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Transboundary: No · Class: Navigable", $fontD2S, $brushMuted, ($phone2.x + 25), ($phone2.y + 110))

# 3 Mini Stat Boxes inside Phone 2
$s1Box = Create-RoundedPath ($phone2.x + 25) ($phone2.y + 140) 90 60 10
$sBoxBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
$g.FillPath($sBoxBg, $s1Box)
$fontVal = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Bold)
$fontLbl = New-Object System.Drawing.Font ("Inter", [float]7.5, [System.Drawing.FontStyle]::Bold)
$g.DrawString("44 km", $fontVal, $brushCyan, ($phone2.x + 35), ($phone2.y + 150))
$g.DrawString("LENGTH", $fontLbl, $brushMuted, ($phone2.x + 35), ($phone2.y + 172))

$s2Box = Create-RoundedPath ($phone2.x + 125) ($phone2.y + 140) 95 60 10
$g.FillPath($sBoxBg, $s2Box)
$g.DrawString("Gazipur", $fontVal, $brushWhite, ($phone2.x + 135), ($phone2.y + 150))
$g.DrawString("ORIGIN", $fontLbl, $brushMuted, ($phone2.x + 135), ($phone2.y + 172))

$s3Box = Create-RoundedPath ($phone2.x + 230) ($phone2.y + 140) 105 60 10
$g.FillPath($sBoxBg, $s3Box)
$g.DrawString("Demra", $fontVal, $brushWhite, ($phone2.x + 240), ($phone2.y + 150))
$g.DrawString("OUTFALL", $fontLbl, $brushMuted, ($phone2.x + 240), ($phone2.y + 172))

# District Path Tags
$fontTagH = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Bold)
$g.DrawString("DISTRICT FLOW PATH", $fontTagH, $brushMuted, ($phone2.x + 25), ($phone2.y + 220))
$distText = "Gazipur ➔ Dhaka ➔ Narayanganj"
$fontDist = New-Object System.Drawing.Font ("Inter", [float]10, [System.Drawing.FontStyle]::Bold)
$g.DrawString($distText, $fontDist, $brushWhite, ($phone2.x + 25), ($phone2.y + 240))

# BCS Exam Card inside Phone 2
$bcsCard = Create-RoundedPath ($phone2.x + 25) ($phone2.y + 280) ($phone2.w - 50) 180 14
$bcsBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 245, 158, 11))
$bcsPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 245, 158, 11), 1)
$g.FillPath($bcsBg, $bcsCard)
$g.DrawPath($bcsPen, $bcsCard)

$brushAmber = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
$g.DrawString("🎓 BCS EXAM INTELLIGENCE", $fontTagH, $brushAmber, ($phone2.x + 40), ($phone2.y + 295))
$bcsQ = "প্রশ্ন: বালু নদী কোন নদীর উপনদী?`n`nউত্তর: শীতলক্ষ্যা নদী (Shitalakshya River)।`n`nপ্রাসঙ্গিক তথ্য: এটি গাজীপুরের বিল বেলাই থেকে উৎপত্তি লাভ করে ডেমরায় শীতলক্ষ্যায় পতিত হয়।"
$fontBCSText = New-Object System.Drawing.Font ("Hind Siliguri", [float]9.5, [System.Drawing.FontStyle]::Regular)
$rectBCS = New-Object System.Drawing.RectangleF ($phone2.x + 40), ($phone2.y + 320), ($phone2.w - 80), 125
$g.DrawString($bcsQ, $fontBCSText, $brushWhite, $rectBCS)


# --- RIGHT COLUMN: MOBILE UX ARCHITECTURE & ERGONOMICS ---
$rightX = 990
$rightY = 220
$rightW = 850
$rightH = 780

Draw-GlassCard $g $rightX $rightY $rightW $rightH 24 160

$fontRightT = New-Object System.Drawing.Font ("Inter", [float]14, [System.Drawing.FontStyle]::Bold)
$g.DrawString("MOBILE ERGONOMICS & FIELD ACCESSIBILITY", $fontRightT, $brushCyan, ($rightX + 40), ($rightY + 35))
$fontRightS = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Engineered specifically for field geologists, environmental researchers, and mobile users", $fontRightS, $brushMuted, ($rightX + 40), ($rightY + 65))

$mobileFeatures = @(
    @{
        title = "48px Touch Targets & Thumb-Zone Reachability";
        tag = "ERGONOMICS";
        desc = "All interactive touch elements (search input, zoom triggers, district chips, and layer switches) meet Google Material 48x48px touch target specifications, enabling seamless single-handed navigation on large devices."
    },
    @{
        title = "Dynamic Responsive Viewport (480px) & Zero Overlap";
        tag = "LAYOUT STABILITY";
        desc = "Solved standard mobile Leaflet clipping by establishing a dedicated 480px map viewport with auto-collapsing search HUD and bottom-sheet drawers, eliminating modal clipping on compact iPhone & Android screens."
    },
    @{
        title = "Outdoor High-Contrast Sunlight Calibration";
        tag = "CONTRAST & OLED";
        desc = "Field testing revealed severe glare under tropical sunlight. The dark obsidian (#060B14) base combined with luminescent cyan (#06B6D4) vectors provides maximum readability even under direct sunlight along riverbanks."
    },
    @{
        title = "Zero-Backend Offline PWA Caching Readiness";
        tag = "OFFLINE ARCHITECTURE";
        desc = "With zero server-side processing dependencies, the entire 1,315 river Topo-GeoJSON database can be cached via Service Workers, allowing offline field surveys in remote rural river deltas without cellular data."
    }
)

$fontMFT = New-Object System.Drawing.Font ("Inter", [float]12, [System.Drawing.FontStyle]::Bold)
$fontMFTag = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Bold)
$fontMFD = New-Object System.Drawing.Font ("Inter", [float]10, [System.Drawing.FontStyle]::Regular)

for ($i = 0; $i -lt 4; $i++) {
    $my = $rightY + 115 + ($i * 155)
    $mf = $mobileFeatures[$i]
    
    Draw-GlassCard $g ($rightX + 35) $my ($rightW - 70) 135 18 180
    
    # Tag Pill
    $tagPill = Create-RoundedPath ($rightX + 55) ($my + 16) 170 24 12
    $tagBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 6, 182, 212))
    $g.FillPath($tagBg, $tagPill)
    $g.DrawString($mf.tag, $fontMFTag, $brushCyan, ($rightX + 70), ($my + 21))
    
    # Title
    $g.DrawString($mf.title, $fontMFT, $brushWhite, ($rightX + 240), ($my + 18))
    
    # Description
    $rectMFD = New-Object System.Drawing.RectangleF ($rightX + 55), ($my + 50), ($rightW - 110), 75
    $g.DrawString($mf.desc, $fontMFD, $brushMuted, $rectMFD)
}

$outFile = "$outDir\06_mobile_responsive_1920x1080.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Slide 6 generated: $outFile ($((Get-Item $outFile).Length) bytes)"
