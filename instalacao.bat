@echo off
setlocal ENABLEDELAYEDEXPANSION
title Instalação - EnvioNode
cd /d "%~dp0"

echo ======================================================
echo   Instalador do projeto EnvioNode
echo   Diretorio: %CD%
echo ======================================================
echo.

REM 1) Verifica Node.js
echo [1/4] Verificando Node.js...
node -v >nul 2>&1
if errorlevel 1 goto NONODE
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo    Node detectado: !NODE_VER!
echo.

REM 2) Instalar dependencias
echo [2/4] Instalando dependencias (npm install)...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo   Falha ao instalar dependencias. Verifique sua conexao e tente novamente.
  pause
  exit /b 1
)
echo    Dependencias instaladas com sucesso.
echo.

REM 3) Garantir pastas necessarias
echo [3/4] Verificando pastas necessarias...
if not exist sessions mkdir sessions
if not exist uploads mkdir uploads
echo    Pastas ok.
echo.

REM 4) Garantir arquivo de mensagens padrao
echo [4/4] Verificando arquivo de mensagens padrao...
if not exist "frontend\static\messages.json" (
  echo    Criando frontend\static\messages.json
  > "frontend\static\messages.json" (
    echo {"templates":[
    echo   {"id":"exemplo","label":"Exemplo","text":"Ola {nome_cliente}, esta e uma mensagem de exemplo."}
    echo ]}
  )
) else (
  echo    Arquivo de mensagens ja existe.
)
echo.

echo ======================================================
echo  Instalacao concluida com sucesso.
echo  Para iniciar o sistema: npm start
echo  Ou clique duas vezes em start-and-open.bat (se preferir abrir o navegador)
echo ======================================================
echo.
pause
exit /b 0

:NONODE
echo   Node.js nao encontrado no sistema.
echo   Instale o Node.js e rode este instalador novamente.
echo   Abrindo a pagina de download do Node.js...
start "" https://nodejs.org/en/download
pause
exit /b 1


