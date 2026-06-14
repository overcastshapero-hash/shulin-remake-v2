$ErrorActionPreference = "Continue"
$proj = "E:\Workspaces\showcase-assets\sites\photo-orbit"
$sets = @(
  @{ src = "E:\Workspaces\社群资料库\photos\female\女"; prefix = "f" },
  @{ src = "E:\Workspaces\社群资料库\photos\male\男";   prefix = "m" }
)

foreach ($set in $sets) {
  $files = Get-ChildItem $set.src -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp)$' } |
    Sort-Object { [int]($_.BaseName -replace '\D','0') }, Name
  $i = 0
  foreach ($file in $files) {
    $i++
    $id = "{0}-{1:d3}" -f $set.prefix, $i
    $thumb = Join-Path $proj "assets\thumbs\$id.jpg"
    $large = Join-Path $proj "assets\large\$id.jpg"
    if (-not (Test-Path $thumb)) {
      ffmpeg -v error -i $file.FullName -vf "scale=w=420:h=420:force_original_aspect_ratio=decrease:flags=lanczos" -q:v 3 -y $thumb
    }
    if (-not (Test-Path $large)) {
      ffmpeg -v error -i $file.FullName -vf "scale=w=1400:h=1400:force_original_aspect_ratio=decrease:flags=lanczos" -q:v 3 -y $large
    }
  }
  Write-Output "$($set.prefix): $i done"
}

# Build manifest with thumb dimensions
Add-Type -AssemblyName System.Drawing
$items = @()
foreach ($file in (Get-ChildItem (Join-Path $proj "assets\thumbs") -Filter *.jpg | Sort-Object Name)) {
  $img = [System.Drawing.Image]::FromFile($file.FullName)
  $items += [pscustomobject]@{
    id = $file.BaseName
    g  = $file.BaseName.Substring(0,1)
    w  = $img.Width
    h  = $img.Height
  }
  $img.Dispose()
}
$json = ConvertTo-Json @{ items = $items } -Depth 4 -Compress
[System.IO.File]::WriteAllText((Join-Path $proj "data\manifest.json"), $json, (New-Object System.Text.UTF8Encoding $false))
Write-Output "manifest: $($items.Count) items"
