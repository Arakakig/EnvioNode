@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias...
  call npm install --no-audit --no-fund --silent
  if errorlevel 1 (
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando servidor na porta 4006...
start "EnvioNode" cmd /k "npm start"

endlocal
exit /b 0
