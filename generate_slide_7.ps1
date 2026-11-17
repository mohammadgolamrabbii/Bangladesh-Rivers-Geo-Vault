. "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\generate_primitives.ps1"

$canvas = Init-Canvas 1920 1080
$bmp = $canvas.bmp
$g = $canvas.g

Draw-Header $g "06 / ENGINEERING & CONCLUSION" "PERFORMANCE BENCHMARKS & CREATOR CREDITS" "Zero-framework overhead, sub-50ms execution speed, and 100% open-source civic tech"

# 3 Main Columns
$colY = 210
$colH = 820
$colW = 560

# --- COLUMN 1: FULL-STACK TECHNICAL ARCHITECTURE ---
$col1X = 80
Draw-GlassCard $g $col1X $colY $colW $colH 24 160

$fontSecT = New-Object System.Drawing.Font ("Inter", [float]14, [System.Drawing.FontStyle]::Bold)
$brushCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("ENGINEERING ARCHITECTURE", $fontSecT, $brushCyan, ($col1X + 35), ($colY + 30))

$fontSecS = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$brushMuted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("High-efficiency stack without heavy client frameworks", $fontSecS, $brushMuted, ($col1X + 35), ($colY + 60))

$techStack = @(
    @{
        title = "Pure Vanilla JavaScript (ES6+)";
        badge = "ZERO BLOAT";
        desc = "Built with pure ES6+ without React, Angular, or Vue overhead, ensuring instant hydration, minimal bundle size, and maximum longevity."
    },
    @{
        title = "Leaflet GIS Spatial Engine";
        badge = "HARDWARE CANVAS";
        desc = "Dynamic hardware-accelerated SVG and Canvas vector rendering capable of rendering thousands of river segments with smooth 60 FPS panning."
    },
    @{
        title = "Topo-GeoJSON Spatial Vault";
        badge = "PRECISION DATA";
        desc = "1,315 comprehensive river features structured with verified coordinates, source points, outfalls, district path arrays, and BCS exam metadata."
    },
    @{
        title = "Automated Node.js Test Suite";
        badge = "100% PASSING";
        desc = "Automated regression tests continuously verifying 1,315 total rivers, 57 transboundary rivers, and 30 BCS Q&A pairs before deployment."
    }
)

$fontTST = New-Object System.Drawing.Font ("Inter", [float]11.5, [System.Drawing.FontStyle]::Bold)
$fontTSB = New-Object System.Drawing.Font ("Inter", [float]8, [System.Drawing.FontStyle]::Bold)
$fontTSD = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$brushWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))

for ($i = 0; $i -lt 4; $i++) {
    $ty = $colY + 105 + ($i * 170)
    $ts = $techStack[$i]
    
    Draw-GlassCard $g ($col1X + 30) $ty 500 150 18 180
    
    # Badge
    $tsbPath = Create-RoundedPath ($col1X + 50) ($ty + 18) 140 22 11
    $tsbBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 6, 182, 212))
    $g.FillPath($tsbBg, $tsbPath)
    $g.DrawString($ts.badge, $fontTSB, $brushCyan, ($col1X + 62), ($ty + 22))
    
    # Title
    $g.DrawString($ts.title, $fontTST, $brushWhite, ($col1X + 50), ($ty + 48))
    
    # Desc
    $rectTSD = New-Object System.Drawing.RectangleF ($col1X + 50), ($ty + 75), 450, 65
    $g.DrawString($ts.desc, $fontTSD, $brushMuted, $rectTSD)
}


# --- COLUMN 2: PERFORMANCE BENCHMARKS ---
$col2X = 680
Draw-GlassCard $g $col2X $colY $colW $colH 24 160

$g.DrawString("PERFORMANCE BENCHMARKS", $fontSecT, $brushCyan, ($col2X + 35), ($colY + 30))
$g.DrawString("Verified on Google Lighthouse and real-world 4G networks", $fontSecS, $brushMuted, ($col2X + 35), ($colY + 60))

$benchmarks = @(
    @{ val="100"; unit="/100"; lbl="LIGHTHOUSE PERFORMANCE"; desc="Perfect audit score for desktop & mobile performance, accessibility, and best practices."; color=[System.Drawing.Color]::FromArgb(255, 16, 185, 129) },
    @{ val="< 50"; unit="ms"; lbl="SEARCH & FILTER LATENCY"; desc="Instant autocomplete response across 1,315 rivers via in-memory indexing."; color=[System.Drawing.Color]::FromArgb(255, 6, 182, 212) },
    @{ val="< 1.2"; unit="s"; lbl="FIRST CONTENTFUL PAINT (FCP)"; desc="Blazing-fast load time even on congested 3G/4G cellular connections."; color=[System.Drawing.Color]::FromArgb(255, 245, 158, 11) },
    @{ val="0"; unit="kb"; lbl="BACKEND OVERHEAD"; desc="Fully static architecture hosted on Edge CDN with automated GitHub Pages deployment."; color=[System.Drawing.Color]::FromArgb(255, 168, 85, 247) }
)

$fontBVal = New-Object System.Drawing.Font ("Inter", [float]28, [System.Drawing.FontStyle]::Bold)
$fontBUnit = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Bold)
$fontBLbl = New-Object System.Drawing.Font ("Inter", [float]10, [System.Drawing.FontStyle]::Bold)
$fontBDesc = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)

for ($i = 0; $i -lt 4; $i++) {
    $by = $colY + 105 + ($i * 170)
    $bm = $benchmarks[$i]
    
    Draw-GlassCard $g ($col2X + 30) $by 500 150 18 180
    
    $brushBVal = New-Object System.Drawing.SolidBrush ($bm.color)
    $g.DrawString($bm.val, $fontBVal, $brushBVal, ($col2X + 50), ($by + 16))
    $g.DrawString($bm.unit, $fontBUnit, $brushMuted, ($col2X + 160), ($by + 28))
    
    $g.DrawString($bm.lbl, $fontBLbl, $brushWhite, ($col2X + 50), ($by + 65))
    
    $rectBMD = New-Object System.Drawing.RectangleF ($col2X + 50), ($by + 90), 450, 50
    $g.DrawString($bm.desc, $fontBDesc, $brushMuted, $rectBMD)
}


# --- COLUMN 3: AUTHOR PROFILE & PROJECT LINKS ---
$col3X = 1280
Draw-GlassCard $g $col3X $colY $colW $colH 24 160

$g.DrawString("AUTHOR CREDITS & COLLABORATION", $fontSecT, $brushCyan, ($col3X + 35), ($colY + 30))
$g.DrawString("Open for global UI/UX design and Web GIS initiatives", $fontSecS, $brushMuted, ($col3X + 35), ($colY + 60))

# Profile Box
$profBoxY = $colY + 105
Draw-GlassCard $g ($col3X + 30) $profBoxY 500 280 20 200

# Avatar
$profPath = "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\assets\img\profile.jpg"
if (Test-Path $profPath) {
    $profImg = [System.Drawing.Image]::FromFile($profPath)
    $avRect = New-Object System.Drawing.Rectangle ($col3X + 55), ($profBoxY + 30), 100, 100
    $avPath = Create-RoundedPath ($col3X + 55) ($profBoxY + 30) 100 100 50
    $g.SetClip($avPath)
    $g.DrawImage($profImg, $avRect)
    $g.ResetClip()
    $avPath.Dispose()
    $profImg.Dispose()
    
    $avBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 6, 182, 212), 2.5)
    $g.DrawEllipse($avBorder, ($col3X + 55), ($profBoxY + 30), 100, 100)
    $avBorder.Dispose()
}

$fontAuthT = New-Object System.Drawing.Font ("Inter", [float]16, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Mohammad Golamrabbii", $fontAuthT, $brushWhite, ($col3X + 175), ($profBoxY + 35))

$fontAuthB = New-Object System.Drawing.Font ("Hind Siliguri", [float]13, [System.Drawing.FontStyle]::Regular)
$g.DrawString("মোহাম্মদ গোলাম রাব্বী", $fontAuthB, $brushCyan, ($col3X + 175), ($profBoxY + 65))

$fontAuthR = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Lead UI/UX Designer & GIS Developer`nGazipur, Dhaka, Bangladesh", $fontAuthR, $brushMuted, ($col3X + 175), ($profBoxY + 95))

# Bio note
$bioText = "Passionate about building high-contrast digital twins, accessible open civic tools, and high-impact visual design systems for complex real-world datasets."
$rectBio = New-Object System.Drawing.RectangleF ($col3X + 55), ($profBoxY + 155), 450, 100
$g.DrawString($bioText, $fontAuthR, $brushWhite, $rectBio)


# Project Links Card
$linksY = $colY + 410
Draw-GlassCard $g ($col3X + 30) $linksY 500 240 20 200

$fontLinkH = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$brushTypeBadge = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$g.DrawString("PROJECT LINKS & DEMO", $fontLinkH, $brushTypeBadge, ($col3X + 55), ($linksY + 20))

$fontLinkT = New-Object System.Drawing.Font ("Inter", [float]10.5, [System.Drawing.FontStyle]::Bold)
$fontLinkU = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)

# Link 1: Live Demo
$g.DrawString("🌐  Live Interactive Platform", $fontLinkT, $brushWhite, ($col3X + 55), ($linksY + 50))
$g.DrawString("https://mohammadgolamrabbii.github.io/Bangladesh-Rivers-Geo-Vault/", $fontLinkU, $brushCyan, ($col3X + 55), ($linksY + 70))

# Link 2: Behance Portfolio
$g.DrawString("🎨  Behance Portfolio", $fontLinkT, $brushWhite, ($col3X + 55), ($linksY + 110))
$g.DrawString("https://www.behance.net/golamrabbii", $fontLinkU, $brushCyan, ($col3X + 55), ($linksY + 130))

# Link 3: GitHub Repository
$g.DrawString("💻  Open-Source Repository", $fontLinkT, $brushWhite, ($col3X + 55), ($linksY + 170))
$g.DrawString("https://github.com/mohammadgolamrabbii/Bangladesh-Rivers-Geo-Vault", $fontLinkU, $brushCyan, ($col3X + 55), ($linksY + 190))


# Final Appreciation Box
$apprY = $colY + 675
Draw-GlassCard $g ($col3X + 30) $apprY 500 130 20 220 ([System.Drawing.Color]::FromArgb(140, 6, 182, 212))

$fontAppT = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Bold)
$g.DrawString("THANK YOU FOR VIEWING!  👏", $fontAppT, $brushWhite, ($col3X + 55), ($apprY + 25))

$fontAppS = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$g.DrawString("If you enjoyed this case study, don't forget to appreciate and follow.`nOpen for freelance inquiries and full-time product design roles.", $fontAppS, $brushMuted, ($col3X + 55), ($apprY + 55))

$outFile = "$outDir\07_engineering_and_credits_1920x1080.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Slide 7 generated: $outFile ($((Get-Item $outFile).Length) bytes)"
