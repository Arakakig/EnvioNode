@echo off
setlocal ENABLEDELAYEDEXPANSION
cd /d "%~dp0"

set "EXE=enviomsg.exe"
if not exist "%EXE%" (
  echo Nao encontrei %CD%\%EXE%. Gere o build primeiro: npm run build:exe
  pause
  exit /b 1
)

rem Se já vier predefinido, utiliza
if defined PUPPETEER_EXECUTABLE_PATH (
  if exist "%PUPPETEER_EXECUTABLE_PATH%" goto RUN
)

set "BROWSER="

rem 1) Procurar via Registro (Chrome/Edge em HKLM/HKCU incluindo Wow6432Node)
for %%K in (
  "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"
  "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"
  "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"
  "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"
  "HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"
  "HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"
) do (
  for /f "tokens=2,*" %%A in ('reg query %%~K /ve 2^>nul ^| findstr /ri "REG_SZ"') do (
    set "BROWSER=%%B"
  )
  if defined BROWSER goto FOUND
)

rem 2) Procurar no PATH
for /f "delims=" %%P in ('where chrome 2^>nul') do (
  if exist "%%~P" set "BROWSER=%%~P"
  if defined BROWSER goto FOUND
)
for /f "delims=" %%P in ('where msedge 2^>nul') do (
  if exist "%%~P" set "BROWSER=%%~P"
  if defined BROWSER goto FOUND
)

rem 3) Procurar em caminhos conhecidos
if not defined BROWSER set "BROWSER=C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
if not exist "%BROWSER%" set "BROWSER=C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
if not exist "%BROWSER%" set "BROWSER=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
if not exist "%BROWSER%" set "BROWSER=C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"

:FOUND
if not defined BROWSER (
  echo Nao foi possivel encontrar o Chrome/Edge instalado.
  echo Instale o Google Chrome ou Microsoft Edge, ou defina manualmente a variavel PUPPETEER_EXECUTABLE_PATH.
  echo Exemplo:
  echo   set PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe ^&^& %EXE%
  pause
  exit /b 1
)

set "PUPPETEER_EXECUTABLE_PATH=%BROWSER%"
echo Usando navegador: %PUPPETEER_EXECUTABLE_PATH%

:RUN
"%EXE%"
endlocal
exit /b 0


