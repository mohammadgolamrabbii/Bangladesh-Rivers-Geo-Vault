. "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\generate_primitives.ps1"

$canvas = Init-Canvas 1920 1080
$bmp = $canvas.bmp
$g = $canvas.g

Draw-Header $g "01 / DISCOVERY & PROBLEM ARCHITECTURE" "THE CHALLENGE & THE GEOSPATIAL SOLUTION" "Transforming fragmented bureaucratic records into a high-precision national digital twin"

# Left Card: The Challenge (Problem)
$cardW = 860
$cardH = 700
$leftX = 80
$cardY = 210

Draw-GlassCard $g $leftX $cardY $cardW $cardH 24 160 ([System.Drawing.Color]::FromArgb(80, 244, 63, 94))

# Pill Badge: THE CHALLENGE
$pillPathL = Create-RoundedPath ($leftX + 40) ($cardY + 35) 200 32 16
$pillBgL = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 244, 63, 94))
$pillBorderL = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 244, 63, 94), 1)
$g.FillPath($pillBgL, $pillPathL)
$g.DrawPath($pillBorderL, $pillPathL)

$fontPill = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$brushRose = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 251, 113, 133))
$g.DrawString("LEGACY DEFICITS", $fontPill, $brushRose, ($leftX + 75), ($cardY + 43))
$g.FillEllipse($brushRose, ($leftX + 55), ($cardY + 47), 8, 8)

$fontCardTitle = New-Object System.Drawing.Font ("Inter", [float]20, [System.Drawing.FontStyle]::Bold)
$brushWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
$g.DrawString("The Fragmented State of River Data", $fontCardTitle, $brushWhite, ($leftX + 40), ($cardY + 80))

# 4 Pain Points
$painPoints = @(
    @{
        num = "01";
        title = "Bureaucratic Data Silos & Missing Coordinates";
        desc = "Over 1,300 rivers were locked in static PDF gazettes and unstructured tables without geographic vector coordinates, making spatial analysis impossible."
    },
    @{
        num = "02";
        title = "Orthographic & Spelling Chaos in Search";
        desc = "Wild romanization variations ('Sitalakhya' vs 'Shitalakshya', 'Megna' vs 'Meghna') caused standard search engines to return 0 results for common queries."
    },
    @{
        num = "03";
        title = "Zero Real-World Satellite Verification";
        desc = "Public maps lacked satellite alignment, leading to floating polylines where rivers appeared to flow across dry agricultural farmland or buildings."
    },
    @{
        num = "04";
        title = "Clunky, Non-Responsive Desktop Interfaces";
        desc = "Existing hydrology platforms were unoptimized desktop tables completely unusable on mobile smartphones for field researchers and citizens."
    }
)

$fontNum = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Bold)
$fontPointT = New-Object System.Drawing.Font ("Inter", [float]12, [System.Drawing.FontStyle]::Bold)
$fontPointD = New-Object System.Drawing.Font ("Inter", [float]10.5, [System.Drawing.FontStyle]::Regular)
$brushMuted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))

for ($i = 0; $i -lt 4; $i++) {
    $py = $cardY + 140 + ($i * 135)
    $pp = $painPoints[$i]
    
    # Number badge
    $numRect = Create-RoundedPath ($leftX + 40) $py 36 36 10
    $numBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 244, 63, 94))
    $g.FillPath($numBg, $numRect)
    $g.DrawString($pp.num, $fontNum, $brushRose, ($leftX + 48), ($py + 8))
    
    # Text
    $g.DrawString($pp.title, $fontPointT, $brushWhite, ($leftX + 90), ($py + 4))
    $descR = New-Object System.Drawing.RectangleF ($leftX + 90), ($py + 30), 720, 80
    $g.DrawString($pp.desc, $fontPointD, $brushMuted, $descR)
}

# Right Card: The Solution (Innovation)
$rightX = 980
Draw-GlassCard $g $rightX $cardY $cardW $cardH 24 160 ([System.Drawing.Color]::FromArgb(80, 6, 182, 212))

# Pill Badge: THE SOLUTION
$pillPathR = Create-RoundedPath ($rightX + 40) ($cardY + 35) 230 32 16
$pillBgR = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 6, 182, 212))
$pillBorderR = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 6, 182, 212), 1)
$g.FillPath($pillBgR, $pillPathR)
$g.DrawPath($pillBorderR, $pillPathR)

$brushCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("GEO-VAULT ARCHITECTURE", $fontPill, $brushCyan, ($rightX + 75), ($cardY + 43))
$g.FillEllipse($brushCyan, ($rightX + 55), ($cardY + 47), 8, 8)

$g.DrawString("Spatial Intelligence & Modern Exploration", $fontCardTitle, $brushWhite, ($rightX + 40), ($cardY + 80))

# 4 Solutions
$solutions = @(
    @{
        num = "01";
        title = "Unified Topo-GeoJSON Spatial Vault";
        desc = "1,315 comprehensive river polylines indexed with precise origin coordinates, delta flow paths, and confluence points verified across 64 districts."
    },
    @{
        num = "02";
        title = "Phonetic & Levenshtein Transliteration Engine";
        desc = "Zero-friction search normalizer instantly mapping misspelled phonetic English and native Bengali script directly to exact river records in <10ms."
    },
    @{
        num = "03";
        title = "Dual-Layer Satellite Hybrid Cartography";
        desc = "Seamless 1-click toggling between high-contrast dark vector cartography and Google Satellite Hybrid tiles with sub-10m river channel alignment."
    },
    @{
        num = "04";
        title = "Dark Glassmorphic Responsive Intelligence HUD";
        desc = "Military-grade aesthetics featuring dynamic river dossier cards, BCS exam knowledge chips, 48px touch targets, and outdoor high-contrast tuning."
    }
)

for ($i = 0; $i -lt 4; $i++) {
    $py = $cardY + 140 + ($i * 135)
    $sol = $solutions[$i]
    
    # Number badge
    $numRect = Create-RoundedPath ($rightX + 40) $py 36 36 10
    $numBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 6, 182, 212))
    $g.FillPath($numBg, $numRect)
    $g.DrawString($sol.num, $fontNum, $brushCyan, ($rightX + 48), ($py + 8))
    
    # Text
    $g.DrawString($sol.title, $fontPointT, $brushWhite, ($rightX + 90), ($py + 4))
    $descR = New-Object System.Drawing.RectangleF ($rightX + 90), ($py + 30), 720, 80
    $g.DrawString($sol.desc, $fontPointD, $brushMuted, $descR)
}

# Bottom Bar: 4 User Persona Archetypes
$barY = 940
$personas = @(
    @{ title="Hydrologists & GIS Analysts"; desc="Detailed polyline GIS coordinates & origin-outfall mapping" },
    @{ title="BCS & Academic Examinees"; desc="Integrated civil service exam questions & river facts" },
    @{ title="Environmental Policy Researchers"; desc="Transboundary treaties, river decay & ecosystem tracking" },
    @{ title="Civic Explorers & Students"; desc="Bilingual search, GPS locate-me & instant river discovery" }
)

for ($i = 0; $i -lt 4; $i++) {
    $px = 80 + ($i * 445)
    Draw-GlassCard $g $px $barY 430 90 16 140
    
    $p = $personas[$i]
    $fontPerT = New-Object System.Drawing.Font ("Inter", [float]10, [System.Drawing.FontStyle]::Bold)
    $brushPerT = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $g.DrawString($p.title, $fontPerT, $brushPerT, ($px + 20), ($barY + 18))
    
    $fontPerD = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Regular)
    $g.DrawString($p.desc, $fontPerD, $brushMuted, ($px + 20), ($barY + 44))
}

$outFile = "$outDir\02_problem_and_solution_1920x1080.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Slide 2 generated: $outFile ($((Get-Item $outFile).Length) bytes)"
