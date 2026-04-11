param(
  [int]$Port = 8081,
  [switch]$Clear
)

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $projectRoot

$env:JAVA_HOME = 'D:\Android Studio\jbr'
$env:ANDROID_HOME = 'D:\SDK'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"

Write-Host "Project: $projectRoot"
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "Port Metro=$Port"

# Kill any process currently listening on target Metro port to avoid stale sessions.
try {
  $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

  foreach ($listenerPid in $listeners) {
    if ($listenerPid -and $listenerPid -ne $PID) {
      Stop-Process -Id $listenerPid -Force -ErrorAction SilentlyContinue
    }
  }
} catch {
  Write-Host 'Could not inspect/kill existing Metro port listeners. Continuing.'
}

adb start-server | Out-Null
adb devices -l

adb reverse "tcp:$Port" "tcp:$Port" | Out-Null

# Restart Expo Go to ensure it reconnects to the latest Metro session.
adb shell am force-stop host.exp.exponent | Out-Null

$expoArgs = @('expo', 'start', '--android', '--port', "$Port")
if ($Clear.IsPresent) {
  $expoArgs += '--clear'
}

npx @expoArgs
