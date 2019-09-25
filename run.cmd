@echo off
echo.
echo ------------------------------
echo Camelot Run Command
echo ------------------------------
echo.
echo.
echo If this is your first time running the program, this will take a few minutes...
echo.
echo.

echo Checking for NodeJs (Download if missing)
IF NOT EXIST NodeJs (
  mkdir NodeJs 
  curl https://nodejs.org/download/release/latest/win-x64/node.exe --output NodeJS/node.exe
  curl https://nodejs.org/download/release/latest/win-x64/node.exe --output NodeJS/node.lib
  curl http://nodejs.org/dist/npm/npm-1.4.9.zip --output NodeJs/npm.zip
  powershell.exe -NoP -NonI -Command "Expand-Archive '.\NodeJs\npm.zip' '.\NodeJs\'
  del NodeJS\npm.zip
  rem NodeJS/npm install npm@latest
)
echo.

echo Checking for Camelot (Download if missing)
IF NOT EXIST Camelot (
  mkdir Camelot
  curl http://cs.uky.edu/~sgware/projects/camelot/v0-3/Camelot%%20v0-3%%20Windows.zip --output Camelot/camelot.zip
  powershell.exe -NoP -NonI -Command "Expand-Archive '.\Camelot\camelot.zip' '.\Camelot\'
  del Camelot\camelot.zip
  move Camelot CamelotTemp
  move "CamelotTemp\Camelot v0-3 Windows" Camelot
  rmdir /s /q CamelotTemp
  del Camelot\StartExperienceManager.bat
  echo ..\NodeJs\node.exe ..\CamelotEnsemble\app.js > Camelot\StartExperienceManager.bat
)
echo.

echo Running Camelot!
cd Camelot
start Camelot.exe