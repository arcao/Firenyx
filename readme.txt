Prace se SVN firenyx a vyvoj ve firefoxu bez instalace:

V adresari, kde je nainstalovan firefox je adresar chrome, tedy treba:
> CD c:\Program Files\Mozilla Firefox\chrome\

vytvorte adresar firenyx:
> MKDIR firenyx

provedte checkout ze svn do adresare firenyx:
> SVN co http://tools.assembla.com/svn/firenyx/trunk firenyx

soubor firenyx\chrome-ff\firenyx.manifest je nutne zkopirovat do chrome adresare
firefoxu
> COPY firenyx\chrome-ff\firenyx.manifest firenyx.manifest

po restartu firefoxu jiz rozsireni firenyx funguje.

pro odstraneni firenyxu staci smazat soubor firenyx.manifest z chrome adresare
firefoxu


build firenyxu lze provest pres build.bat:
> build.bat <cislo_verze>
kde <cislo_verze> oznacuje verzi firenyxu (<cislo_verze> jen pojmenuje vysledny
soubor, proto je nutne pred buildenim modifikovat soubor install.rdf, pripadne
install.js)
vysledny xpi soubor se pak nachazi v adresari output

Poznamka:
Pokud se chcete odklonit od vyvojove verze a tvorit vlastni produkt, nezapomente
do install.rdf (a instal.js) vygenerovat vlastni guid, at se to netloukne, dik. 


  