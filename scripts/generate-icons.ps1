# Generates the app icons from one frame of the wallet sprite (src/assets/wallet/wallet-loop.png, 24 frames of 64 px).
# Run once and commit the PNGs; the build doesn't run it. Redo it if the sprite changes:
#   powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1 [-Frame 12]
# Pixel art: every resize is nearest neighbor, so no pixel gets blurred.
param(
    [int]$Frame = 12
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$spritePath = Join-Path $root 'src/assets/wallet/wallet-loop.png'
$publicDir = Join-Path $root 'public'
$frameSize = 64
# The light theme's --surface (--white): iOS paints a transparent apple-touch-icon black, so that one is opaque.
$surface = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)

$sprite = [System.Drawing.Bitmap]::FromFile($spritePath)
try {
    $frameCount = [int]($sprite.Width / $frameSize)
    if ($Frame -lt 0 -or $Frame -ge $frameCount) { throw "Frame $Frame is out of range (0..$($frameCount - 1))." }
    $source = New-Object System.Drawing.Rectangle(($Frame * $frameSize), 0, $frameSize, $frameSize)

    function Save-Icon([int]$canvas, [int]$drawn, [bool]$opaque, [string]$name) {
        $bitmap = New-Object System.Drawing.Bitmap($canvas, $canvas, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
            if ($opaque) { $graphics.Clear($surface) } else { $graphics.Clear([System.Drawing.Color]::Transparent) }
            $offset = [int](($canvas - $drawn) / 2)
            $target = New-Object System.Drawing.Rectangle($offset, $offset, $drawn, $drawn)
            $graphics.DrawImage($sprite, $target, $source, [System.Drawing.GraphicsUnit]::Pixel)
            $path = Join-Path $publicDir $name
            $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
            Write-Output "$name ($canvas x $canvas)"
        } finally {
            $graphics.Dispose()
            $bitmap.Dispose()
        }
    }

    Save-Icon 64 64 $false 'favicon.png'
    Save-Icon 32 32 $false 'favicon-32.png'
    Save-Icon 180 128 $true 'apple-touch-icon.png'
} finally {
    $sprite.Dispose()
}
