Write-Host "Activating virtual environment..." -ForegroundColor Green
if (Test-Path "venv\Scripts\Activate.ps1") {
    . venv\Scripts\Activate.ps1
}
Write-Host "Running WhisperX lyric generator..." -ForegroundColor Green
python generate_lyrics.py --device cpu --model tiny --compute_type int8
Write-Host "Lyric generation complete!" -ForegroundColor Green
