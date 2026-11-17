. "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\generate_primitives.ps1"

$canvas = Init-Canvas 1920 1080
$bmp = $canvas.bmp
$g = $canvas.g

Draw-Header $g "02 / VISUAL FOUNDATIONS" "DARK GLASSMORPHIC DESIGN SYSTEM & TOKENS" "High-contrast visual tokens engineered for geospatial clarity, cognitive ergonomics, and national pride"

# 3 Main Columns
$colY = 210
$colH = 820
$colW = 560

# --- COLUMN 1: SPATIAL COLOR PALETTE ---
$col1X = 80
Draw-GlassCard $g $col1X $colY $colW $colH 24 160

$fontSecT = New-Object System.Drawing.Font ("Inter", [float]14, [System.Drawing.FontStyle]::Bold)
$brushCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("SPATIAL COLOR TOKENS", $fontSecT, $brushCyan, ($col1X + 35), ($colY + 30))

$fontSecS = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$brushMuted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("Calibrated for dark-mode cartography and high visual contrast", $fontSecS, $brushMuted, ($col1X + 35), ($colY + 60))

$colors = @(
    @{ name="Obsidian Abyss"; hex="#060B14"; role="Canvas Background & Base Layer"; c=[System.Drawing.Color]::FromArgb(255, 6, 11, 20); border=[System.Drawing.Color]::FromArgb(80, 56, 189, 248) },
    @{ name="Electric Cyan Glow"; hex="#06B6D4"; role="River Flow Vectors & Halo Animation"; c=[System.Drawing.Color]::FromArgb(255, 6, 182, 212); border=[System.Drawing.Color]::FromArgb(255, 34, 211, 238) },
    @{ name="Slate Glass HUD"; hex="#0F172A"; role="Glassmorphic Cards (75% blur, 1px border)"; c=[System.Drawing.Color]::FromArgb(255, 15, 23, 42); border=[System.Drawing.Color]::FromArgb(100, 56, 189, 248) },
    @{ name="Emerald Origin"; hex="#10B981"; role="River Source Spring / Upstream Node"; c=[System.Drawing.Color]::FromArgb(255, 16, 185, 129); border=[System.Drawing.Color]::FromArgb(255, 52, 211, 153) },
    @{ name="Crimson Outfall"; hex="#EF4444"; role="Estuarine Mouth / Confluence Node"; c=[System.Drawing.Color]::FromArgb(255, 239, 68, 68); border=[System.Drawing.Color]::FromArgb(255, 248, 113, 113) },
    @{ name="Cobalt Selection"; hex="#0284C7"; role="Interactive Active Focus & Highlight"; c=[System.Drawing.Color]::FromArgb(255, 2, 132, 199); border=[System.Drawing.Color]::FromArgb(255, 56, 189, 248) }
)

$fontColName = New-Object System.Drawing.Font ("Inter", [float]11.5, [System.Drawing.FontStyle]::Bold)
$fontColHex = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Bold)
$fontColRole = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)
$brushWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))

for ($i = 0; $i -lt 6; $i++) {
    $cy = $colY + 105 + ($i * 110)
    $col = $colors[$i]
    
    # Swatch box
    $swPath = Create-RoundedPath ($col1X + 35) $cy 65 65 14
    $swBrush = New-Object System.Drawing.SolidBrush ($col.c)
    $swPen = New-Object System.Drawing.Pen ($col.border, 1.5)
    $g.FillPath($swBrush, $swPath)
    $g.DrawPath($swPen, $swPath)
    $swPath.Dispose()
    $swBrush.Dispose()
    $swPen.Dispose()
    
    # Labels
    $g.DrawString($col.name, $fontColName, $brushWhite, ($col1X + 115), ($cy + 6))
    $brushHex = New-Object System.Drawing.SolidBrush ($col.c)
    $g.DrawString($col.hex, $fontColHex, $brushHex, ($col1X + 115), ($cy + 27))
    $brushHex.Dispose()
    $g.DrawString($col.role, $fontColRole, $brushMuted, ($col1X + 115), ($cy + 46))
}


# --- COLUMN 2: DUAL TYPOGRAPHY SYSTEM ---
$col2X = 680
Draw-GlassCard $g $col2X $colY $colW $colH 24 160

$g.DrawString("DUAL TYPOGRAPHY SYSTEM", $fontSecT, $brushCyan, ($col2X + 35), ($colY + 30))
$g.DrawString("Latin geometric precision paired with authentic Bengali typography", $fontSecS, $brushMuted, ($col2X + 35), ($colY + 60))

# Sub-Card 1: Inter
$sub1Y = $colY + 105
Draw-GlassCard $g ($col2X + 30) $sub1Y 500 310 18 180

$fontTypeBadge = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$brushTypeBadge = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$g.DrawString("PRIMARY UI & GEOSPATIAL DATA", $fontTypeBadge, $brushTypeBadge, ($col2X + 50), ($sub1Y + 20))

$fontFamily1 = New-Object System.Drawing.Font ("Inter", [float]22, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Inter / Geometric Sans", $fontFamily1, $brushWhite, ($col2X + 50), ($sub1Y + 45))

$fontSample1 = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Regular)
$sampleText1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ`nabcdefghijklmnopqrstuvwxyz`n0123456789 (!@#$%^&*)"
$g.DrawString($sampleText1, $fontSample1, $brushCyan, ($col2X + 50), ($sub1Y + 95))

$fontMetaD = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)
$typeNotes1 = "Selected for ultra-high legibility in dense GIS HUD tables, numerical river lengths (km), latitude/longitude coordinates, and search dropdowns."
$rectTN1 = New-Object System.Drawing.RectangleF ($col2X + 50), ($sub1Y + 195), 450, 90
$g.DrawString($typeNotes1, $fontMetaD, $brushMuted, $rectTN1)

# Sub-Card 2: Hind Siliguri
$sub2Y = $colY + 440
Draw-GlassCard $g ($col2X + 30) $sub2Y 500 340 18 180

$g.DrawString("AUTHENTIC BENGALI HYDROLOGY", $fontTypeBadge, $brushTypeBadge, ($col2X + 50), ($sub2Y + 20))

$fontFamily2 = New-Object System.Drawing.Font ("Hind Siliguri", [float]24, [System.Drawing.FontStyle]::Bold)
$g.DrawString("হিন্দ শিলিগুড়ি (Hind Siliguri)", $fontFamily2, $brushWhite, ($col2X + 50), ($sub2Y + 45))

$fontSample2 = New-Object System.Drawing.Font ("Hind Siliguri", [float]15, [System.Drawing.FontStyle]::Regular)
$sampleText2 = "পদ্মা · মেঘনা · যমুনা · তিস্তা · কর্ণফুলী`nব্রহ্মপুত্র · শীতলক্ষ্যা · বালু · কুশিয়ারা · সুরমা"
$brushGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 110, 231, 183))
$g.DrawString($sampleText2, $fontSample2, $brushGreen, ($col2X + 50), ($sub2Y + 105))

$typeNotes2 = "Crafted specifically for authentic Bangladeshi river nomenclature, national geographical gazette consistency, and high-contrast readability on OLED screens."
$rectTN2 = New-Object System.Drawing.RectangleF ($col2X + 50), ($sub2Y + 215), 450, 100
$g.DrawString($typeNotes2, $fontMetaD, $brushMuted, $rectTN2)


# --- COLUMN 3: COMPONENT ANATOMY ---
$col3X = 1280
Draw-GlassCard $g $col3X $colY $colW $colH 24 160

$g.DrawString("COMPONENT ANATOMY & HUD", $fontSecT, $brushCyan, ($col3X + 35), ($colY + 30))
$g.DrawString("Modular glassmorphic widgets powering instant river exploration", $fontSecS, $brushMuted, ($col3X + 35), ($colY + 60))

# Component 1: Search HUD Bar
$comp1Y = $colY + 105
Draw-GlassCard $g ($col3X + 30) $comp1Y 500 130 18 200

$fontCompT = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$g.DrawString("01 / FLOATING SEARCH HUD", $fontCompT, $brushTypeBadge, ($col3X + 50), ($comp1Y + 15))

# Mock search pill
$mockSearchPath = Create-RoundedPath ($col3X + 50) ($comp1Y + 45) 460 48 24
$mockSearchBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 7, 13, 24))
$mockSearchPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 6, 182, 212), 1.5)
$g.FillPath($mockSearchBg, $mockSearchPath)
$g.DrawPath($mockSearchPen, $mockSearchPath)

# Search text inside
$fontMockS = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Regular)
$g.DrawString("🔍  Search 1,315 rivers (e.g. Padma, মেঘনা, Balu)...", $fontMockS, $brushMuted, ($col3X + 70), ($comp1Y + 60))

$fontCompD = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Dual English & Bengali autocomplete with phonetic normalizer.", $fontCompD, $brushCyan, ($col3X + 50), ($comp1Y + 102))

# Component 2: River Status & Geopolitical Badges
$comp2Y = $colY + 260
Draw-GlassCard $g ($col3X + 30) $comp2Y 500 240 18 200

$g.DrawString("02 / GEOPOLITICAL & HYDROLOGY BADGES", $fontCompT, $brushTypeBadge, ($col3X + 50), ($comp2Y + 15))

# Badge 1: 57 Transboundary
$b1Path = Create-RoundedPath ($col3X + 50) ($comp2Y + 45) 230 36 18
$b1Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 16, 185, 129))
$b1Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 16, 185, 129), 1)
$g.FillPath($b1Bg, $b1Path)
$g.DrawPath($b1Pen, $b1Path)
$g.FillEllipse($brushGreen, ($col3X + 65), ($comp2Y + 58), 10, 10)
$fontBdgTxt = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$g.DrawString("57 TRANSBOUNDARY", $fontBdgTxt, $brushGreen, ($col3X + 85), ($comp2Y + 56))

# Badge 2: Navigable
$b2Path = Create-RoundedPath ($col3X + 295) ($comp2Y + 45) 190 36 18
$b2Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 6, 182, 212))
$b2Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 6, 182, 212), 1)
$g.FillPath($b2Bg, $b2Path)
$g.DrawPath($b2Pen, $b2Path)
$g.FillEllipse($brushCyan, ($col3X + 310), ($comp2Y + 58), 10, 10)
$g.DrawString("NAVIGABLE (নাব্য)", $fontBdgTxt, $brushCyan, ($col3X + 330), ($comp2Y + 56))

# Badge 3: Length chip
$b3Path = Create-RoundedPath ($col3X + 50) ($comp2Y + 95) 180 36 18
$b3Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 168, 85, 247))
$b3Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 168, 85, 247), 1)
$g.FillPath($b3Bg, $b3Path)
$g.DrawPath($b3Pen, $b3Path)
$brushPurple = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 216, 180, 254))
$g.DrawString("LENGTH: 324 KM", $fontBdgTxt, $brushPurple, ($col3X + 75), ($comp2Y + 106))

# Badge 4: BCS Question
$b4Path = Create-RoundedPath ($col3X + 245) ($comp2Y + 95) 240 36 18
$b4Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 245, 158, 11))
$b4Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 245, 158, 11), 1)
$g.FillPath($b4Bg, $b4Path)
$g.DrawPath($b4Pen, $b4Path)
$brushAmber = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 252, 211, 77))
$g.DrawString("BCS EXAM RELEVANT", $fontBdgTxt, $brushAmber, ($col3X + 270), ($comp2Y + 106))

$badgeNotes = "Micro-status pills give instant cognitive clarity on international border status, environmental viability, and civil service exam relevance."
$rectBN = New-Object System.Drawing.RectangleF ($col3X + 50), ($comp2Y + 155), 450, 70
$g.DrawString($badgeNotes, $fontMetaD, $brushMuted, $rectBN)

# Component 3: Layer Switcher & Zoom HUD
$comp3Y = $colY + 520
Draw-GlassCard $g ($col3X + 30) $comp3Y 500 260 18 200

$g.DrawString("03 / CARTOGRAPHIC CONTROL HUD", $fontCompT, $brushTypeBadge, ($col3X + 50), ($comp3Y + 15))

# Toggle buttons
$tb1Path = Create-RoundedPath ($col3X + 50) ($comp3Y + 45) 210 40 10
$tb1Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.FillPath($tb1Bg, $tb1Path)
$brushDark = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 11, 20))
$fontBtn = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Bold)
$g.DrawString("🛰  Google Satellite", $fontBtn, $brushDark, ($col3X + 75), ($comp3Y + 57))

$tb2Path = Create-RoundedPath ($col3X + 275) ($comp3Y + 45) 210 40 10
$tb2Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(60, 15, 23, 42))
$tb2Pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 56, 189, 248), 1)
$g.FillPath($tb2Bg, $tb2Path)
$g.DrawPath($tb2Pen, $tb2Path)
$g.DrawString("🗺  Dark Vector Map", $fontBtn, $brushWhite, ($col3X + 305), ($comp3Y + 57))

$layerNotes = "Dual spatial engine allowing seamless transitions between dark minimalist vector lines and real-world high-resolution Google Satellite Hybrid tiles with zero HUD overlap."
$rectLN = New-Object System.Drawing.RectangleF ($col3X + 50), ($comp3Y + 115), 450, 120
$g.DrawString($layerNotes, $fontMetaD, $brushMuted, $rectLN)

$outFile = "$outDir\03_design_system_1920x1080.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Slide 3 generated: $outFile ($((Get-Item $outFile).Length) bytes)"
