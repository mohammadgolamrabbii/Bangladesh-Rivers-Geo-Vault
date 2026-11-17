Add-Type -AssemblyName System.Drawing

$outDir = "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\assets\behance"
$rawDir = "$outDir\raw"

function Create-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

# --- SLIDE 0: BEHANCE GRID COVER (808 x 632) ---
$w = 808
$h = 632
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# 1. Base dark background
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 11, 20))
$g.FillRectangle($bgBrush, 0, 0, $w, $h)

# 2. Draw 3D Delta Map as background visual
$deltaPath = "$rawDir\delta_3d.jpg"
if (Test-Path $deltaPath) {
    $deltaImg = [System.Drawing.Image]::FromFile($deltaPath)
    # Draw scaled and positioned to fill upper and right area
    $srcRect = New-Object System.Drawing.Rectangle 0, 0, $deltaImg.Width, $deltaImg.Height
    $destRect = New-Object System.Drawing.Rectangle 180, 0, 640, 480
    $g.DrawImage($deltaImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $deltaImg.Dispose()
    
    # Dark gradient vignette over image from left and bottom to blend seamlessly
    $vigLeft = New-Object System.Drawing.Rectangle 0, 0, 450, $h
    $vigBrushL = New-Object System.Drawing.Drawing2D.LinearGradientBrush ($vigLeft, [System.Drawing.Color]::FromArgb(255, 6, 11, 20), [System.Drawing.Color]::FromArgb(0, 6, 11, 20), [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
    $g.FillRectangle($vigBrushL, $vigLeft)
    $vigBrushL.Dispose()

    $vigBottom = New-Object System.Drawing.Rectangle 0, 300, $w, 332
    $vigBrushB = New-Object System.Drawing.Drawing2D.LinearGradientBrush ($vigBottom, [System.Drawing.Color]::FromArgb(0, 6, 11, 20), [System.Drawing.Color]::FromArgb(255, 6, 11, 20), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($vigBrushB, $vigBottom)
    $vigBrushB.Dispose()
}

# 3. Top category pill and badge
# Category Pill
$pillPath = Create-RoundedPath 40 40 280 34 17
$pillBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 15, 23, 42))
$pillBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(100, 6, 182, 212), 1)
$g.FillPath($pillBg, $pillPath)
$g.DrawPath($pillBorder, $pillPath)

# Glowing cyan dot
$dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.FillEllipse($dotBrush, 55, 52, 10, 10)

$fontPill = New-Object System.Drawing.Font ("Inter", [float]9, [System.Drawing.FontStyle]::Bold)
$brushPill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 226, 232, 240))
$g.DrawString("UI/UX CASE STUDY · WEB GIS", $fontPill, $brushPill, 75, 49)

# Right badge: 1,315 RIVERS
$badgePath = Create-RoundedPath 580 40 188 34 17
$badgeBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 15, 23, 42))
$badgeBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(80, 16, 185, 129), 1)
$g.FillPath($badgeBg, $badgePath)
$g.DrawPath($badgeBorder, $badgePath)

$dotGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
$g.FillEllipse($dotGreen, 595, 52, 10, 10)
$brushGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 110, 231, 183))
$g.DrawString("1,315 RIVERS MAPPED", $fontPill, $brushGreen, 615, 49)

# 4. Main Titles
$fontSuper = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Bold)
$brushSuper = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$g.DrawString("BANGLADESH HYDROLOGY PLATFORM", $fontSuper, $brushSuper, 40, 240)

$fontTitle = New-Object System.Drawing.Font ("Inter", [float]34, [System.Drawing.FontStyle]::Bold)
$brushTitle = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.DrawString("Bangladesh Rivers", $fontTitle, $brushTitle, 38, 265)

$brushTitleCyan = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
$g.DrawString("Geo-Vault", $fontTitle, $brushTitleCyan, 38, 320)

$fontBangla = New-Object System.Drawing.Font ("Hind Siliguri", [float]15, [System.Drawing.FontStyle]::Regular)
$brushBangla = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("বাংলাদেশের ১,৩১৫টি নদীর ডার্ক-থিম জিআইএস ও ইউআই প্ল্যাটফর্ম", $fontBangla, $brushBangla, 40, 385)

$fontSub = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Regular)
$brushSub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("Sub-10m Satellite GIS · Dark Glassmorphic Design System · Instant Transliteration", $fontSub, $brushSub, 40, 420)

# 5. Bottom Info Bar
$barPath = Create-RoundedPath 40 480 728 100 20
$barBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 15, 23, 42))
$barBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 56, 189, 248), 1)
$g.FillPath($barBg, $barPath)
$g.DrawPath($barBorder, $barPath)

# Profile Avatar / Icon
$profPath = "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\assets\img\profile.jpg"
if (Test-Path $profPath) {
    $profImg = [System.Drawing.Image]::FromFile($profPath)
    $avRect = New-Object System.Drawing.Rectangle 65, 498, 64, 64
    $avPath = Create-RoundedPath 65 498 64 64 32
    $g.SetClip($avPath)
    $g.DrawImage($profImg, $avRect)
    $g.ResetClip()
    $avPath.Dispose()
    $profImg.Dispose()
    
    # Border around avatar
    $avBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 6, 182, 212), 2)
    $g.DrawEllipse($avBorder, 65, 498, 64, 64)
    $avBorder.Dispose()
}

$fontAuthor = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Bold)
$brushAuthor = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
$g.DrawString("Mohammad Golamrabbii", $fontAuthor, $brushAuthor, 145, 506)

$fontRole = New-Object System.Drawing.Font ("Inter", [float]10, [System.Drawing.FontStyle]::Regular)
$brushRole = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$g.DrawString("Lead UI/UX & Geospatial GIS Developer · Gazipur, BD", $fontRole, $brushRole, 145, 532)

# Right metrics in bar
$fontStatVal = New-Object System.Drawing.Font ("Inter", [float]14, [System.Drawing.FontStyle]::Bold)
$fontStatLbl = New-Object System.Drawing.Font ("Inter", [float]8, [System.Drawing.FontStyle]::Bold)

# Metric 1
$g.DrawString("1,315", $fontStatVal, $brushTitleCyan, 550, 506)
$g.DrawString("RIVERS", $fontStatLbl, $brushRole, 550, 532)

# Metric 2
$g.DrawString("57", $fontStatVal, $brushGreen, 630, 506)
$g.DrawString("TRANSBOUNDARY", $fontStatLbl, $brushRole, 630, 532)

# Metric 3
$brushCoral = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 251, 113, 133))
$g.DrawString("<10m", $fontStatVal, $brushCoral, 695, 506)
$g.DrawString("ACCURACY", $fontStatLbl, $brushRole, 695, 532)

$outFile = "$outDir\00_cover_808x632.png"
$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Output "Cover generated: $outFile ($((Get-Item $outFile).Length) bytes)"
