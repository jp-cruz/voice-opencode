Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 100
$inputPath = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($inputPath, [System.Text.Encoding]::UTF8.GetBytes('Hello test'))
$text = Get-Content -Path $inputPath -Encoding Byte -AsBase64String | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
$synth.Speak($text)
Remove-Item $inputPath -ErrorAction SilentlyContinue
