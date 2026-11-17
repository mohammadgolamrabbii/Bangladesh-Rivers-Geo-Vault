. "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\generate_primitives.ps1"

$canvas = Init-Canvas 1920 1080
$bmp = $canvas.bmp
$g = $canvas.g

# Top Bar Badge
$pillPath = Create-RoundedPath 80 50 480 36 18
$pillBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 15, 23, 42))
$pillBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 6, 182, 212), 1)
$g.FillPath($pillBg, $pillPath)
$g.DrawPath($pillBorder, $pillPath)

$dotCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.FillEllipse($dotCyan, 98, 63, 10, 10)

$fontPill = New-Object System.Drawing.Font ("Inter", [float]10, [System.Drawing.FontStyle]::Bold)
$brushPill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 226, 232, 240))
$g.DrawString("CASE STUDY / WEB GIS & UI/UX ARCHITECTURE", $fontPill, $brushPill, 120, 59)

# Right year badge
$fontYear = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Bold)
$brushYear = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("BANGLADESH HYDROLOGY PLATFORM · 2026 EDITION", $fontYear, $brushYear, 1380, 59)

# Divider line
$penDiv = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40, 56, 189, 248), 1)
$g.DrawLine($penDiv, 80, 110, 1840, 110)

# Left Column (Headline + Summary + Meta + Metrics)
$fontSuper = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Bold)
$brushSuper = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$g.DrawString("NATIONAL CIVIC TECH & GEOSPATIAL INTELLIGENCE", $fontSuper, $brushSuper, 80, 150)

$fontTitle = New-Object System.Drawing.Font ("Inter", [float]44, [System.Drawing.FontStyle]::Bold)
$brushTitleW = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
$brushTitleC = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("BANGLADESH RIVERS", $fontTitle, $brushTitleW, 76, 185)
$g.DrawString("GEO-VAULT", $fontTitle, $brushTitleC, 76, 255)

$fontBangla = New-Object System.Drawing.Font ("Hind Siliguri", [float]20, [System.Drawing.FontStyle]::Regular)
$brushBangla = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 203, 213, 225))
$g.DrawString("বাংলাদেশের ১,৩১৫টি নদীর প্রথম পূর্ণাঙ্গ ডিজিটাল টুইন ও ইন্টারঅ্যাক্টিভ জিআইএস প্ল্যাটফর্ম", $fontBangla, $brushBangla, 80, 335)

$fontDesc = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Regular)
$brushDesc = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$descText = "A high-precision geospatial web application mapping all 1,315 documented rivers across all 64 districts of Bangladesh with sub-10m satellite precision.`n`nDesigned with a military-grade dark glassmorphic design system, dual-layer vector/satellite hydrology tracing, instant phonetic transliteration, and a responsive river intelligence dossier card."
$rectDesc = New-Object System.Drawing.RectangleF 80, 390, 880, 140
$g.DrawString($descText, $fontDesc, $brushDesc, $rectDesc)

# Project Info Grid Card (Role, Author, Tools, Live)
Draw-GlassCard $g 80 540 880 230 20 160
$fontMetaH = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$brushMetaH = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$fontMetaV = New-Object System.Drawing.Font ("Inter", [float]12, [System.Drawing.FontStyle]::Bold)
$brushMetaV = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 241, 245, 249))

# Item 1: Role
$g.DrawString("PROJECT ROLE", $fontMetaH, $brushMetaH, 110, 565)
$g.DrawString("Lead UI/UX Designer & GIS Developer", $fontMetaV, $brushMetaV, 110, 585)

# Item 2: Scope
$g.DrawString("AUTHOR / LOCATION", $fontMetaH, $brushMetaH, 540, 565)
$g.DrawString("Mohammad Golamrabbii · Gazipur, BD", $fontMetaV, $brushMetaV, 540, 585)

# Item 3: Core Tools
$g.DrawString("CORE TECHNOLOGIES", $fontMetaH, $brushMetaH, 110, 650)
$g.DrawString("Leaflet.js GIS · Vanilla ES6+ · GeoJSON · Figma · CSS3", $fontMetaV, $brushMetaV, 110, 670)

# Item 4: Live URL
$g.DrawString("LIVE PLATFORM DEMO", $fontMetaH, $brushMetaH, 540, 650)
$brushCyanLink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("mohammadgolamrabbii.github.io/Bangladesh-Rivers-Geo-Vault", $fontMetaV, $brushCyanLink, 540, 670)

# Row of 4 Big Metric Cards (y: 800)
$metrics = @(
    @{ val="1,315"; lbl="DOCUMENTED RIVERS"; sub="64 Districts Indexed"; color=[System.Drawing.Color]::FromArgb(255, 6, 182, 212) },
    @{ val="57"; lbl="TRANSBOUNDARY RIVERS"; sub="India & Myanmar Treaties"; color=[System.Drawing.Color]::FromArgb(255, 16, 185, 129) },
    @{ val="<10m"; lbl="SATELLITE ACCURACY"; sub="Sub-Metric Precision"; color=[System.Drawing.Color]::FromArgb(255, 251, 113, 133) },
    @{ val="100%"; lbl="LIGHTHOUSE PERFORMANCE"; sub="Zero Framework Overhead"; color=[System.Drawing.Color]::FromArgb(255, 168, 85, 247) }
)

for ($i = 0; $i -lt 4; $i++) {
    $mx = 80 + ($i * 225)
    Draw-GlassCard $g $mx 800 215 220 18 160
    
    $m = $metrics[$i]
    $fontMVal = New-Object System.Drawing.Font ("Inter", [float]28, [System.Drawing.FontStyle]::Bold)
    $brushMVal = New-Object System.Drawing.SolidBrush ($m.color)
    $g.DrawString($m.val, $fontMVal, $brushMVal, ($mx + 20), 825)
    
    $fontMLbl = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
    $brushMLbl = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 226, 232, 240))
    $g.DrawString($m.lbl, $fontMLbl, $brushMLbl, ($mx + 20), 895)

    $fontMSub = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Regular)
    $brushMSub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 100, 116, 139))
    $g.DrawString($m.sub, $fontMSub, $brushMSub, ($mx + 20), 935)
}

# Right Column: 3D Delta Showcase Frame
$rightX = 1000
$rightY = 150
$rightW = 840
$rightH = 870

# Outer glass container
Draw-GlassCard $g $rightX $rightY $rightW $rightH 28 140

# Delta 3D image
$deltaPath = "$rawDir\delta_3d.jpg"
if (Test-Path $deltaPath) {
    $deltaImg = [System.Drawing.Image]::FromFile($deltaPath)
    $imgRect = New-Object System.Drawing.Rectangle ($rightX + 20), ($rightY + 20), ($rightW - 40), 730
    $imgPath = Create-RoundedPath ($rightX + 20) ($rightY + 20) ($rightW - 40) 730 20
    $g.SetClip($imgPath)
    $g.DrawImage($deltaImg, $imgRect)
    $g.ResetClip()
    $imgPath.Dispose()
    $deltaImg.Dispose()
    
    # Border around image
    $imgBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 6, 182, 212), 2)
    $imgPath2 = Create-RoundedPath ($rightX + 20) ($rightY + 20) ($rightW - 40) 730 20
    $g.DrawPath($imgBorder, $imgPath2)
    $imgBorder.Dispose()
    $imgPath2.Dispose()
}

# Floating bottom badge inside 3D frame
$badgeX = $rightX + 50
$badgeY = $rightY + 775
$badgeW = $rightW - 100
Draw-GlassCard $g $badgeX $badgeY $badgeW 70 20 220 ([System.Drawing.Color]::FromArgb(120, 6, 182, 212))

$fontBdgT = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Bold)
$brushBdgT = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
$g.DrawString("DIGITAL TWIN HYDROLOGY ENGINE · 57 TRANSBOUNDARY PATHWAYS", $fontBdgT, $brushBdgT, ($badgeX + 30), ($badgeY + 16))

$fontBdgS = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)
$brushBdgS = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("Sub-10m Coordinate Splines Verified Against High-Resolution Satellite Sensor Imagery", $fontBdgS, $brushBdgS, ($badgeX + 30), ($badgeY + 38))

$outFile = "$outDir\01_hero_overview_1920x1080.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Slide 1 generated: $outFile ($((Get-Item $outFile).Length) bytes)"
