. "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\generate_primitives.ps1"

$canvas = Init-Canvas 1920 1080
$bmp = $canvas.bmp
$g = $canvas.g

Draw-Header $g "04 / INTERACTION DESIGN" "INSTANT RIVER DOSSIER & PHONETIC SEARCH HUD" "Zero-friction discovery powered by intelligent phonetic transliteration and contextual intelligence cards"

# Two Large Showcase Pillars (Left: Dossier Card, Right: Search Engine Architecture)
$cardY = 210
$cardH = 810
$colW = 860

# --- LEFT PILLAR: THE FLOATING RIVER DOSSIER CARD ---
$leftX = 80
Draw-GlassCard $g $leftX $cardY $colW $cardH 24 160

$fontColT = New-Object System.Drawing.Font ("Inter", [float]14, [System.Drawing.FontStyle]::Bold)
$brushCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("CONTEXTUAL RIVER DOSSIER HUD", $fontColT, $brushCyan, ($leftX + 35), ($cardY + 30))

$fontColS = New-Object System.Drawing.Font ("Inter", [float]9.5, [System.Drawing.FontStyle]::Regular)
$brushMuted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("Comprehensive intelligence card sliding into view upon river click or search selection", $fontColS, $brushMuted, ($leftX + 35), ($cardY + 60))

# Mockup Frame for River Dossier Card (embed satellite_card.png or construct high-res card)
$cardFrameX = $leftX + 30
$cardFrameY = $cardY + 100
$cardFrameW = 800
$cardFrameH = 670

$satCardPath = "$rawDir\satellite_card.png"
if (Test-Path $satCardPath) {
    $scImg = [System.Drawing.Image]::FromFile($satCardPath)
    $scFramePath = Create-RoundedPath $cardFrameX $cardFrameY $cardFrameW 420 18
    $g.SetClip($scFramePath)
    # Crop to the right/top portion where the dossier card is located
    $srcRect = New-Object System.Drawing.Rectangle ($scImg.Width - 480), 0, 480, 400
    $destRect = New-Object System.Drawing.Rectangle $cardFrameX, $cardFrameY, $cardFrameW, 420
    $g.DrawImage($scImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.ResetClip()
    $scFramePath.Dispose()
    $scImg.Dispose()
    
    # Border
    $scBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 6, 182, 212), 1.5)
    $scPath2 = Create-RoundedPath $cardFrameX $cardFrameY $cardFrameW 420 18
    $g.DrawPath($scBorder, $scPath2)
    $scBorder.Dispose()
    $scPath2.Dispose()
}

# 3 Callout Feature Cards below the preview image
$dossierFeatures = @(
    @{
        title = "01 · Bilingual Header & Geopolitics";
        desc = "Authentic Bengali name in Hind Siliguri script + international English romanization, paired with transboundary border indicators (India/Myanmar treaties)."
    },
    @{
        title = "02 · Official Hydrology Metrics";
        desc = "Precise river length in kilometers, origin source spring district, downstream confluence river, and navigable classification status."
    },
    @{
        title = "03 · Curated BCS Exam Insights & 1-Click Fly-To";
        desc = "Integrated civil service exam questions with instant interactive fly-to camera focus, GPS coordinate copying, and deep link sharing."
    }
)

$fontFeatT = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Bold)
$fontFeatD = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)
$brushWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))

for ($i = 0; $i -lt 3; $i++) {
    $fy = $cardFrameY + 440 + ($i * 75)
    $df = $dossierFeatures[$i]
    
    Draw-GlassCard $g $cardFrameX $fy $cardFrameW 68 14 180
    $g.DrawString($df.title, $fontFeatT, $brushCyan, ($cardFrameX + 25), ($fy + 12))
    $rectDF = New-Object System.Drawing.RectangleF ($cardFrameX + 25), ($fy + 34), ($cardFrameW - 50), 30
    $g.DrawString($df.desc, $fontFeatD, $brushMuted, $rectDF)
}


# --- RIGHT PILLAR: PHONETIC TRANSLITERATION ENGINE ---
$rightX = 980
Draw-GlassCard $g $rightX $cardY $colW $cardH 24 160

$g.DrawString("PHONETIC & LEVENSHTEIN SEARCH ENGINE", $fontColT, $brushCyan, ($rightX + 35), ($cardY + 30))
$g.DrawString("Eliminating search failures caused by divergent Bengali romanizations", $fontColS, $brushMuted, ($rightX + 35), ($cardY + 60))

# Sub-Card 1: Flowchart Diagram
$flowY = $cardY + 105
Draw-GlassCard $g ($rightX + 30) $flowY 800 380 20 180

$fontDiagT = New-Object System.Drawing.Font ("Inter", [float]10, [System.Drawing.FontStyle]::Bold)
$brushTypeBadge = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$g.DrawString("QUERY PROCESSING PIPELINE", $fontDiagT, $brushTypeBadge, ($rightX + 55), ($flowY + 20))

# Pipeline Step 1: User Input
$step1Y = $flowY + 55
Draw-GlassCard $g ($rightX + 55) $step1Y 330 90 14 200 ([System.Drawing.Color]::FromArgb(120, 244, 63, 94))
$fontStepLbl = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Bold)
$brushRose = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 251, 113, 133))
$g.DrawString("STEP 1: USER INPUT (COMMON MISSPELLINGS)", $fontStepLbl, $brushRose, ($rightX + 75), ($step1Y + 14))

$fontCode = New-Object System.Drawing.Font ("Consolas", [float]11, [System.Drawing.FontStyle]::Bold)
$g.DrawString('"sitalakhya", "megna", "burigonga"', $fontCode, $brushWhite, ($rightX + 75), ($step1Y + 38))
$g.DrawString('or Bengali: "শীতলক্ষ্যা", "মেঘনা"', $fontCode, $brushMuted, ($rightX + 75), ($step1Y + 60))

# Pipeline Step 2: Phonetic Normalizer
$step2Y = $flowY + 165
Draw-GlassCard $g ($rightX + 55) $step2Y 330 90 14 200 ([System.Drawing.Color]::FromArgb(120, 245, 158, 11))
$brushAmber = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
$g.DrawString("STEP 2: PHONETIC NORMALIZER", $fontStepLbl, $brushAmber, ($rightX + 75), ($step2Y + 14))
$g.DrawString('cleanTransliteration()', $fontCode, $brushAmber, ($rightX + 75), ($step2Y + 38))
$fontSubD = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Maps 'ee'->'i', 'oo'->'u', 'sh'->'s', 'v'->'b'", $fontSubD, $brushMuted, ($rightX + 75), ($step2Y + 62))

# Pipeline Step 3: Levenshtein Distance Matcher
$step3Y = $flowY + 275
Draw-GlassCard $g ($rightX + 55) $step3Y 330 85 14 200 ([System.Drawing.Color]::FromArgb(120, 16, 185, 129))
$brushGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
$g.DrawString("STEP 3: LEVENSHTEIN DISTANCE", $fontStepLbl, $brushGreen, ($rightX + 75), ($step3Y + 14))
$g.DrawString('levenshteinDistance(query, target)', $fontCode, $brushGreen, ($rightX + 75), ($step3Y + 36))
$g.DrawString("Tolerates up to 2 typos / spelling drifts", $fontSubD, $brushMuted, ($rightX + 75), ($step3Y + 58))

# Big Arrow to Result Box
$resBoxX = $rightX + 415
$resBoxY = $flowY + 55
$resBoxW = 390
$resBoxH = 305
Draw-GlassCard $g $resBoxX $resBoxY $resBoxW $resBoxH 16 220 ([System.Drawing.Color]::FromArgb(140, 6, 182, 212))

$g.DrawString("RESULT: 100% INSTANT MATCH", $fontStepLbl, $brushCyan, ($resBoxX + 25), ($resBoxY + 18))

# Mock search result item 1
$r1Path = Create-RoundedPath ($resBoxX + 25) ($resBoxY + 48) ($resBoxW - 50) 70 12
$r1Bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 10, 16, 29))
$g.FillPath($r1Bg, $r1Path)
$fontRName = New-Object System.Drawing.Font ("Hind Siliguri", [float]13, [System.Drawing.FontStyle]::Bold)
$g.DrawString("শীতলক্ষ্যা (Shitalakshya River)", $fontRName, $brushCyan, ($resBoxX + 40), ($resBoxY + 56))
$fontRSub = New-Object System.Drawing.Font ("Inter", [float]8.5, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Length: 110 km · Gazipur, Narayanganj", $fontRSub, $brushMuted, ($resBoxX + 40), ($resBoxY + 84))

# Mock search result item 2
$r2Path = Create-RoundedPath ($resBoxX + 25) ($resBoxY + 130) ($resBoxW - 50) 70 12
$g.FillPath($r1Bg, $r2Path)
$g.DrawString("মেঘনা (Meghna River)", $fontRName, $brushWhite, ($resBoxX + 40), ($resBoxY + 138))
$g.DrawString("Length: 156 km · Kishoreganj, Chandpur", $fontRSub, $brushMuted, ($resBoxX + 40), ($resBoxY + 166))

# Mock search result item 3
$r3Path = Create-RoundedPath ($resBoxX + 25) ($resBoxY + 212) ($resBoxW - 50) 70 12
$g.FillPath($r1Bg, $r3Path)
$g.DrawString("বুড়িগঙ্গা (Buriganga River)", $fontRName, $brushWhite, ($resBoxX + 40), ($resBoxY + 220))
$g.DrawString("Length: 45 km · Dhaka, Keraniganj", $fontRSub, $brushMuted, ($resBoxX + 40), ($resBoxY + 248))


# Sub-Card 2: Transliteration Benchmarks
$benchY = $cardY + 510
Draw-GlassCard $g ($rightX + 30) $benchY 800 260 20 180

$g.DrawString("TRANSLITERATION TEST BENCHMARK RESULTS", $fontDiagT, $brushTypeBadge, ($rightX + 55), ($benchY + 20))

$benchmarks = @(
    @{ input="sitalakhya"; match="শীতলক্ষ্যা (Shitalakshya)"; latency="4.2 ms"; status="PERFECT MATCH" },
    @{ input="megna"; match="মেঘনা (Meghna)"; latency="3.8 ms"; status="PERFECT MATCH" },
    @{ input="burigonga"; match="বুড়িগঙ্গা (Buriganga)"; latency="4.5 ms"; status="PERFECT MATCH" },
    @{ input="jumuna"; match="যমুনা (Jamuna)"; latency="3.1 ms"; status="PERFECT MATCH" }
)

$fontBenchH = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$fontBenchV = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Regular)
$brushDarkCol = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 100, 116, 139))

$g.DrawString("USER QUERY", $fontBenchH, $brushDarkCol, ($rightX + 55), ($benchY + 50))
$g.DrawString("RESOLVED RIVER", $fontBenchH, $brushDarkCol, ($rightX + 220), ($benchY + 50))
$g.DrawString("LATENCY", $fontBenchH, $brushDarkCol, ($rightX + 530), ($benchY + 50))
$g.DrawString("ACCURACY", $fontBenchH, $brushDarkCol, ($rightX + 650), ($benchY + 50))

for ($i = 0; $i -lt 4; $i++) {
    $by = $benchY + 80 + ($i * 42)
    $b = $benchmarks[$i]
    
    $g.DrawString($b.input, $fontCode, $brushRose, ($rightX + 55), $by)
    $g.DrawString($b.match, $fontBenchV, $brushWhite, ($rightX + 220), ($by + 2))
    $g.DrawString($b.latency, $fontCode, $brushCyan, ($rightX + 530), $by)
    $g.DrawString($b.status, $fontBenchH, $brushGreen, ($rightX + 650), ($by + 2))
}

$outFile = "$outDir\05_interaction_dossier_1920x1080.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Slide 5 generated: $outFile ($((Get-Item $outFile).Length) bytes)"
