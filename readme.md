# Firenyx

Firenyx je rozsireni do Mozilla Firefox, ktery umoznuje odesilat a upozornovat 
na novou postu na komunitnim serveru www.nyx.cz, ukazovat prihlasene pratele a i
ukazovat strom neprectenych klubu.

## Jak vyvíjet ve Firefoxu bez instalace

V adresari extensions ve vasem profilu Firefoxu, napr:

	cd "c:\Users\user\AppData\Roaming\Mozilla\Firefox\Profiles\u905xshw.default-1360700277389\extensions\

provedte checkout z gitu do adresare firenyx:

	git clone git@github.com:arcao/Firenyx.git firenyx

po restartu Firefoxu jiz rozsireni firenyx funguje.

## Sestaveni XPI instalacniho balicku

Pro sestaveni instalacniho balicku je pouzi Gradle build system. Sestaveni 
provedete pres prikaz:

	gradlew assemble
	
vysledny xpi soubor se pak nachazi v adresari `build\distributions`. Jmeno XPI
souboru obsahuje verzi, ktera je zjistena ze souboru `install.rdf`.

### Poznamka:
Pokud se chcete odklonit od vyvojove verze a tvorit vlastni produkt, nezapomente
do install.rdf vygenerovat vlastni guid, at se to netloukne. 


  