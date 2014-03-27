# Firenyx

Firenyx je rozšíøení do Mozilla Firefox, kterı umoòuje odesílat a upozoròovat 
na novou postu na komunitnim serveru www.nyx.cz, ukazovat pøihlášené pøátelé a i
strom nepøeètenıch klubù.

## Jak vyvíjet ve Firefoxu

V adresáøi extensions ve vašem profilu Firefoxu, napø.:

	cd "c:\Users\user\AppData\Roaming\Mozilla\Firefox\Profiles\u905xshw.default-1360700277389\extensions\

proveïte checkout Gitem do adresáøe `{5591137f-ca2c-4c2a-93d1-5514992b2d4a}` (guid
rozšíøení musí odpovídat tomu, co je install.rdf):

	git clone https://github.com/arcao/Firenyx.git "{5591137f-ca2c-4c2a-93d1-5514992b2d4a}"

po restartu Firefoxu ji rozšíøení Firenyx funguje.

## Sestavení XPI instalaèního balíèku

Pro sestavení instalaèního balíèku je pouit Gradle build systém. Sestavení 
provedete pøes pøíkaz:

	gradlew assemble
	
vıslednı xpi soubor se pak nachází v adresáøi `build\distributions`. Jméno XPI
souboru obsahuje verzi, která je získána ze souboru `install.rdf`.

#### Poznámka

Pokud se chcete odklonit od vıvojové verze a tvoøit vlastní produkt, nezapomeòte
do `install.rdf` vygenerovat vlastní guid, a se to netloukne. 


  