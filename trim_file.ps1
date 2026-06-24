$filePath = "src\components\MasterAnalyzer.jsx"
$allLines = Get-Content -Path $filePath
$trimmedLines = $allLines | Select-Object -First 1171
$trimmedLines | Out-File -FilePath $filePath -Encoding UTF8
Write-Host "Done. Lines now: $(($trimmedLines | Measure-Object -Line).Lines)"
