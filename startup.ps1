$ErrorActionPreference = 'Stop'

Write-Host "Step 1: Starting MongoDB and installing dependencies in parallel..."

$dockerProcess = Start-Process -FilePath "docker" -ArgumentList "compose", "up", "-d", "mongodb" -NoNewWindow -PassThru
$npmInstallProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "install" -NoNewWindow -PassThru

Wait-Process -Id $dockerProcess.Id
Wait-Process -Id $npmInstallProcess.Id

Write-Host "Step 2: Seeding locations..."
npm run seed

Write-Host "Step 3: Starting application..."
npm run dev
