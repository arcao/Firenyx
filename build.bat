@echo off
REM
REM  syntaxe: build.bat <verze_rozsireni>
REM
REM pokud mate nekde jinde nainstalovany winrar, pak je nutna modifikace cesty
REM pro WINZIP by bylo nutne prepsat build skript (jine parametry, atd)
set winrar="c:\Program Files\WinRAR\winrar.exe"

set OUTPUT_ZIP="firenyx-%1.xpi"

ECHO # Mazu stare soubory...
MKDIR output >NUL
del /Q output\firenyx.jar output\%OUTPUT_ZIP% >NUL

ECHO # Komprimuji...
%winrar% a -eh -m5 -afzip output\firenyx.jar content locale
REM skin

CD output
%winrar% a -eh -m5 -afzip -apchrome %OUTPUT_ZIP% firenyx.jar
CD ..
%winrar% a -eh -m5 -afzip output\%OUTPUT_ZIP% defaults install.rdf install.js chrome.manifest

ECHO # Mazu docasne soubory...
del /Q output\firenyx.jar >NUL

ECHO # Tvorba verze %1 hotova!