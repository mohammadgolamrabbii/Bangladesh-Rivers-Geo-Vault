Add-Type -AssemblyName System.Drawing

$outDir = "C:\Users\Admin\Desktop\CatFoodTest\Bangladesh-Rivers-Geo-Vault\assets\behance"
$rawDir = "$outDir\raw"

function Create-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = [float]($r * 2)
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-GlassCard($g, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r, [int]$alpha=180, [System.Drawing.Color]$borderColor=[System.Drawing.Color]::Empty) {
    $path = Create-RoundedPath $x $y $w $h $r
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, 15, 23, 42))
    $g.FillPath($bgBrush, $path)
    $bgBrush.Dispose()
    
    if ($borderColor.IsEmpty) {
        $borderColor = [System.Drawing.Color]::FromArgb(60, 56, 189, 248)
    }
    $pen = New-Object System.Drawing.Pen ($borderColor, 1.5)
    $g.DrawPath($pen, $path)
    $pen.Dispose()
    $path.Dispose()
}

function Draw-Header($g, [string]$step, [string]$title, [string]$subtitle) {
    # Step badge
    $fontStep = New-Object System.Drawing.Font ("Inter", [float]11, [System.Drawing.FontStyle]::Bold)
    $brushStep = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 182, 212))
    $g.DrawString($step.ToUpper(), $fontStep, $brushStep, 80, 55)
    $fontStep.Dispose()
    $brushStep.Dispose()

    # Main title
    $fontTitle = New-Object System.Drawing.Font ("Inter", [float]30, [System.Drawing.FontStyle]::Bold)
    $brushTitle = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
    $g.DrawString($title, $fontTitle, $brushTitle, 78, 85)
    $fontTitle.Dispose()
    $brushTitle.Dispose()

    # Subtitle
    $fontSub = New-Object System.Drawing.Font ("Inter", [float]13, [System.Drawing.FontStyle]::Regular)
    $brushSub = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
    $g.DrawString($subtitle, $fontSub, $brushSub, 80, 140)
    $fontSub.Dispose()
    $brushSub.Dispose()

    # Divider line
    $penDiv = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40, 56, 189, 248), 1)
    $g.DrawLine($penDiv, 80, 180, 1840, 180)
    $penDiv.Dispose()
}

function Init-Canvas([int]$w=1920, [int]$h=1080) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Base dark background
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 6, 11, 20))
    $g.FillRectangle($bgBrush, 0, 0, $w, $h)
    $bgBrush.Dispose()

    # Subtle top glow gradient
    $glowRect = New-Object System.Drawing.Rectangle 0, 0, $w, 250
    $glowBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush ($glowRect, [System.Drawing.Color]::FromArgb(35, 6, 182, 212), [System.Drawing.Color]::FromArgb(0, 6, 11, 20), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($glowBrush, $glowRect)
    $glowBrush.Dispose()

    return @{ bmp = $bmp; g = $g }
}

Write-Output "Primitives ready."
