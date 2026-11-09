# Generates the PNG app icons from public/favicon.svg, rendered by headless Microsoft Edge (or Chrome), so the PNGs
# match the SVG exactly. Run once and commit the PNGs; the build doesn't run it. Redo it if the SVG changes:
#   powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $root 'public'
$svg = Get-Content -Raw -Encoding UTF8 (Join-Path $publicDir 'favicon.svg')

$browser = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'Microsoft Edge or Google Chrome is needed to render the SVG.' }

$work = Join-Path ([System.IO.Path]::GetTempPath()) ("lm-icons-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $work | Out-Null

# Draws the SVG at $drawn px, centered on a $canvas px page: transparent, or on the light theme's --surface (white),
# since iOS paints a transparent apple-touch-icon black.
function Save-Icon([int]$canvas, [int]$drawn, [bool]$opaque, [string]$name) {
    $background = if ($opaque) { '#ffffff' } else { 'transparent' }
    $page = Join-Path $work "$name.html"
    $html = "<!doctype html><html><head><style>html,body{margin:0;width:${canvas}px;height:${canvas}px;overflow:hidden;" +
        "background:$background;display:grid;place-items:center}svg{width:${drawn}px;height:${drawn}px;display:block}" +
        "</style></head><body>$svg</body></html>"
    Set-Content -Path $page -Value $html -Encoding UTF8
    $output = Join-Path $publicDir $name
    $arguments = @(
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        '--default-background-color=00000000', "--user-data-dir=$work\profile",
        "--window-size=$canvas,$canvas", "--screenshot=$output", ([System.Uri]$page).AbsoluteUri
    )
    $process = Start-Process -FilePath $browser -ArgumentList $arguments -Wait -PassThru -WindowStyle Hidden
    if ($process.ExitCode -ne 0 -or -not (Test-Path $output)) { throw "Rendering $name failed." }
    Write-Output "$name ($canvas x $canvas)"
}

try {
    Save-Icon 64 64 $false 'favicon.png'
    Save-Icon 32 32 $false 'favicon-32.png'
    # 144 of 180: the wheel's margin on the home screen, like the other app icons.
    Save-Icon 180 144 $true 'apple-touch-icon.png'
} finally {
    Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
}
